import googleSheetsService from "../config/googleSheets";
import ApiException from "../errors/ApiException";
import { Colaborator } from "../types/colaborator/colaborator";
import { searchInSheet } from "../utils/filters";
import { mapSheet, mapSheetRowToColaborator } from "../utils/mappers";
import { validateSheetData } from "../utils/validators";

class ColaboratorService {

    private readonly sheets: any = googleSheetsService.getSheetsApi;
    private readonly spreadSheetId?: string = googleSheetsService.getSpreadsheetId;

    getAll = async (range: string): Promise<Colaborator[]> => {

        try{

            if(!range || range === undefined)
                throw new ApiException('Nome da folha não informado!', 400);

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range
            });

            const serializedColaborators = validateSheetData<Colaborator>(
                mapSheet<Colaborator>(response.data.values)
            );
            if(!serializedColaborators.valid)
                throw new ApiException('Nenhum colaborador encontrado na planilha!', 404);

            const mappedColaborators = serializedColaborators.data!.map(mapSheetRowToColaborator);

            return mappedColaborators;
        }
        catch(err: any){
            console.error(`Erro no serviço "Buscar colaboradores": ${err.message}`);
            throw err;
        }
    }

    getById = async (range: string, colaboratorId: string): Promise<Colaborator[]> => {

        try{
            
            if(!colaboratorId)
                throw new ApiException('ID do colaborador não fornecido!', 400);

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range
            });

            const serializedColaborators = validateSheetData<Colaborator>(
                mapSheet<Colaborator>(response.data.values)
            );
            if(!serializedColaborators.valid)
                throw new ApiException('Nenhum colaborador encontrado na planilha!', 404);

            const mappedColaborators = serializedColaborators.data!.map(mapSheetRowToColaborator);
            const filteredById = searchInSheet<Colaborator>({
                data: mappedColaborators,
                filters: { colaboratorId }
            });

            if(!filteredById || filteredById.length === 0)
                throw new ApiException('Nenhum colaborador encontrado com este ID!', 404);

            return filteredById;
        }
        catch(err: any){
            console.log(`Erro no serviço "Buscar por ID": ${err.message}`);
            throw err;
        }
    }

    listBySector = async (range: string, sector: string): Promise<Colaborator[]> => {
    
        try{

            if(!sector)
                throw new ApiException('Setor não informado para busca!', 400);

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range
            });

            const serializedColaborators = validateSheetData<Colaborator>(
                mapSheet<Colaborator>(response.data.values)
            );
            if(!serializedColaborators.valid)
                throw new ApiException('Nenhum colaborador encontrado na planilha!', 404);

            const mappedColaborators = serializedColaborators.data!.map(mapSheetRowToColaborator);
            const filteredColaborators = searchInSheet<Colaborator>({
                data: mappedColaborators,
                filters: { sector }
            });

            if(!filteredColaborators || filteredColaborators.length === 0)
                throw new ApiException('Nenhum colaborador encontrado com este setor!', 404);

            return filteredColaborators;
        }
        catch(err: any){
            console.error(`Erro no serviço "Listar por setor": ${err.message}`);
            throw err;
        }
    }

    
}

export default ColaboratorService;