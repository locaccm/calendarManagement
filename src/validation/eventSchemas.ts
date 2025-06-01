import { z } from 'zod';

const eventBaseSchema = z.object({
  EVEC_LIB: z.string().min(1, 'Label required'),
  EVED_START: z.string().datetime({ message: 'Invalid start date' }).optional(),
  EVED_END: z.string().datetime({ message: 'Invalid end date' }).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected date format YYYY-MM-DD')
    .optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Expected time format HH:mm')
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Expected time format HH:mm')
    .optional(),
  USEN_ID: z.number().refine((val) => typeof val === 'number', {
    message: 'USEN_ID must be a number',
  }),
  ACCN_ID: z.number().refine((val) => typeof val === 'number', {
    message: 'ACCN_ID must be a number',
  }),
});

export const eventCreateSchema = eventBaseSchema.refine(
  (data) => {
    // Either both ISO dates, or the three separate fields
    const hasIso = data.EVED_START ?? data.EVED_END;
    const hasSplit = data.date && data.startTime && data.endTime;
    return hasIso || hasSplit; // Use camelCase internally
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
      message: 'User must be a number',
    })
    .transform((v, ctx) => {
      if (v === undefined) return undefined;
      if (!/^\d+$/.test(v)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'User must be a number' });
        return z.NEVER;
      }
      return Number(v);
    }),
  logement: z
    .string()
    .optional()
    .refine((v) => v === undefined || /^\d+$/.test(v), {
      message: 'Accommodation must be a number',
    })
    .transform((v, ctx) => {
      if (v === undefined) return undefined;
      if (!/^\d+$/.test(v)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Accommodation must be a number' });
        return z.NEVER;
      }
      return Number(v);
    }),
  dateStart: z.string().optional(),
  dateEnd: z.string().optional(),
});
