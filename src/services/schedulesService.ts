import ApiException from "../errors/ApiException";
import GoogleSheetsResponse from '../responses/googleSheetsResponse'
import googleSheetsService from "../config/googleSheets";


class SchedulesService {

    private readonly sheets: any = googleSheetsService.getSheetsApi;
    private readonly spreadSheetId: string | undefined = googleSheetsService.getSpreadsheetId;

    // BUSCAR DADOS
    async getAll(range: string, sheetName: string): Promise<any> {

        try{

            if(!range || range === undefined)
                throw new ApiException('Range da folha não informado!', 400);
            
            if(!sheetName || sheetName === undefined)
                throw new ApiException('Nome da folha não informado!', 400);

            const schedules = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range: sheetName
            });

            // const serializedData = schedules.;

            if(!schedules.data.values || schedules.data.values.length === 0)
                throw new ApiException('Nenhum registro de horário encontrado!', 404);

            return schedules;
        } 
        catch(err: any){
            console.error('Erro ao ler dados:', err.message);
            throw err;
        }
    }

//     async listBySector(range: string = 'Página1!A:Z', field: string, sector: string): Promise<GoogleSheetsResponse> {

//     try{

//         const readResponse = await this.sheets.spreadsheets.values.get({
//             spreadsheetId: this.SPREADSHEET_ID,
//             range
//         });

//         const rows = readResponse.data.values || [];

//         const headers = rows[0];
//         const sectorIndex = headers.indexOf('Setor');

//         if(sectorIndex === -1){
//             throw new ApiException('Coluna "Setor" não encontrada!', 404);
//         }

//         const filteredRows = rows.filter((row: {}, i: number) => {
        
//         });

//         return { 
//             success: true,
        
//         }
//     }
//     catch(err: any){
//         console.log('Erro ao listar por setor:', err.message);
//         return {
//             success: false,
//             error: err.message
//         }
//     }
//     }

    // CRIAR DADOS
    async writeData(range: string, values: any[]): Promise<any> {

        try {

            if (!values || !Array.isArray(values)) {
                throw new ApiException('O campo "values" é obrigatório e deve ser um array', 400);
            }

            console.log(`Escrevendo dados no range: ${range}`, values);
            
            let actualRange = range;
            if(!range.includes('!')){
                actualRange = `${range}!A:Z`;
            }
            
            // Primeiro, ler para encontrar a próxima linha vazia
            const readResponse = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range: actualRange,
            });

            const existingData = readResponse.data.values || [];
            let targetRow = 1;

            for(let i = 0; i < existingData.length; i++){
                if(!existingData[i] || !existingData[i][0] || existingData[i][0] === "" || existingData[i][0] === "Não informado"){
                    targetRow = i + 1;
                    break;
                }
            }

            if(targetRow === 1 && existingData.length > 0){
                targetRow = existingData.length + 1;
            }

            console.log(`LINHA ALVO: ${targetRow}`);
            console.log(`Dados existentes:`, existingData);
            
            const sheetName = actualRange.split('!')[0];
            const specificRange = `${sheetName}!A${targetRow}`;
            
            console.log(`Escrevendo na linha: ${targetRow}`);
            console.log(`Range específico: ${specificRange}`);

            const createResponse = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadSheetId,
                range: specificRange,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [values]
                }
            });

            console.log('Dados escritos com sucesso!');
            console.log('Local:', createResponse.data.updatedRange);
            
            return createResponse;
        } 
        catch(err: any){
            console.error(`Erro ao escrever dados: ${err.message}`);
            return err.message;
        }
    }

//     // ATUALIZAR DADOS
//     async updateData(range: string, values: any[]): Promise<GoogleSheetsResponse> {

//     try{
//         console.log(`Atualizando dados no range ${range}`, values);

//         if(!range.includes('!') || !range.match(/[A-Z]+\d+/)){
//         throw new Error('Range deve ser específico (ex: Sheet1!A1, Sheet1!B2:D5)');
//         }

//         const updateResponse = await this.sheets.spreadsheets.values.update({
//         spreadsheetId: this.SPREADSHEET_ID,
//         range: range,
//         valueInputOption: 'USER_ENTERED',
//         requestBody: {
//             values: [values]
//         }
//         });

//         return {
//             success: true,
//             message: 'Dados atualizados com sucesso',
//             data: updateResponse.data
//         }
//     }
//     catch(err: any){
//         console.error(`Erro ao atualizar dados: ${err.message}`);
//         return {
//             success: false,
//             error: err.message
//         };
//     }
//     }
}

export default SchedulesService;