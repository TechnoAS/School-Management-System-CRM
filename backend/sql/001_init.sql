-- School CRM — core schema (MySQL 8.0+)
-- Database is selected by npm run db:setup (from INSTITUTE_NAME / DATABASE_NAME)

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS exam_marks;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS institute_settings;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ─── Auth & settings ─────────────────────────────────────────────

CREATE TABLE users (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'staff', 'faculty', 'super_admin') NOT NULL DEFAULT 'staff',
  phone         VARCHAR(20)  NULL,
  photo_url     TEXT         NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE institute_settings (
  id               TINYINT      NOT NULL PRIMARY KEY DEFAULT 1,
  name             VARCHAR(255) NOT NULL,
  phone            VARCHAR(30)  NULL,
  email            VARCHAR(255) NULL,
  address          TEXT         NULL,
  registration_no  VARCHAR(80)  NULL,
  academic_year    VARCHAR(20)  NULL,
  logo_url         MEDIUMTEXT   NULL,
  receipt_config   JSON         NULL,
  certificate_config JSON       NULL,
  page_layouts     JSON         NULL,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_single_settings CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  user_id     CHAR(36)     NOT NULL,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMP    NOT NULL,
  revoked_at  TIMESTAMP    NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address  VARCHAR(45)  NULL,
  user_agent  TEXT         NULL,
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_log (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     CHAR(36)        NULL,
  action      VARCHAR(100)    NOT NULL,
  entity      VARCHAR(100)    NULL,
  entity_id   VARCHAR(36)     NULL,
  before_data JSON            NULL,
  after_data  JSON            NULL,
  ip_address  VARCHAR(45)     NULL,
  user_agent  TEXT            NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE login_attempts (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email        VARCHAR(255)    NOT NULL,
  ip_address   VARCHAR(45)     NOT NULL,
  succeeded    TINYINT(1)      NOT NULL DEFAULT 0,
  attempted_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Academic entities ───────────────────────────────────────────

CREATE TABLE courses (
  id          VARCHAR(20)    NOT NULL PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  duration    VARCHAR(50)    NOT NULL,
  fees        DECIMAL(12, 2) NOT NULL DEFAULT 0,
  description TEXT           NULL,
  status      VARCHAR(20)    NOT NULL DEFAULT 'Active',
  logo_url    TEXT           NULL,
  banner_url  TEXT           NULL,
  start_date  DATE           NULL,
  end_date    DATE           NULL,
  extra_data  JSON           NULL,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faculty (
  id             VARCHAR(20)    NOT NULL PRIMARY KEY,
  name           VARCHAR(120)   NOT NULL,
  subject        VARCHAR(120)   NOT NULL,
  phone          VARCHAR(20)    NULL,
  email          VARCHAR(255)   NULL,
  salary         DECIMAL(12, 2) NOT NULL DEFAULT 0,
  experience     VARCHAR(50)    NULL,
  qualification  VARCHAR(120)   NULL,
  photo_url      TEXT           NULL,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE batches (
  id          VARCHAR(20)  NOT NULL PRIMARY KEY,
  course_id   VARCHAR(20)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  timing      VARCHAR(120) NOT NULL,
  faculty_id  VARCHAR(20)  NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'Upcoming',
  start_date  DATE         NOT NULL,
  end_date    DATE         NOT NULL,
  CONSTRAINT fk_batch_course  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE RESTRICT,
  CONSTRAINT fk_batch_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE students (
  id              VARCHAR(20)    NOT NULL PRIMARY KEY,
  name            VARCHAR(120)   NOT NULL,
  phone           VARCHAR(20)    NULL,
  email           VARCHAR(255)   NULL,
  course_id       VARCHAR(20)    NOT NULL,
  batch_id        VARCHAR(20)    NULL,
  guardian        VARCHAR(120)   NULL,
  guardian_phone  VARCHAR(20)    NULL,
  address         TEXT           NULL,
  admission_date  DATE           NOT NULL,
  fees_total      DECIMAL(12, 2) NOT NULL DEFAULT 0,
  fees_paid       DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status          VARCHAR(20)    NOT NULL DEFAULT 'Active',
  dob             DATE           NULL,
  grade           VARCHAR(10)    NULL,
  photo_url       TEXT           NULL,
  extra_data      JSON           NULL,
  created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  CONSTRAINT fk_student_batch  FOREIGN KEY (batch_id)  REFERENCES batches(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Operations ──────────────────────────────────────────────────

CREATE TABLE attendance_records (
  id          VARCHAR(80)  NOT NULL PRIMARY KEY,
  student_id  VARCHAR(20)  NOT NULL,
  batch_id    VARCHAR(20)  NOT NULL,
  record_date DATE         NOT NULL,
  status      ENUM('present', 'absent', 'leave') NOT NULL DEFAULT 'present',
  marked_by   CHAR(36)     NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance (student_id, batch_id, record_date),
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_batch   FOREIGN KEY (batch_id)   REFERENCES batches(id)   ON DELETE CASCADE,
  CONSTRAINT fk_attendance_user    FOREIGN KEY (marked_by)  REFERENCES users(id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
  receipt     VARCHAR(40)    NOT NULL PRIMARY KEY,
  student_id  VARCHAR(20)    NOT NULL,
  amount      DECIMAL(12, 2) NOT NULL,
  mode        VARCHAR(30)    NOT NULL,
  pay_date    DATE           NOT NULL,
  remarks     TEXT           NULL,
  created_by  CHAR(36)       NULL,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_user    FOREIGN KEY (created_by) REFERENCES users(id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exams (
  id          VARCHAR(20) NOT NULL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  course_id   VARCHAR(20) NOT NULL,
  batch_id    VARCHAR(20) NOT NULL,
  exam_date   DATE        NOT NULL,
  max_marks   INT         NOT NULL DEFAULT 100,
  status      VARCHAR(20) NOT NULL DEFAULT 'Upcoming',
  CONSTRAINT fk_exam_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  CONSTRAINT fk_exam_batch  FOREIGN KEY (batch_id)  REFERENCES batches(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exam_marks (
  id          CHAR(36)    NOT NULL PRIMARY KEY,
  exam_id     VARCHAR(20) NOT NULL,
  student_id  VARCHAR(20) NOT NULL,
  marks       INT         NOT NULL DEFAULT 0,
  UNIQUE KEY uq_exam_student (exam_id, student_id),
  CONSTRAINT fk_mark_exam    FOREIGN KEY (exam_id)    REFERENCES exams(id)    ON DELETE CASCADE,
  CONSTRAINT fk_mark_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE certificates (
  cert_no        VARCHAR(40) NOT NULL PRIMARY KEY,
  student_id     VARCHAR(20) NOT NULL,
  course_id      VARCHAR(20) NOT NULL,
  grade          VARCHAR(10) NOT NULL,
  issue_date     DATE        NOT NULL,
  authorised_by  VARCHAR(120) NOT NULL,
  created_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cert_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
  CONSTRAINT fk_cert_course  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    CHAR(36)     NULL,
  type       VARCHAR(30)  NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT         NOT NULL,
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Indexes for common queries ──────────────────────────────────

CREATE INDEX idx_students_course   ON students(course_id);
CREATE INDEX idx_students_batch    ON students(batch_id);
CREATE INDEX idx_students_status   ON students(status);
CREATE INDEX idx_payments_student  ON payments(student_id);
CREATE INDEX idx_payments_date     ON payments(pay_date);
CREATE INDEX idx_attendance_date   ON attendance_records(record_date);
CREATE INDEX idx_exams_date        ON exams(exam_date);
