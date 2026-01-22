import z from 'zod';

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

export const collaboratorType = z.object(collaboratorTypeSchema);
export const collaboratorTypePartial = z.object(collaboratorTypeSchema).partial();

export interface Collaborator {
    collaboratorId: number | string;
    name: string;
    sector: string;
    type: string;
}

export interface CreateCollaboratorDTO {
    collaboratorId: number | string;
    name: string;
    sector: string;
    type: string;
}

export interface CollaboratorFilter {
    collaboratorId?: number | string;
    name?: string;
    sector?: string;
    type?: string;
}