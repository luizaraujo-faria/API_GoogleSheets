import googleSheetsService from "../config/googleSheets";
import ApiException from "../errors/ApiException";

class ColaboratorService {

    private readonly sheets: any = googleSheetsService.getSheetsApi;
    private readonly spreadSheetId?: string = googleSheetsService.getSpreadsheetId;

    async getAll(range: string): Promise<any> {

        try{

            if(!range || range === undefined)
                throw new ApiException('Nome da folha não informado!', 400);

            const colaborators: [] = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range: range
            });

            if(!colaborators || colaborators.length === 0)
                throw new ApiException('Nenhum colaborador foi encontrado!', 404);

            return colaborators

        }
        catch(err: any){
            console.error(`Erro no serviço "Buscar colaboradores": ${err.message}`);
            throw err;
        }
    }
}

export default ColaboratorService;