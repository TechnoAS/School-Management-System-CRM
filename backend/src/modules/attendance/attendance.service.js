import { pool } from '../../config/database.js';
export async function getAttendance(batchId, date) {
    // Return students of the batch joined with their attendance record for that date
    const [rows] = await pool.query(`SELECT s.id as studentId, s.name as studentName,
            ar.status, ar.marked_by as markedBy, ar.created_at as createdAt
     FROM students s
     LEFT JOIN attendance_records ar 
       ON s.id = ar.student_id AND ar.batch_id = ? AND ar.record_date = ?
     WHERE s.batch_id = ? AND s.status != 'Deleted'
     ORDER BY s.name ASC`, [batchId, date, batchId]);
    return rows;
}
export async function upsertAttendance(data, markedBy) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        for (const record of data.records) {
            const recordId = `${record.studentId}_${data.batchId}_${data.date}`;
            await connection.query(`INSERT INTO attendance_records (id, student_id, batch_id, record_date, status, marked_by)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)`, [recordId, record.studentId, data.batchId, data.date, record.status, markedBy]);
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
/** Flat attendance rows for sync (last N months). */
export async function listAttendanceRecords(months = 12) {
    const safeMonths = Math.min(Math.max(Number(months) || 12, 1), 24);
    const [rows] = await pool.query(`SELECT ar.student_id AS studentId,
            ar.batch_id AS batchId,
            b.name AS batchName,
            ar.record_date AS recordDate,
            ar.status
     FROM attendance_records ar
     INNER JOIN batches b ON b.id = ar.batch_id
     WHERE ar.record_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
     ORDER BY ar.record_date DESC, ar.student_id ASC`, [safeMonths]);
    return rows;
}
export async function getAttendanceReport(batchId, month) {
    // Month format: 'YYYY-MM'
    const monthPattern = `${month}-%`;
    // Get total counts per status in the month
    const [summaryRows] = await pool.query(`SELECT ar.status, COUNT(*) as count
     FROM attendance_records ar
     WHERE ar.batch_id = ? AND ar.record_date LIKE ?
     GROUP BY ar.status`, [batchId, monthPattern]);
    // Get student-wise attendance counts
    const [studentRows] = await pool.query(`SELECT s.id as studentId, s.name as studentName,
            SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent,
            SUM(CASE WHEN ar.status = 'leave' THEN 1 ELSE 0 END) as leave_count,
            COUNT(ar.id) as totalClasses
     FROM students s
     LEFT JOIN attendance_records ar ON s.id = ar.student_id AND ar.batch_id = ? AND ar.record_date LIKE ?
     WHERE s.batch_id = ? AND s.status != 'Deleted'
     GROUP BY s.id, s.name
     ORDER BY s.name ASC`, [batchId, monthPattern, batchId]);
    const summary = {
        present: 0,
        absent: 0,
        leave: 0,
    };
    summaryRows.forEach((row) => {
        if (row.status === 'present')
            summary.present = row.count;
        else if (row.status === 'absent')
            summary.absent = row.count;
        else if (row.status === 'leave')
            summary.leave = row.count;
    });
    return {
        summary,
        students: studentRows.map((row) => ({
            studentId: row.studentId,
            studentName: row.studentName,
            present: parseInt(row.present, 10) || 0,
            absent: parseInt(row.absent, 10) || 0,
            leave: parseInt(row.leave_count, 10) || 0,
            totalClasses: parseInt(row.totalClasses, 10) || 0,
        })),
    };
}
