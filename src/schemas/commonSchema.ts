import { z } from 'zod';

export const collaboratorIdSchema = z.union([
  z.number()
    .int('ID precisa ser inteiro')
    .nonnegative(),

  z.string()
    .regex(/^\d+$/, 'ID deve ser numérico')
    .nonempty(),
]);

export const textFieldSchema = z.string()
  .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ -]+$/, 'Deve conter apenas letras')
  .min(2, 'Deve conter no mínimo duas letras');

export const daySchema = z.string().refine((val) => {
  const regex = /^(\d{1,2})-(\d{1,2})-(\d{2})$/;
  const match = val.match(regex);
  if (!match) return false;

  const [, d, m, y] = match.map(Number);
  const fullYear = 2000 + y;
  const parsed = new Date(fullYear, m - 1, d);

  return (
    parsed.getFullYear() === fullYear &&
    parsed.getMonth() === m - 1 &&
    parsed.getDate() === d
  );
}, {
  message: 'Formato de data inválido ou data inconsistente',
});