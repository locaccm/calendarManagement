import { z } from 'zod';

const eventBaseSchema = z.object({
  EVEC_LIB: z.string().min(1, 'Libellé requis'),
  EVED_START: z.string().datetime({ message: 'Date de début invalide' }).optional(),
  EVED_END: z.string().datetime({ message: 'Date de fin invalide' }).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date attendu YYYY-MM-DD')
    .optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format heure attendu HH:mm')
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format heure attendu HH:mm')
    .optional(),
  USEN_ID: z.number().refine((val) => typeof val === 'number', {
    message: 'USEN_ID doit être un nombre',
  }),
  ACCN_ID: z.number().refine((val) => typeof val === 'number', {
    message: 'ACCN_ID doit être un nombre',
  }),
});

export const eventCreateSchema = eventBaseSchema.refine(
  (data) => {
    // Soit les deux ISO, soit les trois séparés
    const hasISO = data.EVED_START && data.EVED_END;
    const hasSplit = data.date && data.startTime && data.endTime;
    return hasISO || hasSplit;
  },
  {
    message: 'Il faut fournir soit EVED_START/EVED_END, soit date/startTime/endTime',
  },
);

export const eventUpdateSchema = eventBaseSchema.partial();

export const eventIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID invalide'),
});

export const eventFilterQuerySchema = z.object({
  usager: z
    .string()
    .optional()
    .refine((v) => v === undefined || /^\d+$/.test(v), {
      message: 'usager doit être un nombre',
    })
    .transform((v, ctx) => {
      if (v === undefined) return undefined;
      if (!/^\d+$/.test(v)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'usager doit être un nombre' });
        return z.NEVER;
      }
      return Number(v);
    }),
  logement: z
    .string()
    .optional()
    .refine((v) => v === undefined || /^\d+$/.test(v), {
      message: 'logement doit être un nombre',
    })
    .transform((v, ctx) => {
      if (v === undefined) return undefined;
      if (!/^\d+$/.test(v)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'logement doit être un nombre' });
        return z.NEVER;
      }
      return Number(v);
    }),
  dateStart: z.string().optional(),
  dateEnd: z.string().optional(),
});
