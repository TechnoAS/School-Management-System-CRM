import { AttendanceRecord } from '../../models/AttendanceRecord.js';
import { Student } from '../../models/Student.js';
import { Batch } from '../../models/Batch.js';

export async function getAttendance(batchId, date) {
    const students = await Student.find({ batch_id: batchId, status: { $ne: 'Deleted' } })
        .sort({ name: 1 })
        .lean();
        
    const records = await AttendanceRecord.find({ batch_id: batchId, record_date: date }).lean();
    const recordMap = records.reduce((acc, r) => {
        acc[r.student_id] = r;
        return acc;
    }, {});
    
    return students.map(s => {
        const r = recordMap[s.id];
        return {
            studentId: s.id,
            studentName: s.name,
            status: r ? r.status : null,
            markedBy: r ? r.marked_by : null,
            createdAt: r ? r.created_at : null
        };
    });
}

export async function upsertAttendance(data, markedBy) {
    for (const record of data.records) {
        const recordId = `${record.studentId}_${data.batchId}_${data.date}`;
        
        await AttendanceRecord.updateOne(
            { student_id: record.studentId, batch_id: data.batchId, record_date: data.date },
            {
                $set: {
                    id: recordId,
                    status: record.status,
                    marked_by: markedBy
                }
            },
            { upsert: true }
        );
    }
}

export async function listAttendanceRecords(months = 12, facultyId = null) {
    const safeMonths = Math.min(Math.max(Number(months) || 12, 1), 24);
    const dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() - safeMonths);
    
    let batchIds = null;
    if (facultyId) {
        const batches = await Batch.find({ faculty_id: facultyId }).select('id').lean();
        batchIds = batches.map(b => b.id);
        if (batchIds.length === 0) return [];
    }
    
    const query = { record_date: { $gte: dateLimit } };
    if (batchIds) {
        query.batch_id = { $in: batchIds };
    }
    
    const records = await AttendanceRecord.find(query)
        .populate('batch', 'name')
        .sort({ record_date: -1, student_id: 1 })
        .lean();
        
    return records.map(r => ({
        studentId: r.student_id,
        batchId: r.batch?.id || r.batch_id,
        batchName: r.batch?.name,
        recordDate: r.record_date,
        status: r.status
    }));
}

export async function getAttendanceReport(batchId, month) {
    // month format: YYYY-MM
    const [year, m] = month.split('-');
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 1); // first day of next month
    
    const students = await Student.find({ batch_id: batchId, status: { $ne: 'Deleted' } }).sort({ name: 1 }).lean();
    const records = await AttendanceRecord.find({ 
        batch_id: batchId,
        record_date: { $gte: startDate, $lt: endDate }
    }).lean();
    
    const summary = { present: 0, absent: 0, leave: 0 };
    
    records.forEach(r => {
        if (r.status === 'present') summary.present++;
        else if (r.status === 'absent') summary.absent++;
        else if (r.status === 'leave') summary.leave++;
    });
    
    const studentStats = students.map(s => {
        const studentRecords = records.filter(r => r.student_id === s.id);
        let present = 0, absent = 0, leave = 0;
        studentRecords.forEach(r => {
            if (r.status === 'present') present++;
            else if (r.status === 'absent') absent++;
            else if (r.status === 'leave') leave++;
        });
        return {
            studentId: s.id,
            studentName: s.name,
            present,
            absent,
            leave,
            totalClasses: studentRecords.length
        };
    });
    
    return { summary, students: studentStats };
}
