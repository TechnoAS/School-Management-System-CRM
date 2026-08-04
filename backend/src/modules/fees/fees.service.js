import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors/app-error.js';
import { Payment } from '../../models/Payment.js';
import { Student } from '../../models/Student.js';

export async function getDueStudents() {
    const students = await Student.find({ status: { $ne: 'Deleted' } })
        .populate('course', 'name')
        .populate('batch', 'name')
        .lean();
        
    const due = students
        .filter(s => s.fees_total > s.fees_paid)
        .map(s => ({
            studentId: s.id,
            studentName: s.name,
            phone: s.phone,
            email: s.email,
            feesTotal: s.fees_total,
            feesPaid: s.fees_paid,
            feesDue: s.fees_total - s.fees_paid,
            courseId: s.course?.id || s.course_id,
            courseName: s.course?.name,
            batchId: s.batch?.id || s.batch_id,
            batchName: s.batch?.name,
        }))
        .sort((a, b) => b.feesDue - a.feesDue);
        
    return due;
}

export async function getPaymentHistory() {
    const payments = await Payment.find()
        .populate('creator', 'name')
        .sort({ created_at: -1 })
        .lean();

    return payments.map(p => ({
        id: p.id,
        receiptNumber: p.receipt_number,
        studentName: p.student?.name,
        amount: p.amount,
        paymentMethod: p.payment_method,
        date: p.payment_date,
        status: p.status,
        collectorName: p.creator?.name,
        studentId: p.student?.id || p.student_id,
        studentName: p.student?.name,
    }));
}

export async function getPaymentByReceipt(receipt) {
    const p = await Payment.findOne({ receipt })
        .populate({
            path: 'student',
            select: 'name email course',
            populate: { path: 'course', select: 'name' }
        })
        .populate('creator', 'name')
        .lean();
        
    if (!p) return null;
    
    return {
        receipt: p.receipt,
        amount: p.amount,
        mode: p.mode,
        payDate: p.pay_date,
        remarks: p.remarks,
        createdAt: p.created_at,
        studentId: p.student?.id || p.student_id,
        studentName: p.student?.name,
        studentEmail: p.student?.email,
        courseId: p.student?.course?.id || p.student?.course_id,
        courseName: p.student?.course?.name,
        collectorName: p.created_by?.name,
    };
}

export async function collectFee(data, createdBy) {
    const student = await Student.findOne({ id: data.studentId, status: { $ne: 'Deleted' } });
    if (!student) {
        throw new NotFoundError(`Student with ID "${data.studentId}" not found`);
    }
    
    const newTotal = student.fees_paid + data.amount;
    if (newTotal > student.fees_total) {
        throw new ValidationError(
            `Payment of ${data.amount} would exceed the total fee of ${student.fees_total}. ` +
            `Outstanding balance is ${(student.fees_total - student.fees_paid).toFixed(2)}.`
        );
    }
    
    let receiptId = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
        receiptId = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const existing = await Payment.findOne({ receipt: receiptId });
        if (!existing) {
            isUnique = true;
        }
        attempts++;
    }
    
    if (!isUnique) {
        throw new ConflictError('Failed to generate a unique receipt code. Please try again.');
    }
    
    await Payment.create({
        receipt: receiptId,
        student_id: data.studentId,
        amount: data.amount,
        mode: data.mode,
        pay_date: data.payDate,
        remarks: data.remarks || null,
        created_by: createdBy,
    });
    
    await Student.updateOne({ id: data.studentId }, { $inc: { fees_paid: data.amount } });
    
    return {
        receipt: receiptId,
        studentId: data.studentId,
        studentName: student.name,
        amount: data.amount,
        mode: data.mode,
        payDate: data.payDate,
    };
}
