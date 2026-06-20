if (process.env.RUN_LIVE_API_TESTS === '1') {
    // Use real backend/.env (loaded by config/env.ts) for live API tests
    process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';
}
else {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'mysql://test:test@127.0.0.1:3306/test_db';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-chars!!';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-chars!';
    process.env.LOG_LEVEL = 'error';
}
