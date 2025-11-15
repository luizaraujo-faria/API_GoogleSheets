import { Record, CreateRecordDTO, RecordsFilter } from './records';

class RecordsModel {

    static fromSheetData(row: any[]): Record{

        return {
            colaboratorId: Number(row[0]),
            name: row[1],
            sector: row[2],
            day: new Date(row[3]),
            entry: new Date(row[4]),
            exit: new Date(row[5]),
            recordId: Number(row[6])
        };
    }

    static toSheetData(dto: CreateRecordDTO): any[] {

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

    static calculatesTime(record: Record): number {
        const diffMs = record.exit.getTime() - record.entry.getTime();
        return diffMs / (1000 * 60 * 60); // Retorna horas
    }

      static formatarHoras(record: Record): string {
        const hours = this.calculatesTime(record);
        const intHours = Math.floor(hours);
        const minutes = Math.round((hours - intHours) * 60);
        return `${intHours}h${minutes.toString().padStart(2, '0')}m`;
    }

    static filterRecords(
        records: Record[], 
        filters: RecordsFilter
    ): Record[] {

        return records.filter(record => {
        if (filters.colaboratorId && record.colaboratorId !== filters.colaboratorId) {
            return false;
        }
        
        if(filters.name && !record.name.toLowerCase().includes(filters.name.toLowerCase())) {
            return false;
        }
        
        if (filters.sector && record.sector.toLowerCase() !== filters.sector.toLowerCase()) {
            return false;
        }
        
        if (filters.day && !this.isSameDay(record.day, filters.day)) {
            return false;
        }
        
        if (filters.entry && record.entry < filters.entry) {
            return false;
        }
        
        if (filters.exit && record.exit < filters.exit) {
            return false;
        }
        
        return true;
        });
    }

    static filterByDay(records: Record[], day: Date): Record[] {
        return this.filterRecords(records, { day });
    }

    static filterBySector(records: Record[], sector: string): Record[] {
        return this.filterRecords(records, { sector });
    }

    static filterByColaborator(records: Record[], colaboratorId: number): Record[] {
        return this.filterRecords(records, { colaboratorId });
    }

    static filterByEntry(records: Record[], start: Date): Record[] {
        return this.filterRecords(records, { entry: start });
    }

    static filterByExit(records: Record[], start: Date): Record[] {
        return this.filterRecords(records, { exit: start});
    }

    private static isSameDay(date1: Date, date2: Date): boolean {
        return date1.toDateString() === date2.toDateString();
    }
}

export default RecordsModel;