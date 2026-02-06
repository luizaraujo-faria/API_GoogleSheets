import z from "zod";
import { collaboratorIdSchema, collaboratorTypeSchema } from "./commonSchema";

export const collaboratorFilterSchema = z.object({
  collaboratorId: collaboratorIdSchema.optional(),

  name: collaboratorTypeSchema.name.optional(),

  sector: collaboratorTypeSchema.sector.optional(),

  type: collaboratorTypeSchema.type.optional(),

});

export const collaboratorType = z.object(collaboratorTypeSchema);