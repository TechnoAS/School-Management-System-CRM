import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Course } from '../models/Course.js';
import { Faculty } from '../models/Faculty.js';
import { Batch } from '../models/Batch.js';
import { Student } from '../models/Student.js';
import { InstituteSettings } from '../models/InstituteSettings.js';
import { User } from '../models/User.js';
import { randomUUID } from 'crypto';

async function seedData() {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('Connected to MongoDB. Seeding data...');

        // Clear existing mock data if needed (optional)
        // await Course.deleteMany({});
        // await Faculty.deleteMany({});
        // await Batch.deleteMany({});
        // await Student.deleteMany({});

        // 1. Institute Settings
        const settingsExist = await InstituteSettings.findOne({ id: 1 });
        if (!settingsExist) {
            await InstituteSettings.create({
                id: 1,
                name: 'TechAcademy CRM',
                email: 'admin@techacademy.com',
                phone: '+1 234 567 8900'
            });
        }

        // 2. Courses
        const courseId1 = 'CRS-001';
        const courseId2 = 'CRS-002';
        
        await Course.findOneAndUpdate({ id: courseId1 }, {
            id: courseId1,
            name: 'Full Stack Web Development',
            description: 'Learn MERN stack from scratch.',
            duration: '6 Months',
            fees: 1500,
            status: 'Active'
        }, { upsert: true });

        await Course.findOneAndUpdate({ id: courseId2 }, {
            id: courseId2,
            name: 'Data Science Bootcamp',
            description: 'Python, Pandas, ML algorithms.',
            duration: '4 Months',
            fees: 1200,
            status: 'Active'
        }, { upsert: true });

        // 3. Faculty
        const faculties = [
            { id: 'FAC-001', name: 'John Doe', subject: 'Web Development', phone: '555-0101', email: 'john.doe@techacademy.com', salary: 5000, experience: '5 Years' },
            { id: 'FAC-002', name: 'Jane Smith', subject: 'Data Science', phone: '555-0102', email: 'jane.smith@techacademy.com', salary: 5500, experience: '7 Years' },
            { id: 'FAC-003', name: 'Alan Turing', subject: 'Computer Science', phone: '555-0103', email: 'alan.turing@techacademy.com', salary: 6000, experience: '10 Years' }
        ];

        for (const f of faculties) {
            await Faculty.findOneAndUpdate({ id: f.id }, {
                id: f.id,
                name: f.name,
                subject: f.subject,
                phone: f.phone,
                email: f.email,
                salary: f.salary,
                experience: f.experience
            }, { upsert: true });
        }

        // 4. Batches
        const batchId1 = 'BAT-001';
        await Batch.findOneAndUpdate({ id: batchId1 }, {
            id: batchId1,
            course_id: courseId1,
            faculty_id: 'FAC-001',
            name: 'MERN Morning Batch',
            timing: '09:00 AM',
            status: 'Ongoing',
            start_date: new Date('2024-01-10'),
            end_date: new Date('2024-07-10')
        }, { upsert: true });

        // 5. Students
        const students = [
            { id: 'STU-001', name: 'Alice Smith', email: 'alice@example.com', phone: '555-1001', fees_total: 1500, fees_paid: 500, status: 'Active' },
            { id: 'STU-002', name: 'Bob Johnson', email: 'bob@example.com', phone: '555-1002', fees_total: 1500, fees_paid: 1500, status: 'Active' },
            { id: 'STU-003', name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-1003', fees_total: 1500, fees_paid: 0, status: 'Active' }
        ];

        for (const s of students) {
            await Student.findOneAndUpdate({ id: s.id }, {
                id: s.id,
                course_id: courseId1,
                batch_id: batchId1,
                name: s.name,
                email: s.email,
                phone: s.phone,
                admission_date: new Date('2024-01-05'),
                fees_total: s.fees_total,
                fees_paid: s.fees_paid,
                status: s.status
            }, { upsert: true });
        }

        console.log('Successfully seeded sample data!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to seed data:', err);
        process.exit(1);
    }
}

seedData();
