import { z } from 'zod';
import {
  collaboratorIdSchema,
  textFieldSchema,
  daySchema,
  collaboratorTypeSchema,
} from './commonSchema';

export const recordsFilterSchema = z.object({
  collaboratorId: collaboratorIdSchema.optional(),

  name: textFieldSchema.optional(),

  sector: textFieldSchema.optional(),

  type: z.enum([
    'residente',
    'visitante',
    'terceirizado',
    'colaborador',
  ]).optional(),

  day: daySchema.optional(),

  entry: z.date().optional(),

  exit: z.date().optional(),

  recordId: z.number()
    .int()
    .nonnegative()
    .optional(),
});