import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { hashPassword } from '../shared/utils/crypto.js';
import { randomUUID } from 'crypto';

async function seedAdmin() {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@admin.com';
        const existing = await User.findOne({ email });
        
        if (existing) {
            console.log('Admin user already exists:', email);
            process.exit(0);
        }

        const password_hash = await hashPassword('admin123');

        await User.create({
            id: randomUUID(),
            name: 'System Admin',
            email,
            password_hash,
            role: 'super_admin'
        });

        console.log('Successfully created admin user:');
        console.log('Email: admin@admin.com');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin user:', err);
        process.exit(1);
    }
}

seedAdmin();
