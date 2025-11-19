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