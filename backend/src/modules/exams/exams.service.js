import { randomUUID } from 'crypto';
import { pool } from '../../config/database.js';
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors/app-error.js';
export async function getAllExams() {
    const [rows] = await pool.query(`
    SELECT e.id, e.title, e.exam_date as examDate, e.max_marks as maxMarks, e.status,
           e.course_id as courseId, c.name as courseName,
           e.batch_id as batchId, b.name as batchName
    FROM exams e
    JOIN courses c ON e.course_id = c.id
    JOIN batches b ON e.batch_id = b.id
    ORDER BY e.exam_date DESC
  `);
    return rows;
}
export async function getExamById(id) {
    const [rows] = await pool.query(`
    SELECT e.id, e.title, e.exam_date as examDate, e.max_marks as maxMarks, e.status,
           e.course_id as courseId, c.name as courseName,
           e.batch_id as batchId, b.name as batchName
    FROM exams e
    JOIN courses c ON e.course_id = c.id
    JOIN batches b ON e.batch_id = b.id
    WHERE e.id = ?
  `, [id]);
    const list = rows;
    return list[0] || null;
}
export async function createExam(data) {
    const existing = await getExamById(data.id);
    if (existing) {
        throw new ConflictError(`Exam with ID "${data.id}" already exists`);
    }
    // Verify course and batch exist
    const [courses] = await pool.query('SELECT id FROM courses WHERE id = ?', [data.courseId]);
    if (courses.length === 0) {
        throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
    }
    const [batches] = await pool.query('SELECT id FROM batches WHERE id = ?', [data.batchId]);
    if (batches.length === 0) {
        throw new NotFoundError(`Batch with ID "${data.batchId}" not found`);
    }
    await pool.query(`INSERT INTO exams (id, title, course_id, batch_id, exam_date, max_marks, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [data.id, data.title, data.courseId, data.batchId, data.examDate, data.maxMarks, data.status]);
    return data;
}
export async function updateExam(id, data) {
    const existing = await getExamById(id);
    if (!existing) {
        throw new NotFoundError(`Exam with ID "${id}" not found`);
    }
    const fields = [];
    const values = [];
    const mapping = {
        title: 'title',
        courseId: 'course_id',
        batchId: 'batch_id',
        examDate: 'exam_date',
        maxMarks: 'max_marks',
        status: 'status',
    };
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            const dbCol = mapping[key];
            if (dbCol) {
                fields.push(`${dbCol} = ?`);
                values.push(value);
            }
        }
    }
    if (fields.length === 0) {
        return existing;
    }
    values.push(id);
    const query = `UPDATE exams SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(query, values);
    return getExamById(id);
}
export async function deleteExam(id) {
    const existing = await getExamById(id);
    if (!existing) {
        throw new NotFoundError(`Exam with ID "${id}" not found`);
    }
    await pool.query('DELETE FROM exams WHERE id = ?', [id]);
}
export async function getExamMarksList(examId) {
    const exam = await getExamById(examId);
    if (!exam) {
        throw new NotFoundError(`Exam with ID "${examId}" not found`);
    }
    const [rows] = await pool.query(`SELECT s.id as studentId, s.name as studentName,
            em.marks, em.id as markRecordId
     FROM students s
     JOIN exams e ON e.batch_id = s.batch_id
     LEFT JOIN exam_marks em ON e.id = em.exam_id AND s.id = em.student_id
     WHERE e.id = ? AND s.status != 'Deleted'
     ORDER BY s.name ASC`, [examId]);
    return rows;
}
export async function saveExamMarks(examId, data) {
    const exam = await getExamById(examId);
    if (!exam) {
        throw new NotFoundError(`Exam with ID "${examId}" not found`);
    }
    // Validate marks do not exceed max_marks
    for (const record of data.marks) {
        if (record.marks > exam.maxMarks) {
            throw new ValidationError(`Marks for student "${record.studentId}" cannot exceed maximum exam marks (${exam.maxMarks})`);
        }
    }
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        for (const record of data.marks) {
            const markId = randomUUID();
            await connection.query(`INSERT INTO exam_marks (id, exam_id, student_id, marks)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE marks = VALUES(marks)`, [markId, examId, record.studentId, record.marks]);
        }
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
export async function getExamResultsDetails(examId) {
    const exam = await getExamById(examId);
    if (!exam) {
        throw new NotFoundError(`Exam with ID "${examId}" not found`);
    }
    // Get marks records
    const [marks] = await pool.query(`SELECT s.id as studentId, s.name as studentName, em.marks
     FROM exam_marks em
     JOIN students s ON em.student_id = s.id
     WHERE em.exam_id = ? AND s.status != 'Deleted'
     ORDER BY em.marks DESC`, [examId]);
    // Calculate statistics
    let highest = 0;
    let totalMarks = 0;
    let count = marks.length;
    marks.forEach((row) => {
        if (row.marks > highest)
            highest = row.marks;
        totalMarks += row.marks;
    });
    const average = count > 0 ? parseFloat((totalMarks / count).toFixed(2)) : 0;
    return {
        exam,
        stats: {
            totalGraded: count,
            highestMarks: highest,
            averageMarks: average,
        },
        results: marks,
    };
}
