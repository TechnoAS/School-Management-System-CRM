-- Student extra data (custom admission fields + document metadata)
ALTER TABLE students ADD COLUMN extra_data JSON NULL;
