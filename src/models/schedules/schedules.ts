export interface Schedule {
    colaboratorId: number;
    name: string;
    sector: string;
    day: Date;
    entry: Date;
    exit: Date;
    scheduleId: number;
}

export interface CreateScheduleDTO {
    colaboratorId: number;
}

export interface SchedulesFilter {
    colaboratorId?: number;
    name?: string;
    sector?: string;
    day?: Date;
    entry?: Date;
    exit?: Date;
    scheduleId?: number;
}