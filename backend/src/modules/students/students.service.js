import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import { Student } from '../../models/Student.js';
import { Course } from '../../models/Course.js';
import { Batch } from '../../models/Batch.js';

export async function getStudentsList(filters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const query = { status: { $ne: 'Deleted' } };

    if (filters.search) {
        const regex = new RegExp(filters.search, 'i');
        query.$or = [
            { name: regex },
            { email: regex },
            { phone: regex },
            { id: regex }
        ];
    }

    if (filters.course) {
        query.course_id = filters.course;
    }

    if (filters.status) {
        query.status = filters.status;
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
        .populate('course', 'name')
        .populate('batch', 'name')
        .sort({ created_at: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

    // Map populated fields to match SQL output format for the controller
    const formattedStudents = students.map(s => ({
        ...s,
        course_name: s.course?.name,
        batch_name: s.batch?.name,
        course_id: s.course?.id || s.course_id,
        batch_id: s.batch?.id || s.batch_id
    }));

    return {
        students: formattedStudents,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getStudentById(id) {
    const student = await Student.findOne({ id, status: { $ne: 'Deleted' } })
        .populate('course', 'name')
        .populate('batch', 'name')
        .lean();
        
    if (!student) return null;
    
    return {
        ...student,
        course_name: student.course?.name,
        batch_name: student.batch?.name,
        course_id: student.course?.id || student.course_id,
        batch_id: student.batch?.id || student.batch_id
    };
}

export async function createStudent(data) {
    const existing = await getStudentById(data.id);
    if (existing) {
        throw new ConflictError(`Student with ID "${data.id}" already exists`);
    }

    const course = await Course.findOne({ id: data.courseId });
    if (!course) {
        throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
    }

    if (data.batchId) {
        const batch = await Batch.findOne({ id: data.batchId });
        if (!batch) {
            throw new NotFoundError(`Batch with ID "${data.batchId}" not found`);
        }
    }

    const student = new Student({
        id: data.id,
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        course_id: data.courseId,
        batch_id: data.batchId || null,
        guardian: data.guardian || null,
        guardian_phone: data.guardianPhone || null,
        address: data.address || null,
        admission_date: data.admissionDate,
        fees_total: data.feesTotal,
        fees_paid: data.feesPaid,
        status: data.status,
        dob: data.dob || null,
        grade: data.grade || null,
        photo_url: data.photoUrl || null,
        extra_data: data.extraData || null,
    });

    await student.save();
    return getStudentById(data.id);
}

export async function updateStudent(id, data) {
    const existing = await getStudentById(id);
    if (!existing) {
        throw new NotFoundError(`Student with ID "${id}" not found`);
    }

    if (data.courseId) {
        const course = await Course.findOne({ id: data.courseId });
        if (!course) {
            throw new NotFoundError(`Course with ID "${data.courseId}" not found`);
        }
    }

    if (data.batchId) {
        const batch = await Batch.findOne({ id: data.batchId });
        if (!batch) {
            throw new NotFoundError(`Batch with ID "${data.batchId}" not found`);
        }
    }

    const updateData = {};
    const mapping = {
        name: 'name',
        phone: 'phone',
        email: 'email',
        courseId: 'course_id',
        batchId: 'batch_id',
        guardian: 'guardian',
        guardianPhone: 'guardian_phone',
        address: 'address',
        admissionDate: 'admission_date',
        feesTotal: 'fees_total',
        feesPaid: 'fees_paid',
        status: 'status',
        dob: 'dob',
        grade: 'grade',
        photoUrl: 'photo_url',
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

    await Student.updateOne({ id }, { $set: updateData });
    return getStudentById(id);
}

export async function deleteStudentSoft(id) {
    const existing = await getStudentById(id);
    if (!existing) {
        throw new NotFoundError(`Student with ID "${id}" not found`);
    }
    await Student.updateOne({ id }, { $set: { status: 'Deleted' } });
}
