import fs from 'fs';
import path from 'path';
/** Update or append keys in backend/.env without wiping other values. */
export function upsertEnvFile(filePath, values) {
    const lines = [];
    const seen = new Set();
    if (fs.existsSync(filePath)) {
        const existing = fs.readFileSync(filePath, 'utf8');
        for (const line of existing.split(/\r?\n/)) {
            const match = /^([A-Z0-9_]+)=/.exec(line);
            if (match && match[1] in values) {
                lines.push(`${match[1]}=${values[match[1]]}`);
                seen.add(match[1]);
            }
            else {
                lines.push(line);
            }
        }
    }
    const missing = Object.entries(values).filter(([key]) => !seen.has(key));
    if (missing.length > 0) {
        if (lines.length > 0 && lines[lines.length - 1] !== '') {
            lines.push('');
        }
        lines.push('# ── Updated by npm run db:setup ──');
        for (const [key, value] of missing) {
            lines.push(`${key}=${value}`);
        }
    }
    fs.writeFileSync(filePath, lines.join('\n').replace(/\n*$/, '\n'));
}
export function backendEnvPath() {
    return path.resolve(process.cwd(), '.env');
}
