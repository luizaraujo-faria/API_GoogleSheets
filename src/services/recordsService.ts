import ApiException from "../errors/ApiException";
import googleSheetsService from "../config/googleSheets";
import { mapSheet, mapSheetRowToRecord } from "../utils/mappers";
import { filterByMonthAndYear, filterByTurn, searchInSheet } from "../utils/filters";
import { validateParams, validateSheetData } from "../utils/validators";
import { colaboratorIdSchema, CreateRecordDTO, recordTypeFields, TimeRecord } from "../types/records";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Turns, turnsTypeSchema } from "../constants/turns";
import { verifyAndUpdateRecordsCache } from "../utils/validateRecordCache";

dayjs.extend(customParseFormat);
dayjs.extend(utc)
dayjs.extend(timezone)

class RecordsService {

    private readonly sheets: any = googleSheetsService.getSheetsApi;
    private readonly spreadSheetId: string | undefined = googleSheetsService.getSpreadsheetId;

    private recordsCache: TimeRecord[] | undefined;

    async getAll(range: string): Promise<TimeRecord[]> {

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range
        });

        const serializedRecords = validateSheetData<TimeRecord>(
            mapSheet<TimeRecord>(response.data.values)
        );

        if(!serializedRecords.valid)
            throw new ApiException('Nenhum registro de horário encontrado!', 404);

        const mappedRecords: TimeRecord[] = serializedRecords.data!.map(mapSheetRowToRecord);
            
        return mappedRecords;
    }

    async listBySector(range: string, sector: string): Promise<TimeRecord[]> {

        const serializedSector = recordTypeFields.sector.parse(sector);

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range
        });

        const serializedRecords = validateSheetData<TimeRecord>(
            mapSheet<TimeRecord>(response.data.values)
        );
        if(!serializedRecords.valid)
            throw new ApiException('Nenhum registro foi encontrado!', 404);

        const filteredRecords: TimeRecord[] = searchInSheet<TimeRecord>({
            data: serializedRecords.data!.map(mapSheetRowToRecord),
            filters: { sector: serializedSector }
        });

        if(!filteredRecords || filteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado com este setor!', 404);

        return filteredRecords;
    }

    listByDay = async (range: string, day: string): Promise<TimeRecord[]> => {

        const serializedDay = recordTypeFields.day.parse(day);

        const formattedDay: dayjs.Dayjs = dayjs(serializedDay, 'DD/MM/YY');
        if(!formattedDay.isValid())
            throw new ApiException('Data recebida é inválida!', 400);

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range
        });

        const serializedRecords = validateSheetData<TimeRecord>(
            mapSheet<TimeRecord>(response.data.values)
        );
        if(!serializedRecords.valid)
            throw new ApiException('Nenhum registro foi encontrado!', 404);

        const filteredRecords: TimeRecord[] = searchInSheet<TimeRecord>({
            data: serializedRecords.data!.map(mapSheetRowToRecord),
            filters: { day: formattedDay.format('DD/MM/YY') }
        });

        if(!filteredRecords || filteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado com este dia!', 404);

        return filteredRecords;
    }

    listEntryByTurn = async (range: string, turn: string): Promise<TimeRecord[]> => {

        const serializedTurn: Turns = turnsTypeSchema.parse(turn.toLowerCase()) as Turns;
        
        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range
        });

        const serializedRecords = validateSheetData<TimeRecord>(
            mapSheet<TimeRecord>(response.data.values)
        );

        if(!serializedRecords.valid)
            throw new ApiException('Nenhum registro foi encontrado!', 404);

        const filteredRecords: TimeRecord[] = filterByTurn<TimeRecord>(
            serializedRecords.data!.map(mapSheetRowToRecord),
            'entry', serializedTurn
        );

        if(!filteredRecords || filteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado com entrada neste turno!', 404);

        return filteredRecords;
    }

    listMealCountByColaboratorIdByMonth = async (
        range: string, 
        colaboratorId: string, 
        month: string, 
        turn?: string
    ): Promise<number> => {

        let serializedTurn: Turns | undefined = undefined;
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns;

        this.recordsCache = await verifyAndUpdateRecordsCache(
            this.recordsCache,
            this.sheets,
            this.spreadSheetId,
            range
        );

        const filteredRecordsByColaboratorId: TimeRecord[] = searchInSheet<TimeRecord>({
            data: this.recordsCache!,
            filters: { colaboratorId }
        });

        const monthlyRecords: TimeRecord[] | undefined = filterByMonthAndYear<TimeRecord>(
            filteredRecordsByColaboratorId,
            targetMonth,
            currentYear,
        );

        const finalFilteredRecords: TimeRecord[] | undefined = turn ? 
            filterByTurn<TimeRecord>(monthlyRecords!, 'entry', serializedTurn!) 
            : monthlyRecords;
    
        if(!finalFilteredRecords || finalFilteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado para este colaborador neste mês e ou turno!', 404);

        const mealCount: number = finalFilteredRecords.length;

        return mealCount;
    }

    listMealCountBySectorByMonth = async (
        range: string,
        sector: string,
        month: string,
        turn?: string
    ): Promise<number> => {

        let serializedTurn: Turns | undefined = undefined;
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns;

        this.recordsCache = await verifyAndUpdateRecordsCache(
            this.recordsCache,
            this.sheets,
            this.spreadSheetId,
            range
        );

        const filteredRecordsBySector: TimeRecord[] = searchInSheet<TimeRecord>({
            data: this.recordsCache!,
            filters: { sector }
        });

        const monthlyRecords: TimeRecord[] | undefined = filterByMonthAndYear<TimeRecord>(
            filteredRecordsBySector,
            targetMonth,
            currentYear,
        );

        const finalFilteredRecords: TimeRecord[] | undefined = turn ? 
            filterByTurn<TimeRecord>(monthlyRecords!, 'entry', serializedTurn!) 
            : monthlyRecords;
    
        if(!finalFilteredRecords || finalFilteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado para este setor neste mês e ou turno!', 404);

        const mealCount: number = finalFilteredRecords.length;

        return mealCount;
    }

    listMostMealCountSectorsByMonth = async (
        range: string,
        month: string,
        turn?: string
    ): Promise<any[]> => {

        let serializedTurn: Turns | undefined = undefined;
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns;

        this.recordsCache = await verifyAndUpdateRecordsCache(
            this.recordsCache,
            this.sheets,
            this.spreadSheetId,
            range
        );

        const records: TimeRecord[] | undefined = this.recordsCache;

        const monthlyRecords = filterByMonthAndYear(
            records,
            targetMonth,
            currentYear
        );

        const filteredRecordsByTurn: TimeRecord[] | undefined = turn ? 
            filterByTurn<TimeRecord>(monthlyRecords!, 'entry', serializedTurn!) 
            : monthlyRecords;

        const finalFilteredRecords = turn ? filteredRecordsByTurn : monthlyRecords;

        const countBySector: any = {};

        finalFilteredRecords!.forEach((record) => {
            const sector = record.sector;

            if(!countBySector[sector]){
                countBySector[sector] = 1;
            }
            else{
                countBySector[sector]++;
            }
        });

        const orderedRecords = Object.entries(countBySector)
            .map(([sector, total]) => ({ sector, total }))
            .sort((a: any, b: any) => ( b.total - a.total ));

        const mostFiveMealSectors = orderedRecords.slice(0, 5);

        return mostFiveMealSectors;
    }

    sendRecord = async (range: string, values: CreateRecordDTO[]): Promise<void> => {

        console.log('Serviço de registro disparado!');

        // Normaliza para lista
        const records = Array.isArray(values) ? values : [values];

        const actualRange =
            range && range.includes("!") ? range : `${range || "EntradaSaida"}!A:F`;

        const sheetName = actualRange.includes("!")
            ? actualRange.split("!")[0]
            : actualRange;

        // Ler planilha APENAS 1 vez
        const readResponse = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range: `${sheetName}!A:F`,
        });

        const rows = (readResponse.data && readResponse.data.values) || [];

        // Detectar header
        const hasHeader =
            rows.length > 0 &&
            rows[0].some(
                (cell: any) =>
                    typeof cell === "string" && /colaborador.*id/i.test(cell)
            );

        const dataStartIndex = hasHeader ? 1 : 0;

        // Índices fixos
        const idxColab = 0;
        const idxDay = 3;
        const idxEntry = 4;
        const idxExit = 5;

        // Cache da data de hoje
        const today = dayjs().format("DD/MM/YY");

        // Acumular updates para saída
        const updatesToApply: { range: string; values: any[][] }[] = [];

        // Acumular novas linhas
        const rowsToAppend: any[][] = [];

        // PROCESSAMENTO DOS REGISTROS (LOOP PRINCIPAL)
        for (const record of records) {
            // Validar ID
        const serializedId = colaboratorIdSchema.parse(String(record).trim());

            let foundRowIndex: number | null = null;

            // Encontrar linha existente
            for (let i = rows.length - 1; i >= dataStartIndex; i--) {
                const row = rows[i] || [];

                const rowColab = row[idxColab] ? String(row[idxColab]).trim() : "";
                if (rowColab !== serializedId) continue;

                const rawDay = row[idxDay] ? String(row[idxDay]).trim() : "";
                const rowDayNormalized = rawDay
                    ? dayjs(rawDay, [
                        "DD/MM/YY",
                        "DD/MM/YYYY",
                        "YYYY-MM-DD",
                    ]).format("DD/MM/YY")
                    : "";

                if (rowDayNormalized !== today) continue;

                const entry = row[idxEntry] ? String(row[idxEntry]).trim() : "";
                const exit = row[idxExit] ? String(row[idxExit]).trim() : "";

                const exitIsEmpty =
                    !exit || exit === "xx:xx" || exit === "XX:XX" || exit === "N/A";

                if (entry && exitIsEmpty) {
                    foundRowIndex = i;
                    break;
                }
            }

            // Atualizar saída de um registro existente
            if (foundRowIndex !== null) {
                const spreadsheetRow = foundRowIndex + 1;
                const nowTime = dayjs().tz('America/Sao_Paulo').format("HH:mm");

                console.log(`DATA DE SAIDA: ${nowTime}`)

                // Converter idxExit → letra
                const exitColumnLetter = (() => {
                    let n = idxExit;
                    let s = "";
                    while (n >= 0) {
                        s = String.fromCharCode((n % 26) + 65) + s;
                        n = Math.floor(n / 26) - 1;
                    }
                    return s;
                })();

                const updateRange = `${sheetName}!${exitColumnLetter}${spreadsheetRow}`;

                // Acumula para batchUpdate (não envia ainda)
                updatesToApply.push({
                    range: updateRange,
                    values: [[nowTime]],
                });

                continue;
            }

            // Criar nova linha
            const newRow: any[] = [];
            newRow[idxColab] = serializedId;

            rowsToAppend.push(newRow);

            // Adiciona localmente para futuras detecções dentro do mesmo lote
            rows.push(newRow);
        }

        // EXECUTAR UPDATES EM LOTE (saídas)
        if (updatesToApply.length > 0) {
            await this.sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: this.spreadSheetId,
                requestBody: {
                    data: updatesToApply,
                    valueInputOption: "USER_ENTERED",
                },
            });
        }

        // ADICIONAR NOVAS LINHAS (append único)
        if (rowsToAppend.length > 0) {
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadSheetId,
                range: `${sheetName}!A:G`,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: rowsToAppend,
                },
            });
        }

        return;
    };
}

export default RecordsService;