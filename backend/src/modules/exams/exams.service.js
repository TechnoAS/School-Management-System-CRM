import { randomUUID } from 'crypto';
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors/app-error.js';
import { Exam } from '../../models/Exam.js';
import { ExamMark } from '../../models/ExamMark.js';
import { Course } from '../../models/Course.js';
import { Batch } from '../../models/Batch.js';
import { Student } from '../../models/Student.js';

export async function getAllExams() {
    const exams = await Exam.find()
        .populate('course', 'name')
        .populate('batch', 'name')
        .sort({ exam_date: -1 })
        .lean();
        
    return exams.map(e => ({
        id: e.id,
        title: e.title,
        examDate: e.exam_date,
        maxMarks: e.max_marks,
        status: e.status,
        courseId: e.course?.id || e.course_id,
        courseName: e.course?.name,
        batchId: e.batch?.id || e.batch_id,
        batchName: e.batch?.name,
    }));
}

export async function getExamById(id) {
    const e = await Exam.findOne({ id })
        .populate('course', 'name')
        .populate('batch', 'name')
        .lean();
        
    if (!e) return null;
    
    return {
        id: e.id,
        title: e.title,
        examDate: e.exam_date,
        maxMarks: e.max_marks,
        status: e.status,
        courseId: e.course?.id || e.course_id,
        courseName: e.course?.name,
        batchId: e.batch?.id || e.batch_id,
        batchName: e.batch?.name,
    };
}

export async function createExam(data) {
    const existing = await Exam.findOne({ id: data.id });
    if (existing) {
        throw new ConflictError(`Exam with ID "${data.id}" already exists`);
    }
    
    const course = await Course.findOne({ id: data.courseId });
    if (!course) throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
    
    const batch = await Batch.findOne({ id: data.batchId });
    if (!batch) throw new NotFoundError(`Batch with ID "${data.batchId}" not found`);
    
    await Exam.create({
        id: data.id,
        title: data.title,
        course_id: data.courseId,
        batch_id: data.batchId,
        exam_date: data.examDate,
        max_marks: data.maxMarks,
        status: data.status,
    });
    
    return data;
}

export async function updateExam(id, data) {
    const existing = await getExamById(id);
    if (!existing) throw new NotFoundError(`Exam with ID "${id}" not found`);
    
    const updateData = {};
    const mapping = {
        title: 'title',
        courseId: 'course_id',
        batchId: 'batch_id',
        examDate: 'exam_date',
        maxMarks: 'max_marks',
        status: 'status',
    };
    
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && mapping[key]) {
            updateData[mapping[key]] = value;
        }
    }
    
    if (Object.keys(updateData).length === 0) return existing;
    
    await Exam.updateOne({ id }, { $set: updateData });
    return getExamById(id);
}

export async function deleteExam(id) {
    const existing = await getExamById(id);
    if (!existing) throw new NotFoundError(`Exam with ID "${id}" not found`);
    await Exam.deleteOne({ id });
}

export async function getExamMarksList(examId) {
    const exam = await getExamById(examId);
    if (!exam) throw new NotFoundError(`Exam with ID "${examId}" not found`);
    
    const students = await Student.find({ batch_id: exam.batchId, status: { $ne: 'Deleted' } }).lean();
    const marks = await ExamMark.find({ exam_id: examId }).lean();
    
    const markMap = marks.reduce((acc, m) => {
        acc[m.student_id] = m;
        return acc;
    }, {});
    
    return students.map(s => {
        const m = markMap[s.id];
        return {
            studentId: s.id,
            studentName: s.name,
            marks: m ? m.marks : 0,
            markRecordId: m ? m.id : null,
        };
    }).sort((a, b) => a.studentName.localeCompare(b.studentName));
}

export async function saveExamMarks(examId, data) {
    const exam = await getExamById(examId);
    if (!exam) throw new NotFoundError(`Exam with ID "${examId}" not found`);
    
    for (const record of data.marks) {
        if (record.marks > exam.maxMarks) {
            throw new ValidationError(`Marks for student "${record.studentId}" cannot exceed maximum exam marks (${exam.maxMarks})`);
        }
    }
    
    for (const record of data.marks) {
        await ExamMark.updateOne(
            { exam_id: examId, student_id: record.studentId },
            {
                $set: { marks: record.marks },
                $setOnInsert: { id: randomUUID() }
            },
            { upsert: true }
        );
    }
}

export async function getExamResultsDetails(examId) {
    const exam = await getExamById(examId);
    if (!exam) throw new NotFoundError(`Exam with ID "${examId}" not found`);
    
    const marks = await ExamMark.find({ exam_id: examId })
        .populate('student', 'name status')
        .sort({ marks: -1 })
        .lean();
        
    const validMarks = marks
        .filter(m => m.student?.status !== 'Deleted')
        .map(m => ({
            studentId: m.student?.id || m.student_id,
            studentName: m.student?.name,
            marks: m.marks
        }));
        
    let highest = 0;
    let totalMarks = 0;
    validMarks.forEach(m => {
        if (m.marks > highest) highest = m.marks;
        totalMarks += m.marks;
    });
    
    const count = validMarks.length;
    const average = count > 0 ? parseFloat((totalMarks / count).toFixed(2)) : 0;
    
    return {
        exam,
        stats: {
            totalGraded: count,
            highestMarks: highest,
            averageMarks: average,
        },
        results: validMarks,
    };
}
