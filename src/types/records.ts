import z from 'zod';

export const recordTypeFields = {

    colaboratorId: z.union([
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

    day: z.string({
        required_error: "Dia é obrigatório",
        invalid_type_error: "Formato de data inválido, use DD-MM-YY"
    }).refine((val) => {
        // regex para dia-mês-ano (2 dígitos)
        const regex = /^(\d{1,2})-(\d{1,2})-(\d{2})$/;
        const match = val.match(regex);

        if (!match) return false;

        const [_, day, month, year] = match.map(Number);
        // adiciona 2000 para converter 2 dígitos em ano
        const fullYear = 2000 + year;
        const parsed = new Date(fullYear, month - 1, day);

        // valida consistência: 31-02 -> inválido
        return parsed.getFullYear() === fullYear &&
            parsed.getMonth() === month - 1 &&
            parsed.getDate() === day;
    }, {
        message: "Formato de data inválido ou data inconsistente"
    }),

    entry: z.date({
        invalid_type_error: 'Entrada deve ser um horário válido!'
    }),

    exit: z.date({
        invalid_type_error: 'Saída dever ser um horário válido!'
    }),

    recordId: z.number({
        invalid_type_error: 'ID do registro deve ser um número!',
    })
    .int('ID do registro deve ser um número inteiro!')
    .nonnegative()
}

export const recordType = z.object(recordTypeFields);
export const recordTypePartial = z.object(recordTypeFields).partial();

export interface TimeRecord {
    colaboratorId: number;
    name: string;
    sector: string;
    day: Date | string;
    entry: Date;
    exit: Date;
    recordId: number;
}

export interface CreateRecordDTO {
    colaboratorId: number;
}

export interface RecordsFilter {
    colaboratorId?: number;
    name?: string;
    sector?: string;
    day?: Date;
    entry?: Date;
    exit?: Date;
    id?: number;
}