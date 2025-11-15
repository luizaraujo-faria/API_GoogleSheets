import { Colaborator, CreateColaboratorDTO, ColaboratorFilter } from './colaborator';

class ColaboratorModel {

    static fromSheetData(row: any[]): Colaborator{

        return {
            colaboratorId: Number(row[0]),
            name: row[1],
            sector: row[2],
        };
    }

    static toSheetData(dto: CreateColaboratorDTO): any[] {

        return [
            // dto.colaboratorId,
            dto.name,
            dto.sector,
        ];
    }

    static filterColaborator(
        records: Colaborator[], 
        filters: ColaboratorFilter
    ): Colaborator[] {

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
        
        return true;
        });
    }

    static filterBySector(records: Colaborator[], sector: string): Colaborator[] {
        return this.filterColaborator(records, { sector });
    }

    static filterByColaboratorId(records: Colaborator[], colaboratorId: number): Colaborator[] {
        return this.filterColaborator(records, { colaboratorId });
    }

    static filterByName(records: Colaborator[], name: string): Colaborator[] {
        return this.filterColaborator(records, { name });
    }
}

export default ColaboratorModel;