-- Course branding, schedule dates, and study materials metadata
ALTER TABLE courses ADD COLUMN logo_url TEXT NULL;
ALTER TABLE courses ADD COLUMN banner_url TEXT NULL;
ALTER TABLE courses ADD COLUMN start_date DATE NULL;
ALTER TABLE courses ADD COLUMN end_date DATE NULL;
ALTER TABLE courses ADD COLUMN extra_data JSON NULL;
