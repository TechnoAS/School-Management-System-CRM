import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import { Certificate } from '../../models/Certificate.js';
import { Student } from '../../models/Student.js';
import { Course } from '../../models/Course.js';

export async function getAllCertificates() {
    const certificates = await Certificate.find()
        .populate('student', 'name')
        .populate('course', 'name')
        .sort({ created_at: -1 })
        .lean();
        
    return certificates.map(c => ({
        certNo: c.cert_no,
        grade: c.grade,
        issueDate: c.issue_date,
        authorisedBy: c.authorised_by,
        createdAt: c.created_at,
        studentId: c.student?.id || c.student_id,
        studentName: c.student?.name,
        courseId: c.course?.id || c.course_id,
        courseName: c.course?.name,
    }));
}

export async function getCertificateByNo(certNo) {
    const c = await Certificate.findOne({ cert_no: certNo })
        .populate('student', 'name email')
        .populate('course', 'name duration')
        .lean();
        
    if (!c) return null;
    
    return {
        certNo: c.cert_no,
        grade: c.grade,
        issueDate: c.issue_date,
        authorisedBy: c.authorised_by,
        createdAt: c.created_at,
        studentId: c.student?.id || c.student_id,
        studentName: c.student?.name,
        studentEmail: c.student?.email,
        courseId: c.course?.id || c.course_id,
        courseName: c.course?.name,
        courseDuration: c.course?.duration,
    };
}

export async function createCertificate(data) {
    const student = await Student.findOne({ id: data.studentId, status: { $ne: 'Deleted' } });
    if (!student) {
        throw new NotFoundError(`Student with ID "${data.studentId}" not found`);
    }
    
    const course = await Course.findOne({ id: data.courseId });
    if (!course) {
        throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
    }
    
    let certNo = '';
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 5) {
        certNo = `CERT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const existing = await Certificate.findOne({ cert_no: certNo });
        if (!existing) {
            isUnique = true;
        }
        attempts++;
    }
    
    if (!isUnique) {
        throw new ConflictError('Failed to generate a unique certificate number. Please try again.');
    }
    
    await Certificate.create({
        cert_no: certNo,
        student_id: data.studentId,
        course_id: data.courseId,
        grade: data.grade,
        issue_date: data.issueDate,
        authorised_by: data.authorisedBy,
    });
    
    return getCertificateByNo(certNo);
}
