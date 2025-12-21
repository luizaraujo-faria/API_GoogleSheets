import z from 'zod';

export const turnsTypeSchema = z.enum(['cafe_da_manha', 'almoco', 'cafe_da_tarde'], {
    required_error: 'Turno é obrigatório!',
    invalid_type_error: 'Turno inválido!'
})

export enum Turns {
    BREAKFAST = 'cafe_da_manha',
    LUNCH = 'almoco',
    AFTERNOON_COFFEE = 'cafe_da_tarde'
}

export const TurnsRange = {
    [Turns.BREAKFAST]: {
        start: '06:30',
        end: '11:00'
    },
    [Turns.LUNCH]: {
        start: '11:30',
        end: '14:45'
    },
    [Turns.AFTERNOON_COFFEE]: {
        start: '15:00',
        end: '23:59'
    }
} as const;