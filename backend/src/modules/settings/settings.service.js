import { pool } from '../../config/database.js';
export async function getSettings() {
    const [rows] = await pool.query('SELECT * FROM institute_settings WHERE id = 1');
    let settings = rows[0];
    if (!settings) {
        // If not seeded, insert a basic placeholder
        await pool.query(`INSERT INTO institute_settings (id, name, email, phone) 
       VALUES (1, 'TechAcademy CRM', 'admin@techacademy.com', '+91 98450 10001')`);
        const [freshRows] = await pool.query('SELECT * FROM institute_settings WHERE id = 1');
        settings = freshRows[0];
    }
    return settings;
}
export async function updateInstituteSettings(data) {
    await getSettings(); // Ensure settings row exists
    const fields = [];
    const values = [];
    const mapping = {
        name: 'name',
        phone: 'phone',
        email: 'email',
        address: 'address',
        registrationNo: 'registration_no',
        academicYear: 'academic_year',
        logoUrl: 'logo_url',
    };
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            const dbCol = mapping[key];
            if (dbCol) {
                fields.push(`${dbCol} = ?`);
                values.push(value);
            }
        }
    }
    if (fields.length > 0) {
        const query = `UPDATE institute_settings SET ${fields.join(', ')} WHERE id = 1`;
        await pool.query(query, values);
    }
    return getSettings();
}
export async function updateReceiptSettings(data) {
    const current = await getSettings();
    const currentConfig = typeof current.receipt_config === 'string'
        ? JSON.parse(current.receipt_config)
        : current.receipt_config || {};
    const mergedConfig = { ...currentConfig, ...data };
    await pool.query('UPDATE institute_settings SET receipt_config = ? WHERE id = 1', [JSON.stringify(mergedConfig)]);
    return mergedConfig;
}
export async function updateCertificateSettings(data) {
    const current = await getSettings();
    const currentConfig = typeof current.certificate_config === 'string'
        ? JSON.parse(current.certificate_config)
        : current.certificate_config || {};
    const mergedConfig = { ...currentConfig, ...data };
    await pool.query('UPDATE institute_settings SET certificate_config = ? WHERE id = 1', [JSON.stringify(mergedConfig)]);
    return mergedConfig;
}
function parseJsonColumn(value, fallback) {
    if (value == null)
        return fallback;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        }
        catch {
            return fallback;
        }
    }
    return value;
}
export async function getPageLayouts() {
    const current = await getSettings();
    if (!current)
        return {};
    return parseJsonColumn(current.page_layouts, {});
}
export async function getPageLayout(pageId) {
    const layouts = await getPageLayouts();
    return layouts[pageId] ?? null;
}
export async function updatePageLayout(pageId, layout) {
    const layouts = await getPageLayouts();
    const merged = { ...layouts, [pageId]: layout };
    await pool.query('UPDATE institute_settings SET page_layouts = ? WHERE id = 1', [JSON.stringify(merged)]);
    return layout;
}
