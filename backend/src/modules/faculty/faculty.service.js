import { pool } from '../../config/database.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
export async function getAllFaculty() {
    const [rows] = await pool.query('SELECT * FROM faculty ORDER BY created_at DESC');
    return rows;
}
export async function getFacultyById(id) {
    const [rows] = await pool.query('SELECT * FROM faculty WHERE id = ?', [id]);
    const list = rows;
    return list[0] || null;
}
export async function createFaculty(data) {
    const existing = await getFacultyById(data.id);
    if (existing) {
        throw new ConflictError(`Faculty with ID "${data.id}" already exists`);
    }
    await pool.query(`INSERT INTO faculty (id, name, subject, phone, email, salary, experience, qualification, photo_url) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        data.id,
        data.name,
        data.subject,
        data.phone || null,
        data.email || null,
        data.salary,
        data.experience || null,
        data.qualification || null,
        data.photoUrl || null,
    ]);
    return data;
}
export async function updateFaculty(id, data) {
    const existing = await getFacultyById(id);
    if (!existing) {
        throw new NotFoundError(`Faculty with ID "${id}" not found`);
    }
    const columnMap = {
        name: 'name',
        subject: 'subject',
        phone: 'phone',
        email: 'email',
        salary: 'salary',
        experience: 'experience',
        qualification: 'qualification',
        photoUrl: 'photo_url',
    };
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && columnMap[key]) {
            fields.push(`${columnMap[key]} = ?`);
            values.push(value);
        }
    }
    if (fields.length === 0) {
        return existing;
    }
    values.push(id);
    const query = `UPDATE faculty SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(query, values);
    return getFacultyById(id);
}
export async function deleteFaculty(id) {
    const existing = await getFacultyById(id);
    if (!existing) {
        throw new NotFoundError(`Faculty with ID "${id}" not found`);
    }
    // Check if faculty is linked to any batches
    const [batches] = await pool.query('SELECT COUNT(*) as count FROM batches WHERE faculty_id = ?', [id]);
    if (batches[0]?.count > 0) {
        throw new ConflictError('Cannot delete faculty: they are assigned to active batches');
    }
    await pool.query('DELETE FROM faculty WHERE id = ?', [id]);
}
