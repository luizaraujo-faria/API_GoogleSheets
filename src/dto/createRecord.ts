import { z } from 'zod';
import { collaboratorIdSchema, timeSchema } from '../schemas/commonSchema';

export const createRecordRequestSchema = z.object({
  range: z.string().optional(),

  values: z.array(
    z.tuple([collaboratorIdSchema, timeSchema]),
  ).min(1, 'Envie ao menos um colaborador'),
});

export type CreateRecordDTO = z.infer<typeof createRecordRequestSchema>;