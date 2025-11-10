import { Schedule, CreateScheduleDTO, SchedulesFilter } from "./schedules";

class ScheduleModel {

    static fromSheetData(row: any[]): Schedule{

        return {
            colaboratorId: Number(row[0]),
            name: row[1],
            sector: row[2],
            day: new Date(row[3]),
            entry: new Date(row[4]),
            exit: new Date(row[5]),
            scheduleId: Number(row[6])
        };
    }

    static toSheetData(dto: CreateScheduleDTO): any[] {

        return [
            dto.colaboratorId,
            '',
            '',
            '',
            '',
            '',
            '',
        ];
    }

    static calculatesTime(schedule: Schedule): number {
        const diffMs = schedule.exit.getTime() - schedule.entry.getTime();
        return diffMs / (1000 * 60 * 60); // Retorna horas
    }

      static formatarHoras(schedule: Schedule): string {
        const hours = this.calculatesTime(schedule);
        const intHours = Math.floor(hours);
        const minutes = Math.round((hours - intHours) * 60);
        return `${intHours}h${minutes.toString().padStart(2, '0')}m`;
    }

    static filterRecords(
        records: Schedule[], 
        filters: SchedulesFilter
    ): Schedule[] {

        return records.filter(record => {
        if (filters.colaboratorId && record.colaboratorId !== filters.colaboratorId) {
            return false;
        }
        
        if(filters.name && !record.name.toLowerCase().includes(filters.name.toLowerCase())) {
            return false;
        }
        
        if (filters.department && record.department.toLowerCase() !== filters.department.toLowerCase()) {
            return false;
        }
        
        if (filters.date && !this.isSameDay(record.date, filters.date)) {
            return false;
        }
        
        if (filters.entryTimeStart && record.entryTime < filters.entryTimeStart) {
            return false;
        }
        if (filters.entryTimeEnd && record.entryTime > filters.entryTimeEnd) {
            return false;
        }
        
        if (filters.exitTimeStart && record.exitTime < filters.exitTimeStart) {
            return false;
        }
        if (filters.exitTimeEnd && record.exitTime > filters.exitTimeEnd) {
            return false;
        }
        
        return true;
        });
    }

    static filterByDate(schedules: Schedule[], date: Date): Schedule[] {
        return this.filterRecords(records, { date });
    }

    static filterByDepartment(records: CafeteriaRecord[], department: string): CafeteriaRecord[] {
        return this.filterRecords(records, { department });
    }

    static filterByEmployee(records: CafeteriaRecord[], employeeId: number): CafeteriaRecord[] {
        return this.filterRecords(records, { employeeId });
    }

    static filterByEntryTimeRange(records: CafeteriaRecord[], start: Date, end: Date): CafeteriaRecord[] {
        return this.filterRecords(records, { entryTimeStart: start, entryTimeEnd: end });
    }

    static filterByExitTimeRange(records: CafeteriaRecord[], start: Date, end: Date): CafeteriaRecord[] {
        return this.filterRecords(records, { exitTimeStart: start, exitTimeEnd: end });
    }

    private static isSameDay(date1: Date, date2: Date): boolean {
        return date1.toDateString() === date2.toDateString();
    }
}