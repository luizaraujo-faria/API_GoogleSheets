import z, { TypeOf } from 'zod';

export const colaboratorTypeSchema = {
    colaboratorId: z.union([
        z.number({
            required_error: 'ID do colaborador é obrigatório!',
            invalid_type_error: 'ID deve ser um texto ou número!'
        })
        .int('ID de colaborador precisa ser inteiro!'),
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
};

export const colaboratorType = z.object(colaboratorTypeSchema);
export const colaboratorTypePartial = z.object(colaboratorTypeSchema).partial();

export interface Colaborator {
    colaboratorId: number | string;
    name: string;
    sector: string;
}

export interface CreateColaboratorDTO {
    colaboratorId: number | string;
    name: string;
    sector: string;
}

export interface ColaboratorFilter {
    colaboratorId?: number | string;
    name?: string;
    sector?: string;
}