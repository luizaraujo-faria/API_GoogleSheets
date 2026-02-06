export const recordsRanges = {
    fullRange: 'EntradaSaida!A:G',
    
    byColId: 'EntradaSaida!A:A',
    byName: 'EntradaSaida!B:B',
    bySector: 'EntradaSaida!C:C',
    byType: 'EntradaSaida!D:D',
    byDay: 'EntradaSaida!E:E',
    byEntry: 'EntradaSaida!F:F',
    byExit: 'EntradaSaida!G:G',
} as const;

export const collaboratorRanges = {
    fullRange: 'Colaboradores!A:D',

    byColId: 'Colaboradores!A:A',
    byName: 'Colaboradores!B:B',
    bySector: 'ColaboradoresC:C',
    byType: 'Colaboradores!D:D',
} as const;