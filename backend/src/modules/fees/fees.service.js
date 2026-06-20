import { pool } from '../../config/database.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
export async function getDueStudents() {
    const [rows] = await pool.query(`
    SELECT s.id as studentId, s.name as studentName, s.phone, s.email,
           s.fees_total as feesTotal, s.fees_paid as feesPaid,
           (s.fees_total - s.fees_paid) as feesDue,
           s.course_id as courseId, c.name as courseName,
           s.batch_id as batchId, b.name as batchName
    FROM students s
    JOIN courses c ON s.course_id = c.id
    LEFT JOIN batches b ON s.batch_id = b.id
    WHERE s.fees_total > s.fees_paid AND s.status != 'Deleted'
    ORDER BY feesDue DESC
  `);
    return rows;
}
export async function getPaymentHistory() {
    const [rows] = await pool.query(`
    SELECT p.receipt, p.amount, p.mode, p.pay_date as payDate, p.remarks, p.created_at as createdAt,
           p.student_id as studentId, s.name as studentName
    FROM payments p
    JOIN students s ON p.student_id = s.id
    ORDER BY p.pay_date DESC, p.created_at DESC
  `);
    return rows;
}
export async function getPaymentByReceipt(receipt) {
    const [rows] = await pool.query(`
    SELECT p.receipt, p.amount, p.mode, p.pay_date as payDate, p.remarks, p.created_at as createdAt,
           p.student_id as studentId, s.name as studentName, s.email as studentEmail,
           s.course_id as courseId, c.name as courseName,
           u.name as collectorName
    FROM payments p
    JOIN students s ON p.student_id = s.id
    JOIN courses c ON s.course_id = c.id
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.receipt = ?
  `, [receipt]);
    const list = rows;
    return list[0] || null;
}
export async function collectFee(data, createdBy) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        // 1. Lock student row for update
        const [students] = await connection.query('SELECT id, name, fees_total, fees_paid FROM students WHERE id = ? AND status != \'Deleted\' FOR UPDATE', [data.studentId]);
        const student = students[0];
        if (!student) {
            throw new NotFoundError(`Student with ID "${data.studentId}" not found`);
        }
        // 2. Generate unique receipt ID
        let receiptId = '';
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
            receiptId = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
            const [existing] = await connection.query('SELECT receipt FROM payments WHERE receipt = ?', [receiptId]);
            if (existing.length === 0) {
                isUnique = true;
            }
            attempts++;
        }
        if (!isUnique) {
            throw new ConflictError('Failed to generate a unique receipt code. Please try again.');
        }
        // 3. Insert payment
        await connection.query(`INSERT INTO payments (receipt, student_id, amount, mode, pay_date, remarks, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            receiptId,
            data.studentId,
            data.amount,
            data.mode,
            data.payDate,
            data.remarks || null,
            createdBy,
        ]);
        // 4. Update student's paid fees
        await connection.query('UPDATE students SET fees_paid = fees_paid + ? WHERE id = ?', [data.amount, data.studentId]);
        await connection.commit();
        return {
            receipt: receiptId,
            studentId: data.studentId,
            studentName: student.name,
            amount: data.amount,
            mode: data.mode,
            payDate: data.payDate,
        };
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
