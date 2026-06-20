import { z } from 'zod';
import { v } from '../../shared/validation/fields.js';
export const issueCertificateSchema = z.object({
    studentId: v.entityId('Student ID'),
    courseId: v.entityId('Course ID'),
    grade: v.gradeRequired(),
    issueDate: v.isoDate('Issue date'),
    authorisedBy: v.personName(),
});
