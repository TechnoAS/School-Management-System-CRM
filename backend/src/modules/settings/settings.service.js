import { InstituteSettings } from '../../models/InstituteSettings.js';

export async function getSettings() {
    let settings = await InstituteSettings.findOne({ id: 1 }).lean();
    if (!settings) {
        await InstituteSettings.create({
            id: 1,
            name: 'TechAcademy CRM',
            email: 'admin@techacademy.com',
            phone: '+91 98450 10001'
        });
        settings = await InstituteSettings.findOne({ id: 1 }).lean();
    }
    return settings;
}

export async function updateInstituteSettings(data) {
    await getSettings(); 
    
    const mapping = {
        name: 'name',
        phone: 'phone',
        email: 'email',
        address: 'address',
        registrationNo: 'registration_no',
        academicYear: 'academic_year',
        logoUrl: 'logo_url',
    };
    
    const updateData = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && mapping[key]) {
            updateData[mapping[key]] = value;
        }
    }
    
    if (Object.keys(updateData).length > 0) {
        await InstituteSettings.updateOne({ id: 1 }, { $set: updateData });
    }
    
    return getSettings();
}

export async function updateReceiptSettings(data) {
    const current = await getSettings();
    const currentConfig = typeof current.receipt_config === 'string'
        ? JSON.parse(current.receipt_config)
        : current.receipt_config || {};
    const mergedConfig = { ...currentConfig, ...data };
    await InstituteSettings.updateOne({ id: 1 }, { $set: { receipt_config: mergedConfig } });
    return mergedConfig;
}

export async function updateCertificateSettings(data) {
    const current = await getSettings();
    const currentConfig = typeof current.certificate_config === 'string'
        ? JSON.parse(current.certificate_config)
        : current.certificate_config || {};
    const mergedConfig = { ...currentConfig, ...data };
    await InstituteSettings.updateOne({ id: 1 }, { $set: { certificate_config: mergedConfig } });
    return mergedConfig;
}

function parseJsonColumn(value, fallback) {
    if (value == null) return fallback;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return fallback; }
    }
    return value;
}

export async function getPageLayouts() {
    const current = await getSettings();
    if (!current) return {};
    return parseJsonColumn(current.page_layouts, {});
}

export async function getPageLayout(pageId) {
    const layouts = await getPageLayouts();
    return layouts[pageId] ?? null;
}

export async function updatePageLayout(pageId, layout) {
    const layouts = await getPageLayouts();
    const merged = { ...layouts, [pageId]: layout };
    await InstituteSettings.updateOne({ id: 1 }, { $set: { page_layouts: merged } });
    return layout;
}

const ADMISSION_FORM_KEY = '__admissionForm';
export const DEFAULT_ADMISSION_FORM_CONFIG = {
    customFields: [],
    documentSlots: [
        { id: 'aadhaar', label: 'Aadhaar Card', description: 'Government ID proof', required: true, accept: 'image/*,application/pdf' },
        { id: 'marksheet', label: 'Previous Marksheet', description: 'Latest academic record', required: false, accept: 'image/*,application/pdf' },
        { id: 'transfer-cert', label: 'Transfer Certificate', description: 'If applicable', required: false, accept: 'image/*,application/pdf' },
    ],
};

export async function getAdmissionFormConfig() {
    const layouts = await getPageLayouts();
    return layouts[ADMISSION_FORM_KEY] ?? DEFAULT_ADMISSION_FORM_CONFIG;
}

export async function updateAdmissionFormConfig(config) {
    const layouts = await getPageLayouts();
    const merged = { ...layouts, [ADMISSION_FORM_KEY]: config };
    await InstituteSettings.updateOne({ id: 1 }, { $set: { page_layouts: merged } });
    return config;
}
