import { Student } from '../../models/Student.js';
import { Course } from '../../models/Course.js';
import { Batch } from '../../models/Batch.js';
import { Faculty } from '../../models/Faculty.js';
import { Payment } from '../../models/Payment.js';
import { AttendanceRecord } from '../../models/AttendanceRecord.js';

function inferClassStatus(timing) {
    const match = timing.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return 'Upcoming';
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    
    const start = new Date();
    start.setHours(hour, minute, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 3);
    const now = new Date();
    
    if (now >= start && now <= end) return 'Ongoing';
    if (now > end) return 'Completed';
    return 'Upcoming';
}

export async function getKPIs() {
    const totalStudents = await Student.countDocuments({ status: { $ne: 'Deleted' } });
    const activeStudents = await Student.countDocuments({ status: 'Active' });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newAdmissionsThisMonth = await Student.countDocuments({ 
        status: { $ne: 'Deleted' }, 
        admission_date: { $gte: startOfMonth }
    });
    
    const students = await Student.find({ status: { $ne: 'Deleted' } }).select('fees_total fees_paid').lean();
    let feesDue = 0;
    let feesCollected = 0;
    let studentsWithFeesDue = 0;
    
    students.forEach(s => {
        feesCollected += s.fees_paid;
        if (s.fees_total > s.fees_paid) {
            feesDue += (s.fees_total - s.fees_paid);
            studentsWithFeesDue++;
        }
    });
    
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ status: 'Active' });
    const upcomingBatches = await Batch.countDocuments({ status: 'Upcoming' });
    const ongoingBatches = await Batch.countDocuments({ status: 'Ongoing' });
    const totalFaculty = await Faculty.countDocuments();
    
    const payments = await Payment.find().select('amount').lean();
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const todayClasses = await getTodayClasses();
    const ongoingClassesNow = todayClasses.filter(c => c.status === 'Ongoing').length;
    
    return {
        totalStudents,
        activeStudents,
        newAdmissionsThisMonth,
        feesDue,
        feesCollected,
        studentsWithFeesDue,
        totalCourses,
        activeCourses,
        upcomingBatches,
        ongoingBatches,
        todayClassesCount: todayClasses.length,
        ongoingClassesNow,
        totalFaculty,
        totalRevenue,
    };
}

export async function getEnrollmentTrend() {
    const students = await Student.find({ status: { $ne: 'Deleted' } }).select('admission_date').lean();
    const map = new Map();
    students.forEach(s => {
        if (!s.admission_date) return;
        const d = new Date(s.admission_date);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        map.set(month, (map.get(month) || 0) + 1);
    });
    
    return Array.from(map.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12)
        .map(([month, count]) => ({ month, count }));
}

export async function getFeeTrend() {
    const payments = await Payment.find().select('pay_date amount').lean();
    const collectedByMonth = new Map();
    payments.forEach(p => {
        if (!p.pay_date) return;
        const d = new Date(p.pay_date);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        collectedByMonth.set(month, (collectedByMonth.get(month) || 0) + p.amount);
    });
    
    const students = await Student.find({ status: { $ne: 'Deleted' } }).select('admission_date fees_total fees_paid').lean();
    const dueByMonth = new Map();
    students.forEach(s => {
        if (!s.admission_date) return;
        const d = new Date(s.admission_date);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const due = Math.max(0, s.fees_total - s.fees_paid);
        dueByMonth.set(month, (dueByMonth.get(month) || 0) + due);
    });
    
    const months = [...new Set([...dueByMonth.keys(), ...collectedByMonth.keys()])].sort();
    return months.slice(-12).map((month) => ({
        month,
        collected: collectedByMonth.get(month) ?? 0,
        due: dueByMonth.get(month) ?? 0,
    }));
}

export async function getCourseEnrollment() {
    const courses = await Course.find().lean();
    const students = await Student.find({ status: { $nin: ['Deleted', 'Inactive'] } }).select('course_id').lean();
    
    const countMap = {};
    students.forEach(s => {
        countMap[s.course_id] = (countMap[s.course_id] || 0) + 1;
    });
    
    return courses
        .map(c => ({ name: c.name, count: countMap[c.id] || 0 }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count);
}

export async function getTodayClasses() {
    const batches = await Batch.find({ status: 'Ongoing' })
        .populate('course', 'name')
        .populate('faculty', 'name')
        .lean();
        
    return batches.map(b => ({
        id: b.id,
        name: b.name,
        timing: b.timing,
        courseName: b.course?.name,
        facultyName: b.faculty?.name || null,
        status: inferClassStatus(b.timing),
    }));
}

export async function getStudentsReport() {
    const students = await Student.find({ status: { $ne: 'Deleted' } })
        .populate('course', 'name')
        .populate('batch', 'name')
        .sort({ name: 1 })
        .lean();
        
    return students.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        status: s.status,
        admissionDate: s.admission_date,
        courseName: s.course?.name,
        batchName: s.batch?.name
    }));
}

export async function getAdmissionsReport() {
    const students = await Student.find({ status: { $ne: 'Deleted' } }).select('admission_date').lean();
    const map = new Map();
    
    students.forEach(s => {
        if (!s.admission_date) return;
        // Strip time component for grouping
        const dateKey = s.admission_date.toISOString().split('T')[0];
        map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    
    return Array.from(map.entries())
        .map(([date, admissionsCount]) => ({ date: new Date(date), admissionsCount }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getFeesReport() {
    const students = await Student.find({ status: { $ne: 'Deleted' } })
        .select('id name fees_total fees_paid')
        .lean();
        
    return students
        .map(s => ({
            studentId: s.id,
            studentName: s.name,
            feesTotal: s.fees_total,
            feesPaid: s.fees_paid,
            feesDue: s.fees_total - s.fees_paid
        }))
        .sort((a, b) => b.feesDue - a.feesDue);
}

export async function getAttendanceReportAll() {
    const records = await AttendanceRecord.find()
        .populate('student', 'name')
        .populate('batch', 'name')
        .sort({ record_date: -1 })
        .limit(500)
        .lean();
        
    return records.map(r => ({
        date: r.record_date,
        status: r.status,
        studentName: r.student?.name,
        batchName: r.batch?.name
    }));
}

export async function getFacultyReport() {
    const faculties = await Faculty.find().sort({ name: 1 }).lean();
    return faculties.map(f => ({
        id: f.id,
        name: f.name,
        subject: f.subject,
        phone: f.phone,
        email: f.email,
        salary: f.salary,
        experience: f.experience,
        qualification: f.qualification
    }));
}
