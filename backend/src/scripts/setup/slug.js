/** Turn an institute display name into a safe MySQL database identifier. */
export function instituteToDatabaseName(name) {
    const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 64);
    if (!slug) {
        throw new Error('Institute name must contain at least one letter or number');
    }
    if (!/^[a-z]/.test(slug)) {
        return `institute_${slug}`;
    }
    return slug;
}
/** Default app DB user from database name. */
export function defaultDbUser(databaseName) {
    const base = databaseName.slice(0, 28);
    return `${base}_app`;
}
/** Default admin email when none is provided. */
export function defaultAdminEmail(databaseName) {
    return `admin@${databaseName}.local`;
}
