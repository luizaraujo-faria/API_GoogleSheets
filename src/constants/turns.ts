export enum Turns {
    MORNING = 'manha',
    AFTERNOON = 'tarde',
    NIGHT = 'noite'
}

export const TurnsRange = {
    [Turns.MORNING]: {
        start: '06:00',
        end: '11:59'
    },
    [Turns.AFTERNOON]: {
        start: '12:00',
        end: '17:59'
    },
    [Turns.NIGHT]: {
        start: '18:00',
        end: '23:59'
    }
} as const;