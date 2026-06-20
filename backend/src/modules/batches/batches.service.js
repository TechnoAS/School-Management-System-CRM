import { pool } from '../../config/database.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
export async function getAllBatches() {
    const [rows] = await pool.query(`
    SELECT b.id, b.name, b.timing, b.status, b.start_date, b.end_date,
           b.course_id, c.name as course_name,
           b.faculty_id, f.name as faculty_name
    FROM batches b
    JOIN courses c ON b.course_id = c.id
    LEFT JOIN faculty f ON b.faculty_id = f.id
    ORDER BY b.start_date DESC
  `);
    return rows;
}
export async function getBatchById(id) {
    const [rows] = await pool.query(`
    SELECT b.id, b.name, b.timing, b.status, b.start_date, b.end_date,
           b.course_id, c.name as course_name,
           b.faculty_id, f.name as faculty_name
    FROM batches b
    JOIN courses c ON b.course_id = c.id
    LEFT JOIN faculty f ON b.faculty_id = f.id
    WHERE b.id = ?
  `, [id]);
    const batches = rows;
    return batches[0] || null;
}
export async function getBatchStudents(batchId) {
    const [rows] = await pool.query('SELECT id, name, phone, email, status, photo_url FROM students WHERE batch_id = ? ORDER BY name ASC', [batchId]);
    return rows;
}
export async function createBatch(data) {
    const existing = await getBatchById(data.id);
    if (existing) {
        throw new ConflictError(`Batch with ID "${data.id}" already exists`);
    }
    // Verify course exists
    const [courses] = await pool.query('SELECT id FROM courses WHERE id = ?', [data.courseId]);
    if (courses.length === 0) {
        throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
    }
    // Verify faculty exists if provided
    if (data.facultyId) {
        const [faculties] = await pool.query('SELECT id FROM faculty WHERE id = ?', [data.facultyId]);
        if (faculties.length === 0) {
            throw new NotFoundError(`Faculty with ID "${data.facultyId}" not found`);
        }
    }
    await pool.query(`INSERT INTO batches (id, course_id, name, timing, faculty_id, status, start_date, end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        data.id,
        data.courseId,
        data.name,
        data.timing,
        data.facultyId || null,
        data.status,
        data.startDate,
        data.endDate,
    ]);
    return data;
}
export async function updateBatch(id, data) {
    const existing = await getBatchById(id);
    if (!existing) {
        throw new NotFoundError(`Batch with ID "${id}" not found`);
    }
    // Verify course if updating
    if (data.courseId) {
        const [courses] = await pool.query('SELECT id FROM courses WHERE id = ?', [data.courseId]);
        if (courses.length === 0) {
            throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
        }
    }
    // Verify faculty if updating
    if (data.facultyId) {
        const [faculties] = await pool.query('SELECT id FROM faculty WHERE id = ?', [data.facultyId]);
        if (faculties.length === 0) {
            throw new NotFoundError(`Faculty with ID "${data.facultyId}" not found`);
        }
    }
    const fields = [];
    const values = [];
    const mapping = {
        courseId: 'course_id',
        name: 'name',
        timing: 'timing',
        facultyId: 'faculty_id',
        status: 'status',
        startDate: 'start_date',
        endDate: 'end_date',
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
    const query = `UPDATE batches SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(query, values);
    return getBatchById(id);
}
export async function deleteBatch(id) {
    const existing = await getBatchById(id);
    if (!existing) {
        throw new NotFoundError(`Batch with ID "${id}" not found`);
    }
    // Check if batch has enrolled students
    const [students] = await pool.query('SELECT COUNT(*) as count FROM students WHERE batch_id = ?', [id]);
    if (students[0]?.count > 0) {
        throw new ConflictError('Cannot delete batch: active students are enrolled in it');
    }
    await pool.query('DELETE FROM batches WHERE id = ?', [id]);
}
