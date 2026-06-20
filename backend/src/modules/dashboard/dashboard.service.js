import { pool } from '../../config/database.js';
function inferClassStatus(timing) {
    const match = timing.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match)
        return 'Upcoming';
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hour < 12)
        hour += 12;
    if (meridiem === 'AM' && hour === 12)
        hour = 0;
    const start = new Date();
    start.setHours(hour, minute, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 3);
    const now = new Date();
    if (now >= start && now <= end)
        return 'Ongoing';
    if (now > end)
        return 'Completed';
    return 'Upcoming';
}
export async function getKPIs() {
    const [[studentsRow]] = await pool.query("SELECT COUNT(*) as count FROM students WHERE status != 'Deleted'");
    const [[activeStudentsRow]] = await pool.query("SELECT COUNT(*) as count FROM students WHERE status = 'Active'");
    const [[newAdmissionsRow]] = await pool.query(`SELECT COUNT(*) as count FROM students
     WHERE status != 'Deleted'
       AND YEAR(admission_date) = YEAR(CURDATE())
       AND MONTH(admission_date) = MONTH(CURDATE())`);
    const [[feesDueRow]] = await pool.query(`SELECT COALESCE(SUM(GREATEST(0, fees_total - fees_paid)), 0) as total
     FROM students WHERE status != 'Deleted'`);
    const [[feesCollectedRow]] = await pool.query(`SELECT COALESCE(SUM(fees_paid), 0) as total FROM students WHERE status != 'Deleted'`);
    const [[studentsWithFeesDueRow]] = await pool.query(`SELECT COUNT(*) as count FROM students
     WHERE status != 'Deleted' AND fees_paid < fees_total`);
    const [[totalCoursesRow]] = await pool.query('SELECT COUNT(*) as count FROM courses');
    const [[activeCoursesRow]] = await pool.query("SELECT COUNT(*) as count FROM courses WHERE status = 'Active'");
    const [[upcomingBatchesRow]] = await pool.query("SELECT COUNT(*) as count FROM batches WHERE status = 'Upcoming'");
    const [[ongoingBatchesRow]] = await pool.query("SELECT COUNT(*) as count FROM batches WHERE status = 'Ongoing'");
    const [[facultyRow]] = await pool.query('SELECT COUNT(*) as count FROM faculty');
    const [[revenueRow]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments');
    const todayClasses = await getTodayClasses();
    const ongoingClassesNow = todayClasses.filter((c) => c.status === 'Ongoing').length;
    return {
        totalStudents: studentsRow?.count || 0,
        activeStudents: activeStudentsRow?.count || 0,
        newAdmissionsThisMonth: newAdmissionsRow?.count || 0,
        feesDue: parseFloat(feesDueRow?.total) || 0,
        feesCollected: parseFloat(feesCollectedRow?.total) || 0,
        studentsWithFeesDue: studentsWithFeesDueRow?.count || 0,
        totalCourses: totalCoursesRow?.count || 0,
        activeCourses: activeCoursesRow?.count || 0,
        upcomingBatches: upcomingBatchesRow?.count || 0,
        ongoingBatches: ongoingBatchesRow?.count || 0,
        todayClassesCount: todayClasses.length,
        ongoingClassesNow,
        totalFaculty: facultyRow?.count || 0,
        totalRevenue: parseFloat(revenueRow?.total) || 0,
    };
}
export async function getEnrollmentTrend() {
    const [rows] = await pool.query(`
    SELECT DATE_FORMAT(admission_date, '%Y-%m') as month, COUNT(*) as count
    FROM students
    WHERE status != 'Deleted'
    GROUP BY month
    ORDER BY month ASC
    LIMIT 12
  `);
    return rows;
}
export async function getFeeTrend() {
    const [collectedRows] = await pool.query(`
    SELECT DATE_FORMAT(pay_date, '%Y-%m') as month, COALESCE(SUM(amount), 0) as collected
    FROM payments
    GROUP BY month
    ORDER BY month ASC
    LIMIT 12
  `);
    const [dueRows] = await pool.query(`
    SELECT DATE_FORMAT(admission_date, '%Y-%m') as month,
           COALESCE(SUM(GREATEST(0, fees_total - fees_paid)), 0) as due
    FROM students
    WHERE status != 'Deleted'
    GROUP BY month
    ORDER BY month ASC
    LIMIT 12
  `);
    const dueByMonth = new Map(dueRows.map((r) => [r.month, parseFloat(String(r.due)) || 0]));
    const collectedByMonth = new Map(collectedRows.map((r) => [
        r.month,
        parseFloat(String(r.collected)) || 0,
    ]));
    const months = [...new Set([...dueByMonth.keys(), ...collectedByMonth.keys()])].sort();
    return months.slice(-12).map((month) => ({
        month,
        collected: collectedByMonth.get(month) ?? 0,
        due: dueByMonth.get(month) ?? 0,
    }));
}
export async function getCourseEnrollment() {
    const [rows] = await pool.query(`
    SELECT c.name, COUNT(s.id) as count
    FROM courses c
    LEFT JOIN students s ON s.course_id = c.id AND s.status NOT IN ('Deleted', 'Inactive')
    GROUP BY c.id, c.name
    HAVING count > 0
    ORDER BY count DESC
  `);
    return rows;
}
export async function getTodayClasses() {
    const [rows] = await pool.query(`
    SELECT b.id, b.name, b.timing, c.name as courseName, f.name as facultyName
    FROM batches b
    JOIN courses c ON b.course_id = c.id
    LEFT JOIN faculty f ON b.faculty_id = f.id
    WHERE b.status = 'Ongoing'
  `);
    return rows.map((r) => ({
        id: r.id,
        name: r.name,
        timing: r.timing,
        courseName: r.courseName,
        facultyName: r.facultyName ?? null,
        status: inferClassStatus(r.timing),
    }));
}
// --- Report Data Extractors ---
export async function getStudentsReport() {
    const [rows] = await pool.query(`
    SELECT s.id, s.name, s.email, s.phone, s.status, s.admission_date as admissionDate,
           c.name as courseName, b.name as batchName
    FROM students s
    JOIN courses c ON s.course_id = c.id
    LEFT JOIN batches b ON s.batch_id = b.id
    WHERE s.status != 'Deleted'
    ORDER BY s.name ASC
  `);
    return rows;
}
export async function getAdmissionsReport() {
    const [rows] = await pool.query(`
    SELECT admission_date as date, COUNT(*) as admissionsCount
    FROM students
    WHERE status != 'Deleted'
    GROUP BY date
    ORDER BY date DESC
  `);
    return rows;
}
export async function getFeesReport() {
    const [rows] = await pool.query(`
    SELECT s.id as studentId, s.name as studentName,
           s.fees_total as feesTotal, s.fees_paid as feesPaid,
           (s.fees_total - s.fees_paid) as feesDue
    FROM students s
    WHERE s.status != 'Deleted'
    ORDER BY feesDue DESC
  `);
    return rows;
}
export async function getAttendanceReportAll() {
    const [rows] = await pool.query(`
    SELECT ar.record_date as date, ar.status,
           s.name as studentName, b.name as batchName
    FROM attendance_records ar
    JOIN students s ON ar.student_id = s.id
    JOIN batches b ON ar.batch_id = b.id
    ORDER BY ar.record_date DESC
    LIMIT 500
  `);
    return rows;
}
export async function getFacultyReport() {
    const [rows] = await pool.query(`
    SELECT id, name, subject, phone, email, salary, experience, qualification
    FROM faculty
    ORDER BY name ASC
  `);
    return rows;
}
