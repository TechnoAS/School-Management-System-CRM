import { pool } from '../../config/database.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
export async function getStudentsList(filters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const whereClauses = ["s.status != 'Deleted'"];
    const params = [];
    if (filters.search) {
        whereClauses.push('(s.name LIKE ? OR s.email LIKE ? OR s.phone LIKE ? OR s.id LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (filters.course) {
        whereClauses.push('s.course_id = ?');
        params.push(filters.course);
    }
    if (filters.status) {
        whereClauses.push('s.status = ?');
        params.push(filters.status);
    }
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    // 1. Get count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM students s ${whereSql}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0]?.total || 0;
    // 2. Get paginated students
    const selectQuery = `
    SELECT s.id, s.name, s.phone, s.email, s.status, s.admission_date, s.fees_total, s.fees_paid, s.photo_url,
           s.course_id, c.name as course_name,
           s.batch_id, b.name as batch_name
    FROM students s
    JOIN courses c ON s.course_id = c.id
    LEFT JOIN batches b ON s.batch_id = b.id
    ${whereSql}
    ORDER BY s.created_at DESC
    LIMIT ? OFFSET ?
  `;
    // express-mysql2 needs numbers for limit/offset, let's append to params
    params.push(limit, offset);
    const [students] = await pool.query(selectQuery, params);
    return {
        students: students,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
export async function getStudentById(id) {
    const [rows] = await pool.query(`
    SELECT s.*, c.name as course_name, b.name as batch_name
    FROM students s
    JOIN courses c ON s.course_id = c.id
    LEFT JOIN batches b ON s.batch_id = b.id
    WHERE s.id = ? AND s.status != 'Deleted'
  `, [id]);
    const students = rows;
    return students[0] || null;
}
export async function createStudent(data) {
    const existing = await getStudentById(data.id);
    if (existing) {
        throw new ConflictError(`Student with ID "${data.id}" already exists`);
    }
    // Verify course
    const [courses] = await pool.query('SELECT id FROM courses WHERE id = ?', [data.courseId]);
    if (courses.length === 0) {
        throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
    }
    // Verify batch if provided
    if (data.batchId) {
        const [batches] = await pool.query('SELECT id FROM batches WHERE id = ?', [data.batchId]);
        if (batches.length === 0) {
            throw new NotFoundError(`Batch with ID "${data.batchId}" not found`);
        }
    }
    await pool.query(`INSERT INTO students (id, name, phone, email, course_id, batch_id, guardian, guardian_phone, address, admission_date, fees_total, fees_paid, status, dob, grade, photo_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        data.id,
        data.name,
        data.phone || null,
        data.email || null,
        data.courseId,
        data.batchId || null,
        data.guardian || null,
        data.guardianPhone || null,
        data.address || null,
        data.admissionDate,
        data.feesTotal,
        data.feesPaid,
        data.status,
        data.dob || null,
        data.grade || null,
        data.photoUrl || null,
    ]);
    return getStudentById(data.id);
}
export async function updateStudent(id, data) {
    const existing = await getStudentById(id);
    if (!existing) {
        throw new NotFoundError(`Student with ID "${id}" not found`);
    }
    // Verify course if updating
    if (data.courseId) {
        const [courses] = await pool.query('SELECT id FROM courses WHERE id = ?', [data.courseId]);
        if (courses.length === 0) {
            throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
        }
    }
    // Verify batch if updating
    if (data.batchId) {
        const [batches] = await pool.query('SELECT id FROM batches WHERE id = ?', [data.batchId]);
        if (batches.length === 0) {
            throw new NotFoundError(`Batch with ID "${data.batchId}" not found`);
        }
    }
    const fields = [];
    const values = [];
    const mapping = {
        name: 'name',
        phone: 'phone',
        email: 'email',
        courseId: 'course_id',
        batchId: 'batch_id',
        guardian: 'guardian',
        guardianPhone: 'guardian_phone',
        address: 'address',
        admissionDate: 'admission_date',
        feesTotal: 'fees_total',
        feesPaid: 'fees_paid',
        status: 'status',
        dob: 'dob',
        grade: 'grade',
        photoUrl: 'photo_url',
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
    const query = `UPDATE students SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(query, values);
    return getStudentById(id);
}
export async function deleteStudentSoft(id) {
    const existing = await getStudentById(id);
    if (!existing) {
        throw new NotFoundError(`Student with ID "${id}" not found`);
    }
    await pool.query("UPDATE students SET status = 'Deleted' WHERE id = ?", [id]);
}
