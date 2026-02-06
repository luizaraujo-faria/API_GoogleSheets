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

// SCHEMA DE VALIDAÇÃO DO TIPO COLLABORATOR
export const collaboratorTypeSchema = {
    collaboratorId: z.union([
        z.number({
            required_error: 'ID do colaborador é obrigatório!',
            invalid_type_error: 'ID deve ser um texto ou número!'
        })
        .int('ID de colaborador precisa ser inteiro!')
        .nonnegative(),
        z.string({
            required_error: 'ID do colaborador é obrigatório!'
        })
        .regex(/^\d+$/, 'ID deve ser numérico')
        .nonempty()
    ]),
    
    name: z.string({
            required_error: 'O nome é obrigatório',
            invalid_type_error: 'Nome deve ser um texto válido!'
        })
        .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ -]+$/, 'Nome deve conter apenas letras!')
        .min(2, 'Deve conter no mínimo duas letras!')
        .nonempty(),

    sector: z.string({
            required_error: 'O setor é obrigatório',
            invalid_type_error: 'Setor deve ser um texto válido!'
        })
        .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ -]+$/, 'Setor deve conter apenas letras!')
        .min(2, 'Deve conter no mínimo duas letras!')
        .nonempty(),
    
    type: z.enum(['Residente', 'Visitante', 'Terceirizado', 'Colaborador'], {
        errorMap: (issue, ctx) => {

            if(issue.code === 'invalid_type' && issue.received === 'undefined'){
                return { message: 'Tipo de colaborador é obrigatório' };
            }
            
            switch (issue.code) {
            case 'invalid_enum_value':
                return { message: 'Tipo de colaborador inválido' };

            case 'invalid_type':
                return { message: 'Tipo de colaborador deve ser uma string' };

            default:
                return { message: ctx.defaultError };
            }
        }
    })
};