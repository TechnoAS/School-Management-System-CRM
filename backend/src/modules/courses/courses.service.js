import { pool } from '../../config/database.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
export async function getAllCourses() {
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    return rows;
}
export async function getCourseById(id) {
    const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    const courses = rows;
    return courses[0] || null;
}
export async function getCourseStats(id) {
    const [[batchRow]] = await pool.query("SELECT COUNT(*) as activeBatches FROM batches WHERE course_id = ? AND status = 'Ongoing'", [id]);
    const [[studentRow]] = await pool.query("SELECT COUNT(*) as activeStudents FROM students WHERE course_id = ? AND status = 'Active'", [id]);
    return {
        activeBatches: batchRow?.activeBatches || 0,
        activeStudents: studentRow?.activeStudents || 0,
    };
}
export async function createCourse(data) {
    const existing = await getCourseById(data.id);
    if (existing) {
        throw new ConflictError(`Course with ID "${data.id}" already exists`);
    }
    await pool.query('INSERT INTO courses (id, name, duration, fees, description, status) VALUES (?, ?, ?, ?, ?, ?)', [data.id, data.name, data.duration, data.fees, data.description || null, data.status]);
    return data;
}
export async function updateCourse(id, data) {
    const existing = await getCourseById(id);
    if (!existing) {
        throw new NotFoundError(`Course with ID "${id}" not found`);
    }
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    }
    if (fields.length === 0) {
        return existing;
    }
    values.push(id);
    const query = `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(query, values);
    return { ...existing, ...data };
}
export async function deleteCourse(id) {
    const existing = await getCourseById(id);
    if (!existing) {
        throw new NotFoundError(`Course with ID "${id}" not found`);
    }
    // Check if course has any batches
    const [batches] = await pool.query('SELECT COUNT(*) as count FROM batches WHERE course_id = ?', [id]);
    if (batches[0]?.count > 0) {
        throw new ConflictError('Cannot delete course: active batches are linked to it');
    }
    // Check if course has any students
    const [students] = await pool.query('SELECT COUNT(*) as count FROM students WHERE course_id = ?', [id]);
    if (students[0]?.count > 0) {
        throw new ConflictError('Cannot delete course: enrolled students are linked to it');
    }
    await pool.query('DELETE FROM courses WHERE id = ?', [id]);
}
