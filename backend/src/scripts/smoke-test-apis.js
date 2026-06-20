/**
 * Live smoke test for all API groups.
 * Usage: npm run test:smoke
 */
import dotenv from 'dotenv';
dotenv.config();
const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:5000/api';
const EMAIL = process.env.ADMIN_EMAIL ?? '';
const PASSWORD = process.env.ADMIN_PASSWORD ?? '';
async function request(method, path, token, body, cookie) {
    const headers = {};
    if (token)
        headers.Authorization = `Bearer ${token}`;
    if (body)
        headers['Content-Type'] = 'application/json';
    if (cookie)
        headers.Cookie = cookie;
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
    });
    let json = {};
    try {
        json = (await res.json());
    }
    catch {
        json = {};
    }
    return { status: res.status, json };
}
function pass(status, expected) {
    return Array.isArray(expected) ? expected.includes(status) : status === expected;
}
async function main() {
    if (!EMAIL || !PASSWORD) {
        console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env');
        process.exit(1);
    }
    console.log(`\n🔍 API smoke test → ${BASE}\n`);
    const results = [];
    const health = await request('GET', '/health', null);
    results.push({
        name: 'Health',
        method: 'GET',
        path: '/health',
        status: health.status,
        ok: pass(health.status, 200),
    });
    const loginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
        credentials: 'include',
    });
    const loginJson = (await loginRes.json());
    const token = loginJson.data?.accessToken ?? null;
    const setCookie = loginRes.headers.get('set-cookie') ?? '';
    results.push({
        name: 'Login',
        method: 'POST',
        path: '/auth/login',
        status: loginRes.status,
        ok: loginRes.status === 200 && !!token,
        note: token ? undefined : 'No accessToken',
    });
    if (!token) {
        printResults(results);
        process.exit(1);
    }
    const tests = [
        { name: 'Get me', method: 'GET', path: '/auth/me' },
        { name: 'Dashboard stats', method: 'GET', path: '/dashboard/stats' },
        { name: 'Enrollment trend', method: 'GET', path: '/dashboard/enrollment-trend' },
        { name: 'Fee trend', method: 'GET', path: '/dashboard/fee-trend' },
        { name: 'Today classes', method: 'GET', path: '/dashboard/today-classes' },
        { name: 'List courses', method: 'GET', path: '/courses' },
        { name: 'Get course', method: 'GET', path: '/courses/CRS-001' },
        { name: 'List batches', method: 'GET', path: '/batches' },
        { name: 'Get batch', method: 'GET', path: '/batches/BAT-001' },
        { name: 'Batch students', method: 'GET', path: '/batches/BAT-001/students' },
        { name: 'List students', method: 'GET', path: '/students?page=1&limit=10' },
        { name: 'Get student', method: 'GET', path: '/students/STU-001' },
        { name: 'Attendance', method: 'GET', path: '/attendance?batchId=BAT-001&date=2024-03-10' },
        { name: 'Attendance report', method: 'GET', path: '/attendance/report?batchId=BAT-001&month=3&year=2024' },
        { name: 'Due fees', method: 'GET', path: '/fees/due' },
        { name: 'Payments', method: 'GET', path: '/payments' },
        { name: 'Payment receipt', method: 'GET', path: '/payments/RCP-2024-0892' },
        { name: 'List faculty', method: 'GET', path: '/faculty' },
        { name: 'Get faculty', method: 'GET', path: '/faculty/FAC-001' },
        { name: 'Faculty salary', method: 'GET', path: '/faculty/FAC-001/salary' },
        { name: 'List exams', method: 'GET', path: '/exams' },
        { name: 'List certificates', method: 'GET', path: '/certificates' },
        { name: 'Report students', method: 'GET', path: '/reports/students' },
        { name: 'Report admissions', method: 'GET', path: '/reports/admissions' },
        { name: 'Report fees', method: 'GET', path: '/reports/fees' },
        { name: 'Report fees due', method: 'GET', path: '/reports/fees/due' },
        { name: 'Report attendance', method: 'GET', path: '/reports/attendance' },
        { name: 'Report faculty', method: 'GET', path: '/reports/faculty' },
        { name: 'Notifications', method: 'GET', path: '/notifications' },
        { name: 'Settings institute', method: 'GET', path: '/settings/institute' },
        { name: 'Settings receipt', method: 'GET', path: '/settings/receipt' },
        { name: 'Settings certificate', method: 'GET', path: '/settings/certificate' },
        { name: 'Refresh token', method: 'POST', path: '/auth/refresh', expectStatus: 200 },
        { name: 'Logout', method: 'POST', path: '/auth/logout', expectStatus: 200 },
        { name: 'Unauthorized (no token)', method: 'GET', path: '/courses', expectStatus: 401 },
    ];
    for (const t of tests) {
        if (t.name === 'Unauthorized (no token)') {
            const r = await request(t.method, t.path, null);
            results.push({
                name: t.name,
                method: t.method,
                path: t.path,
                status: r.status,
                ok: pass(r.status, 401),
            });
            continue;
        }
        if (t.name === 'Refresh token') {
            const r = await request('POST', '/auth/refresh', null, undefined, setCookie);
            results.push({
                name: t.name,
                method: 'POST',
                path: '/auth/refresh',
                status: r.status,
                ok: pass(r.status, 200),
            });
            continue;
        }
        const r = await request(t.method, t.path, token, t.body);
        const expected = t.expectStatus ?? 200;
        results.push({
            name: t.name,
            method: t.method,
            path: t.path.split('?')[0],
            status: r.status,
            ok: pass(r.status, expected),
            note: r.status !== 200 ? String(r.json.error?.message ?? '') : undefined,
        });
    }
    printResults(results);
    const failed = results.filter((r) => !r.ok).length;
    process.exit(failed > 0 ? 1 : 0);
}
function printResults(results) {
    const passed = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok);
    console.log('Method  Status  Result  Endpoint');
    console.log('─'.repeat(60));
    for (const r of results) {
        const icon = r.ok ? '✅' : '❌';
        const path = `${r.method.padEnd(6)} ${String(r.status).padEnd(7)} ${icon}      ${r.path}`;
        console.log(r.note ? `${path}  (${r.note})` : path);
    }
    console.log('─'.repeat(60));
    console.log(`\n${passed}/${results.length} passed`);
    if (failed.length > 0) {
        console.log('\nFailed:');
        for (const f of failed) {
            console.log(`  - ${f.name}: ${f.status} ${f.path}`);
        }
    }
    else {
        console.log('\nAll API smoke tests passed.\n');
    }
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
