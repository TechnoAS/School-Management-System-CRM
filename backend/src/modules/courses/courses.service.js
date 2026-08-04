import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import { Course } from '../../models/Course.js';
import { Batch } from '../../models/Batch.js';
import { Student } from '../../models/Student.js';

export async function getAllCourses() {
    return await Course.find().sort({ created_at: -1 }).lean();
}

export async function getCourseById(id) {
    const course = await Course.findOne({ id }).lean();
    return course || null;
}

export async function getCourseStats(id) {
    const activeBatches = await Batch.countDocuments({ course_id: id, status: 'Ongoing' });
    const activeStudents = await Student.countDocuments({ course_id: id, status: 'Active' });
    return { activeBatches, activeStudents };
}

export async function createCourse(data) {
    const existing = await getCourseById(data.id);
    if (existing) {
        throw new ConflictError(`Course with ID "${data.id}" already exists`);
    }
    const course = new Course({
        id: data.id,
        name: data.name,
        duration: data.duration,
        fees: data.fees,
        description: data.description || null,
        status: data.status,
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        logo_url: data.logoUrl || null,
        banner_url: data.bannerUrl || null,
        extra_data: data.extraData || null,
    });
    await course.save();
    return data;
}

export async function updateCourse(id, data) {
    const existing = await getCourseById(id);
    if (!existing) {
        throw new NotFoundError(`Course with ID "${id}" not found`);
    }
    
    const updateData = {};
    const mapping = {
        name: 'name',
        duration: 'duration',
        fees: 'fees',
        description: 'description',
        status: 'status',
        startDate: 'start_date',
        endDate: 'end_date',
        logoUrl: 'logo_url',
        bannerUrl: 'banner_url',
        extraData: 'extra_data',
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
    
    await Course.updateOne({ id }, { $set: updateData });
    return await getCourseById(id);
}

export async function deleteCourse(id) {
    const existing = await getCourseById(id);
    if (!existing) {
        throw new NotFoundError(`Course with ID "${id}" not found`);
    }
    
    const batchesCount = await Batch.countDocuments({ course_id: id });
    if (batchesCount > 0) {
        throw new ConflictError('Cannot delete course: active batches are linked to it');
    }
    
    const studentsCount = await Student.countDocuments({ course_id: id });
    if (studentsCount > 0) {
        throw new ConflictError('Cannot delete course: enrolled students are linked to it');
    }
    
    await Course.deleteOne({ id });
}
