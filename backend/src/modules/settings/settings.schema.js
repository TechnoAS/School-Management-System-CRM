import { z } from 'zod';
import { v } from '../../shared/validation/fields.js';
export const updateInstituteSchema = z.object({
    name: v.personName().optional(),
    phone: v.phoneOptional(),
    email: v.optionalEmail(),
    address: v.addressOptional(),
    registrationNo: v.registrationNo(),
    academicYear: v.academicYear().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
});
export const updateReceiptConfigSchema = z.object({
    prefix: v.receiptPrefix().optional(),
    startingNumber: v.receiptNumber().optional(),
    footerText: z.string().max(500).optional(),
    showLogo: z.enum(['yes', 'no']).optional(),
    printFormat: z.enum(['A4', 'A5', 'Thermal']).optional(),
});
export const updateCertificateConfigSchema = z.object({
    prefix: v.receiptPrefix().optional(),
    authorisedBy: v.personName().optional(),
    bodyText: z.string().max(2000).optional(),
});
export const pageIdSchema = z.enum(['dashboard']);
export const dashboardWidgetSchema = z.object({
    id: z.string().min(1).max(64),
    type: z.enum(['stat', 'area', 'bar', 'line', 'pie', 'donut', 'horizontal-bar', 'list']),
    title: z.string().min(1).max(120),
    subtitle: z.string().max(200).optional(),
    span: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    visible: z.boolean(),
    dataSource: z.string().min(1).max(64),
    colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(12).optional(),
    icon: z.string().max(32).optional(),
});
export const pageLayoutSchema = z.object({
    widgets: z.array(dashboardWidgetSchema).max(40),
});
export const admissionFieldSchema = z.object({
    id: z.string().min(1).max(64),
    label: z.string().min(1).max(120),
    placeholder: z.string().max(200).optional(),
    type: z.enum(['text', 'textarea', 'date', 'number', 'select']),
    required: z.boolean().default(false),
    options: z.array(z.string().max(80)).max(20).optional(),
});
export const admissionDocumentSlotSchema = z.object({
    id: z.string().min(1).max(64),
    label: z.string().min(1).max(120),
    description: z.string().max(300).optional(),
    required: z.boolean().default(false),
    accept: z.string().max(120).optional(),
});
export const admissionFormConfigSchema = z.object({
    customFields: z.array(admissionFieldSchema).max(30),
    documentSlots: z.array(admissionDocumentSlotSchema).max(15),
});
