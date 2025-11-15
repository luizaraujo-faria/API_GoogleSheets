import ApiException from "../errors/ApiException";
import googleSheetsService from "../config/googleSheets";
import { mapSheet, mapSheetRowToRecord } from "../utils/mappers";
import { filterByTurn, searchInSheet } from "../utils/filters";
import { validateParams, validateRangeAndSheetName, validateSheetData } from "../utils/validators";
import { CreateRecordDTO, TimeRecord } from "../types/records/records";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Turns } from "../constants/turns";

dayjs.extend(customParseFormat);

class RecordsService {

    private readonly sheets: any = googleSheetsService.getSheetsApi;
    private readonly spreadSheetId: string | undefined = googleSheetsService.getSpreadsheetId;

    async getAll(range: string, sheetName: string): Promise<any> {

        try{

            validateRangeAndSheetName(range, sheetName);

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range: sheetName
            });

            const values = response.data.values;

            const records = mapSheet<TimeRecord>(values);
            const serializedRecords = validateSheetData<TimeRecord>(records);

            if(!serializedRecords.valid)
                throw new ApiException('Nenhum registro de horário encontrado!', 404);

            const mappedRecords = serializedRecords.data!.map(mapSheetRowToRecord);
                
            return mappedRecords;
        } 
        catch(err: any){
            console.error('Erro no serviço "Buscar todos registros":', err.message);
            throw err;
        }
    }

    async listBySector(range: string, sheetName: string, sector: string): Promise<any> {

        try{

            validateRangeAndSheetName(range, sheetName);

            if(!sector || sector === undefined)
                throw new ApiException('Setor para filtro não fornecido!', 400);

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range: sheetName
            });

            const values = response.data.values;
            const records = mapSheet<TimeRecord>(values);

            const serializedRecords = validateSheetData<TimeRecord>(records);
            if(!serializedRecords.valid)
                throw new ApiException('Nenhum registro foi encontrado!', 404);

            const mappedRecords = serializedRecords.data!.map(mapSheetRowToRecord);

            const filteredRecords = searchInSheet<TimeRecord>({
                data: mappedRecords,
                filters: { sector }
            });

            if(!filteredRecords || filteredRecords.length === 0)
                throw new ApiException('Nenhum registro encontrado com este setor!', 404);

            return filteredRecords;
        }
        catch(err: any){
            console.error(`Erro no serviço "Filtrar por setor": ${err.message}`);
            throw err;
        }
    }

    listByDay = async (range: string, sheetName: string, day: string): Promise<any> => {

        try{

            validateRangeAndSheetName(range, sheetName);
            validateParams(day, 'Dia');

            const formattedDay = dayjs(day, 'DD/MM/YYYY');
            if(!formattedDay.isValid()) 
                throw new ApiException('Data recebida é inválida!', 400);

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range: sheetName
            });

            const values = response.data.values;
            const records = mapSheet<TimeRecord>(values);

            const serializedRecords = validateSheetData<TimeRecord>(records);
            if(!serializedRecords.valid)
                throw new ApiException('Nenhum registro foi encontrado!', 404);

            const mappedRecords = serializedRecords.data!.map(mapSheetRowToRecord);

            const filteredRecords = searchInSheet<TimeRecord>({
                data: mappedRecords,
                filters: { day: formattedDay.format('DD/MM/YY') }
            });

            if(!filteredRecords || filteredRecords.length === 0)
                throw new ApiException('Nenhum registro encontrado com este dia!', 404);

            return filteredRecords;
        }
        catch(err: any){
            console.error(`Erro no serviço "Listar por dia": ${err.message}`);
            throw err;
        }
    }

    listEntryByTurn = async (range: string, sheetName: string, turn: string): Promise<any> => {

        console.log(`TURNO RECEBIDO: ${turn}`)

        try{

            validateRangeAndSheetName(range, sheetName);
            
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadSheetId,
                range: sheetName
            });

            const values = response.data.values;
            const records = mapSheet<TimeRecord>(values);

            const serializedRecords = validateSheetData<TimeRecord>(records);
            if(!serializedRecords.valid)
                throw new ApiException('Nenhum registro foi encontrado!', 404);

            const mappedRecords = serializedRecords.data!.map(mapSheetRowToRecord);

            const turnString = turn
            const turnEnum = turnString as Turns;

            console.log(`TURNO CORVERTIDO: ${turnEnum}`)

            const filteredRecords = filterByTurn<TimeRecord>(mappedRecords, 'entry', turnEnum);
            if(!filteredRecords || filteredRecords.length === 0)
                throw new ApiException('Nenhum registro encontrado com entrada neste turno!', 404);

            return filteredRecords;
        }
        catch(err: any){
            console.error(`Erro no serviço "Listar entrada por turno": ${err.message}`);
            throw err;
        }
    }

    async createRecord(range: string, values: CreateRecordDTO[]): Promise<any> {

        try {

            if (!values || !Array.isArray(values)) {
                throw new ApiException('O campo "values" é obrigatório e deve ser um array', 400);
            }

            // console.log(`Escrevendo dados no range: ${range}`, values);
            
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

            // console.log(`LINHA ALVO: ${targetRow}`);
            // console.log(`Dados existentes:`, existingData);
            
            const sheetName = actualRange.split('!')[0];
            const specificRange = `${sheetName}!A${targetRow}`;
            
            // console.log(`Escrevendo na linha: ${targetRow}`);
            // console.log(`Range específico: ${specificRange}`);

            const createResponse = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadSheetId,
                range: specificRange,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [values]
                }
            });

            // console.log('Dados escritos com sucesso!');
            // console.log('Local:', createResponse.data.updatedRange);
            
            return createResponse;
        } 
        catch(err: any){
            console.error(`Erro no serviço "Criar Registro": ${err.message}`);
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

export default RecordsService;