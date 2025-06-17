"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventFilterQuerySchema = exports.eventIdParamSchema = exports.eventUpdateSchema = exports.eventCreateSchema = void 0;
const zod_1 = require("zod");
const eventBaseSchema = zod_1.z.object({
    EVEC_LIB: zod_1.z.string().min(1, 'Libellé requis'),
    EVED_START: zod_1.z.string().datetime({ message: 'Date de début invalide' }).optional(),
    EVED_END: zod_1.z.string().datetime({ message: 'Date de fin invalide' }).optional(),
    date: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date attendu YYYY-MM-DD')
        .optional(),
    startTime: zod_1.z
        .string()
        .regex(/^\d{2}:\d{2}$/, 'Format heure attendu HH:mm')
        .optional(),
    endTime: zod_1.z
        .string()
        .regex(/^\d{2}:\d{2}$/, 'Format heure attendu HH:mm')
        .optional(),
    USEN_ID: zod_1.z.number().refine((val) => typeof val === 'number', {
        message: 'USEN_ID doit être un nombre',
    }),
    ACCN_ID: zod_1.z.number().refine((val) => typeof val === 'number', {
        message: 'ACCN_ID doit être un nombre',
    }),
});
exports.eventCreateSchema = eventBaseSchema.refine((data) => {
    // Soit les deux ISO, soit les trois séparés
    const hasISO = data.EVED_START && data.EVED_END;
    const hasSplit = data.date && data.startTime && data.endTime;
    return hasISO || hasSplit;
}, {
    message: 'Il faut fournir soit EVED_START/EVED_END, soit date/startTime/endTime',
});
exports.eventUpdateSchema = eventBaseSchema.partial();
exports.eventIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'ID invalide'),
});
exports.eventFilterQuerySchema = zod_1.z.object({
    usager: zod_1.z
        .string()
        .optional()
        .refine((v) => v === undefined || /^\d+$/.test(v), {
        message: 'usager doit être un nombre',
    })
        .transform((v, ctx) => {
        if (v === undefined)
            return undefined;
        if (!/^\d+$/.test(v)) {
            ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'usager doit être un nombre' });
            return zod_1.z.NEVER;
        }
        return Number(v);
    }),
    logement: zod_1.z
        .string()
        .optional()
        .refine((v) => v === undefined || /^\d+$/.test(v), {
        message: 'logement doit être un nombre',
    })
        .transform((v, ctx) => {
        if (v === undefined)
            return undefined;
        if (!/^\d+$/.test(v)) {
            ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'logement doit être un nombre' });
            return zod_1.z.NEVER;
        }
        return Number(v);
    }),
    dateStart: zod_1.z.string().optional(),
    dateEnd: zod_1.z.string().optional(),
});
