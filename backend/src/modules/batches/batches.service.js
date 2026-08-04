import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import { Batch } from '../../models/Batch.js';
import { Course } from '../../models/Course.js';
import { Faculty } from '../../models/Faculty.js';
import { Student } from '../../models/Student.js';

export async function getAllBatches() {
    const batches = await Batch.find()
        .populate('course', 'name')
        .populate('faculty', 'name')
        .sort({ start_date: -1 })
        .lean();
        
    return batches.map(b => ({
        ...b,
        course_name: b.course?.name,
        faculty_name: b.faculty?.name,
        course_id: b.course?.id || b.course_id,
        faculty_id: b.faculty?.id || b.faculty_id
    }));
}

export async function getBatchById(id) {
    const batch = await Batch.findOne({ id })
        .populate('course', 'name')
        .populate('faculty', 'name')
        .lean();
        
    if (!batch) return null;
    
    return {
        ...batch,
        course_name: batch.course?.name,
        faculty_name: batch.faculty?.name,
        course_id: batch.course?.id || batch.course_id,
        faculty_id: batch.faculty?.id || batch.faculty_id
    };
}

export async function getBatchStudents(batchId) {
    return await Student.find({ batch_id: batchId })
        .select('id name phone email status photo_url')
        .sort({ name: 1 })
        .lean();
}

export async function createBatch(data) {
    const existing = await getBatchById(data.id);
    if (existing) {
        throw new ConflictError(`Batch with ID "${data.id}" already exists`);
    }
    
    const course = await Course.findOne({ id: data.courseId });
    if (!course) {
        throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
    }
    
    if (data.facultyId) {
        const faculty = await Faculty.findOne({ id: data.facultyId });
        if (!faculty) {
            throw new NotFoundError(`Faculty with ID "${data.facultyId}" not found`);
        }
    }
    
    await Batch.create({
        id: data.id,
        course_id: data.courseId,
        name: data.name,
        timing: data.timing,
        faculty_id: data.facultyId || null,
        status: data.status,
        start_date: data.startDate,
        end_date: data.endDate,
    });
    
    return data;
}

export async function updateBatch(id, data) {
    const existing = await getBatchById(id);
    if (!existing) {
        throw new NotFoundError(`Batch with ID "${id}" not found`);
    }
    
    if (data.courseId) {
        const course = await Course.findOne({ id: data.courseId });
        if (!course) {
            throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
        }
    }
    
    if (data.facultyId) {
        const faculty = await Faculty.findOne({ id: data.facultyId });
        if (!faculty) {
            throw new NotFoundError(`Faculty with ID "${data.facultyId}" not found`);
        }
    }
    
    const updateData = {};
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
                updateData[dbCol] = value;
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return existing;
    }
    
    await Batch.updateOne({ id }, { $set: updateData });
    return getBatchById(id);
}

export async function deleteBatch(id) {
    const existing = await getBatchById(id);
    if (!existing) {
        throw new NotFoundError(`Batch with ID "${id}" not found`);
    }
    
    const studentsCount = await Student.countDocuments({ batch_id: id });
    if (studentsCount > 0) {
        throw new ConflictError('Cannot delete batch: active students are enrolled in it');
    }
    
    await Batch.deleteOne({ id });
}
