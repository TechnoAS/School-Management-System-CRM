import fs from 'fs';
import path from 'path';

const modelsDir = 'd:/Main Builds/School Management System CRM/backend/src/models';
const servicesDir = 'd:/Main Builds/School Management System CRM/backend/src/modules';

// 1. Fix Models
const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
for (const file of modelFiles) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Find all ref: 'ModelName'
    const refRegex = /([\w_]+):\s*{\s*type:\s*String(,\s*required:\s*true)?,\s*ref:\s*'([^']+)'\s*}/g;
    let match;
    const virtuals = [];

    while ((match = refRegex.exec(content)) !== null) {
        const fieldName = match[1];
        const requiredPart = match[2] || '';
        const refModel = match[3];
        
        // Remove ref: '...'
        const replaceStr = `${fieldName}: { type: String${requiredPart} }`;
        content = content.replace(match[0], replaceStr);
        modified = true;

        // Add virtual
        let virtualName = fieldName.replace(/_id$/, '');
        // Special cases
        if (fieldName === 'created_by' || fieldName === 'marked_by') {
            virtualName = fieldName;
        }

        virtuals.push(`schema.virtual('${virtualName}', { ref: '${refModel}', localField: '${fieldName}', foreignField: 'id', justOne: true });`);
    }

    if (modified) {
        // Ensure toJSON/toObject virtuals: true
        if (!content.includes('toJSON: { virtuals: true }')) {
            content = content.replace(/timestamps:\s*{[^}]+}/, match => `${match}, toJSON: { virtuals: true }, toObject: { virtuals: true }`);
            // If no timestamps object (like some models), try injecting at end of schema options
            if (!content.includes('toJSON: { virtuals: true }')) {
                // Find `}, { timestamps: false });` or similar
                content = content.replace(/}\);(\s*export)/, '}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });$1');
            }
        }

        const exportIndex = content.indexOf('export const');
        if (exportIndex !== -1 && virtuals.length > 0) {
            content = content.slice(0, exportIndex) + virtuals.join('\n') + '\n\n' + content.slice(exportIndex);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated model: ${file}`);
    }
}

// 2. Fix Services
function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.name.endsWith('.service.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Replace populate('course_id') -> populate('course')
            // Also fields like student_id, batch_id, etc.
            const populateRegex = /\.populate\('([^']+)'/g;
            let match;
            while ((match = populateRegex.exec(content)) !== null) {
                const oldName = match[1];
                if (oldName.endsWith('_id')) {
                    const newName = oldName.replace(/_id$/, '');
                    content = content.replace(match[0], `.populate('${newName}'`);
                    modified = true;
                    
                    // Replace usages like record.student_id?.name -> record.student?.name
                    const usageRegex = new RegExp(`\\.${oldName}\\?\\.`, 'g');
                    content = content.replace(usageRegex, `.${newName}?.`);
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated service: ${entry.name}`);
            }
        }
    }
}
processDir(servicesDir);

console.log('Done fixing refs.');
