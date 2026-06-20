import { vi } from 'vitest';
import { generateAccessToken } from '../shared/utils/crypto.js';
export const superAdminUser = {
    id: '11111111-1111-1111-1111-111111111100',
    name: 'Super Admin',
    email: 'super@techacademy.com',
    role: 'super_admin',
};
export const adminUser = {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Aarav Menon',
    email: 'admin@techacademy.com',
    role: 'admin',
};
export const staffUser = {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Divya Rao',
    email: 'staff@techacademy.com',
    role: 'staff',
};
export const facultyUser = {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'Rahul Mehta',
    email: 'faculty@techacademy.com',
    role: 'faculty',
};
export function bearer(user) {
    return `Bearer ${generateAccessToken(user)}`;
}
/** Default mock: empty result sets for SELECT; OK for writes */
export function createPoolQueryMock() {
    return vi.fn().mockImplementation((sql) => {
        const normalized = sql.replace(/\s+/g, ' ').trim().toUpperCase();
        if (normalized.startsWith('SELECT COUNT')) {
            return Promise.resolve([[{ count: 0, total: 0 }], []]);
        }
        if (normalized.includes('SUM(')) {
            return Promise.resolve([[{ total: 0 }], []]);
        }
        if (normalized.startsWith('SELECT')) {
            return Promise.resolve([[], []]);
        }
        return Promise.resolve([{ affectedRows: 1 }, []]);
    });
}
