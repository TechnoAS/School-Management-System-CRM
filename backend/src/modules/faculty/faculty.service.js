import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import { Faculty } from '../../models/Faculty.js';
import { Batch } from '../../models/Batch.js';

export async function getAllFaculty() {
    return await Faculty.find().sort({ created_at: -1 }).lean();
}

export async function getFacultyById(id) {
    const faculty = await Faculty.findOne({ id }).lean();
    return faculty || null;
}

export async function createFaculty(data) {
    const existing = await getFacultyById(data.id);
    if (existing) {
        throw new ConflictError(`Faculty with ID "${data.id}" already exists`);
    }
    
    const faculty = new Faculty({
        id: data.id,
        name: data.name,
        subject: data.subject,
        phone: data.phone || null,
        email: data.email || null,
        salary: data.salary,
        experience: data.experience || null,
        qualification: data.qualification || null,
        photo_url: data.photoUrl || null,
    });
    
    await faculty.save();
    return data;
}

export async function updateFaculty(id, data) {
    const existing = await getFacultyById(id);
    if (!existing) {
        throw new NotFoundError(`Faculty with ID "${id}" not found`);
    }
    
    const updateData = {};
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
    
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && columnMap[key]) {
            updateData[columnMap[key]] = value;
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return existing;
    }
    
    await Faculty.updateOne({ id }, { $set: updateData });
    return getFacultyById(id);
}

export async function deleteFaculty(id) {
    const existing = await getFacultyById(id);
    if (!existing) {
        throw new NotFoundError(`Faculty with ID "${id}" not found`);
    }
    
    const batchesCount = await Batch.countDocuments({ faculty_id: id });
    if (batchesCount > 0) {
        throw new ConflictError('Cannot delete faculty: they are assigned to active batches');
    }
    
    await Faculty.deleteOne({ id });
}
