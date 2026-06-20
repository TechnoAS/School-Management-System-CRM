import { pool } from '../../config/database.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
export async function getAllCertificates() {
    const [rows] = await pool.query(`
    SELECT cert.cert_no as certNo, cert.grade, cert.issue_date as issueDate, cert.authorised_by as authorisedBy, cert.created_at as createdAt,
           cert.student_id as studentId, s.name as studentName,
           cert.course_id as courseId, c.name as courseName
    FROM certificates cert
    JOIN students s ON cert.student_id = s.id
    JOIN courses c ON cert.course_id = c.id
    ORDER BY cert.created_at DESC
  `);
    return rows;
}
export async function getCertificateByNo(certNo) {
    const [rows] = await pool.query(`
    SELECT cert.cert_no as certNo, cert.grade, cert.issue_date as issueDate, cert.authorised_by as authorisedBy, cert.created_at as createdAt,
           cert.student_id as studentId, s.name as studentName, s.email as studentEmail,
           cert.course_id as courseId, c.name as courseName, c.duration as courseDuration
    FROM certificates cert
    JOIN students s ON cert.student_id = s.id
    JOIN courses c ON cert.course_id = c.id
    WHERE cert.cert_no = ?
  `, [certNo]);
    const list = rows;
    return list[0] || null;
}
export async function createCertificate(data) {
    // Verify student exists
    const [students] = await pool.query('SELECT id FROM students WHERE id = ? AND status != \'Deleted\'', [data.studentId]);
    if (students.length === 0) {
        throw new NotFoundError(`Student with ID "${data.studentId}" not found`);
    }
    // Verify course exists
    const [courses] = await pool.query('SELECT id FROM courses WHERE id = ?', [data.courseId]);
    if (courses.length === 0) {
        throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
    }
    let certNo = '';
    let isUnique = false;
    let attempts = 0;
    // Generate unique cert number
    while (!isUnique && attempts < 5) {
        certNo = `CERT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const [existing] = await pool.query('SELECT cert_no FROM certificates WHERE cert_no = ?', [certNo]);
        if (existing.length === 0) {
            isUnique = true;
        }
        attempts++;
    }
    if (!isUnique) {
        throw new ConflictError('Failed to generate a unique certificate number. Please try again.');
    }
    await pool.query(`INSERT INTO certificates (cert_no, student_id, course_id, grade, issue_date, authorised_by)
     VALUES (?, ?, ?, ?, ?, ?)`, [certNo, data.studentId, data.courseId, data.grade, data.issueDate, data.authorisedBy]);
    return getCertificateByNo(certNo);
}
