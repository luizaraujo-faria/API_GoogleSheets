import googleSheetsService from "../config/googleSheets";
import ApiException from "../errors/ApiException";
import { Colaborator } from "../types/colaborator/colaborator";
import { mapSheet } from "../utils/mappers";
import { validateSheetData } from "../utils/validators";

class ColaboratorService {

    private readonly sheets: any = googleSheetsService.getSheetsApi;
    private readonly spreadSheetId?: string = googleSheetsService.getSpreadsheetId;

    async getAll(range: string): Promise<any> {

        try{

            if(!range || range === undefined)
                throw new ApiException('Nome da folha não informado!', 400);

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range: range
            });

            const values = response.data.values;

            const colaborators = mapSheet<Colaborator>(values);
            const serializedColaborators = validateSheetData<Colaborator>(colaborators);

            if(!serializedColaborators.valid)
                throw new ApiException('Nenhum colaborador foi encontrado!', 404);

            return serializedColaborators.data;
        }
        catch(err: any){
            console.error(`Erro no serviço "Buscar colaboradores": ${err.message}`);
            throw err;
        }
    }
}

export default ColaboratorService;