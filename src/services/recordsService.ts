import ApiException from "../errors/ApiException";
import googleSheetsService from "../config/googleSheets";
import { mapSheet, mapSheetRowToRecord } from "../utils/mappers";
import { filterByMonthAndYear, filterByTurn, searchInSheet } from "../utils/filters";
import { normalizeDay, validateSheetData } from "../utils/validators";
import { collaboratorIdSchema, MealCountByCollaborator, MealCountBySector, MealCountMap, recordTypeFields, TimeRecord } from "../types/records";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Turns, turnsTypeSchema } from "../constants/turns";
import { recordsCache } from "../cache/recordsCache";

dayjs.extend(customParseFormat);
dayjs.extend(utc)
dayjs.extend(timezone)

class RecordsService {

    private readonly sheets: any = googleSheetsService.getSheetsApi;
    private readonly spreadSheetId: string | undefined = googleSheetsService.getSpreadsheetId;

    // MÉTODO PARA CARREGAR E SALVAR OS DADOS EM CACHE
    private async loadRecords(range: string): Promise<TimeRecord[]> {

        // BUSCA O CACHE
        const cached = recordsCache.get(range);
        if(cached) return cached; // SE EXISTIR O RETORNA

        // SENÃO, FAZ UMA NOVA BUSCA
        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range,
        });

        // SERIALIZA E FORMATA OS DADOS DA PLANILHA UMA VEZ SÓ
        const serializedRecords = validateSheetData<TimeRecord>(
            mapSheet<TimeRecord>(response.data.values)
        );

        if(!serializedRecords.valid)
            throw new ApiException('Nenhum registro encontrado!', 404);

        const mapped = serializedRecords.data!.map(mapSheetRowToRecord);

        recordsCache.set(range, mapped);
        return mapped; // RETORNA DADOS SERIALIZADOS E FORMATADOS
    }

    // BUSCA TODOS
    async getAll(range: string): Promise<TimeRecord[]> {

        const records: TimeRecord[] = await this.loadRecords(range);
        return records;
    }

    // LISTA REGISTROS PELO SETOR
    async listBySector(range: string, sector: string): Promise<TimeRecord[]> {

        const serializedSector = recordTypeFields.sector.parse(sector); // VALIDA O SETOR RECEBIDO
        const records: TimeRecord[] = await this.loadRecords(range); // PEGA O CACHE OU DA PLANILHA

        // FILTRA PELO SETOR
        const filteredRecords: TimeRecord[] = searchInSheet<TimeRecord>({
            data: records,
            filters: { sector: serializedSector }
        });

        if(!filteredRecords || filteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado com este setor!', 404);

        return filteredRecords;
    }

    // LISTA REGISTROS PELO DIA
    listByDay = async (range: string, day: string): Promise<TimeRecord[]> => {

        const serializedDay = recordTypeFields.day.parse(day); // VALIDA A DATA RECEBIDA

        // FORMATA A DATA
        const formattedDay: dayjs.Dayjs = dayjs(serializedDay, 'DD/MM/YY');
        if(!formattedDay.isValid())
            throw new ApiException('Data recebida é inválida!', 400);

        const records: TimeRecord[] = await this.loadRecords(range);

        // FILTRA PELA DATA
        const filteredRecords: TimeRecord[] = searchInSheet<TimeRecord>({
            data: records,
            filters: { day: formattedDay.format('DD/MM/YY') }
        });

        if(!filteredRecords || filteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado com este dia!', 404);

        return filteredRecords;
    }

    // LISTA REGISTROS PELO TURNO DE ENTRADA
    listEntryByTurn = async (range: string, turn: string): Promise<TimeRecord[]> => {

        const serializedTurn: Turns = turnsTypeSchema.parse(turn.toLowerCase()) as Turns; // VALIDA O TURNO RECEBIDO
        const records: TimeRecord[] = await this.loadRecords(range);

        // FILTRA PELA TURNO DE ENTRADA
        const filteredRecords: TimeRecord[] = filterByTurn<TimeRecord>(
            records,
            'entry', serializedTurn
        );

        if(!filteredRecords || filteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado com entrada neste turno!', 404);

        return filteredRecords;
    }

    // LISTA QUANTA VEZES UM COLABORADOR COMEU
    listMealCountByColaboratorIdByMonth = async (
        range: string, 
        collaboratorId: string, 
        month: string, 
        turn?: string
    ): Promise<number> => {

        let serializedTurn: Turns | undefined = undefined; // TURNO É OPCIONAL
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns; // VALIDA O TURNO SE EXISTIR

        const records = await this.loadRecords(range);

        // FILTRA PELO ID DO COLABORADOR
        const filteredRecordsByColaboratorId: TimeRecord[] = searchInSheet<TimeRecord>({
            data: records,
            filters: { collaboratorId }
        });

        // FILTRA PELO MES RECEBIDO
        const monthlyRecords: TimeRecord[] | undefined = filterByMonthAndYear<TimeRecord>(
            filteredRecordsByColaboratorId,
            targetMonth,
            currentYear,
        );

        // SE O TURNO FOR INFORMADO, FILTRA POR ELE, SENÃO SEGUE SOMENTE COM FILTROS PELO MES
        const finalFilteredRecords: TimeRecord[] | undefined = turn ? 
            filterByTurn<TimeRecord>(monthlyRecords!, 'entry', serializedTurn!) 
            : monthlyRecords;
    
        if(!finalFilteredRecords || finalFilteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado para este colaborador neste mês e ou turno!', 404);

        const mealCount: number = finalFilteredRecords.length;

        return mealCount;
    }

    // LISTA QUANTIDADE DE VEZES QUE UM SETOR COMEU NO MES
    listMealCountBySectorByMonth = async (
        range: string,
        sector: string,
        month: string,
        turn?: string
    ): Promise<number> => {

        let serializedTurn: Turns | undefined = undefined; // TURNO É OPCIONAL
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns; // VALIDA TURNO

        const records = await this.loadRecords(range);

        // FILTRA PELO SETOR
        const filteredRecordsBySector: TimeRecord[] = searchInSheet<TimeRecord>({
            data: records,
            filters: { sector }
        });

        // FILTRA PELO MES
        const monthlyRecords: TimeRecord[] | undefined = filterByMonthAndYear<TimeRecord>(
            filteredRecordsBySector,
            targetMonth,
            currentYear,
        );

        // SE O TURNO FOR INFORMADO, FILTRA POR ELE, SENÃO SEGUE SOMENTE COM FILTROS PELO MES
        const finalFilteredRecords: TimeRecord[] | undefined = turn ? 
            filterByTurn<TimeRecord>(monthlyRecords!, 'entry', serializedTurn!) 
            : monthlyRecords;
    
        if(!finalFilteredRecords || finalFilteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado para este setor neste mês e ou turno!', 404);

        const mealCount: number = finalFilteredRecords.length;

        return mealCount;
    }

    // LISTA OS 5 SETORES QUE MAIS COMERAM NO MES
    listMostMealCountSectorsByMonth = async (
        range: string,
        month: string,
        turn?: string
    ): Promise<MealCountBySector[]> => {

        let serializedTurn: Turns | undefined = undefined; // TURNO É OPCIONAL
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns; // VALIDA TURNO

        const records = await this.loadRecords(range);

        // FILTRA PELO MES
        const monthlyRecords = filterByMonthAndYear(
            records,
            targetMonth,
            currentYear
        );

        // SE O TURNO FOR INFORMADO, FILTRA POR ELE, SENÃO SEGUE SOMENTE COM FILTROS PELO MES
        const finalFilteredRecords: TimeRecord[] | undefined = turn ? 
            filterByTurn<TimeRecord>(monthlyRecords!, 'entry', serializedTurn!) 
            : monthlyRecords;
    
        if(!finalFilteredRecords || finalFilteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado para este setor neste mês e ou turno!', 404);

        const countBySector: any = {}; // ARMAZENA CONTAGEM POR SETOR

        finalFilteredRecords!.forEach((record) => {
            const sector = record.sector;

            if(!countBySector[sector]){ 
                countBySector[sector] = 1; 
            }
            else{
                countBySector[sector]++; // SE ENCONTRAR ALGUM REGISTRO DAQUELE SETOR, ADICIONA MAIS 1
            }
        });

        // ORDENA OS SETORES EM ORDEM DECRESCENTE
        const orderedRecords = Object.entries(countBySector)
            .map(([sector, total]) => ({ sector, total }))
            .sort((a: any, b: any) => ( b.total - a.total ));

        const mostFiveMealSectors = orderedRecords.slice(0, 5);

        return mostFiveMealSectors;
    }

    // LISTA O QUANTO CADA SETOR COMEU
    listMealCountOfAllSectorsByMonth = async (
        range: string,
        month: string,
        turn?: string
    ): Promise<MealCountBySector[]> => {

        let serializedTurn: Turns | undefined = undefined; // TURNO É OPCIONAL
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns; // VALIDA TURNO

        const records = await this.loadRecords(range);

        // FILTRA PELO MES
        const monthlyRecords = filterByMonthAndYear(
            records,
            targetMonth,
            currentYear
        );

        // SE O TURNO FOR INFORMADO, FILTRA POR ELE, SENÃO SEGUE SOMENTE COM FILTROS PELO MES
        const finalFilteredRecords: TimeRecord[] | undefined = turn ? 
            filterByTurn<TimeRecord>(monthlyRecords!, 'entry', serializedTurn!) 
            : monthlyRecords;
    
        if(!finalFilteredRecords || finalFilteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado para este setor neste mês e ou turno!', 404);

        const countBySector: any = {}; // ARMAZENA CONTAGEM POR SETOR

        finalFilteredRecords!.forEach((record) => {
            const sector = record.sector;

            if(!countBySector[sector]){ 
                countBySector[sector] = 1; 
            }
            else{
                countBySector[sector]++; // SE ENCONTRAR ALGUM REGISTRO DAQUELE SETOR, ADICIONA MAIS 1
            }
        });

        // ORDENA OS SETORES EM ORDEM DECRESCENTE
        const orderedRecords = Object.entries(countBySector)
            .map(([sector, total]) => ({ sector, total }))
            .sort((a: any, b: any) => ( b.total - a.total ));

        return orderedRecords;
    }

    listMealCountOfAllCollaboratorsByMonth = async (
        range: string,
        month: string,
        turn?: string,
    ): Promise<MealCountByCollaborator[]> => {
        
        let serializedTurn: Turns | undefined = undefined; // TURNO É OPCIONAL
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns; // VALIDA TURNO

        const records = await this.loadRecords(range);

        // FILTRA PELO MES
        const monthlyRecords = filterByMonthAndYear(
            records,
            targetMonth,
            currentYear
        );

        // SE O TURNO FOR INFORMADO, FILTRA POR ELE, SENÃO SEGUE SOMENTE COM FILTROS PELO MES
        const finalFilteredRecords: TimeRecord[] | undefined = turn ? 
            filterByTurn<TimeRecord>(monthlyRecords!, 'entry', serializedTurn!) 
            : monthlyRecords;
    
        if(!finalFilteredRecords || finalFilteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado para este setor neste mês e ou turno!', 404);

        const countByCollaborator: MealCountMap = {}; // ARMAZENA CONTAGEM POR SETOR

        finalFilteredRecords!.forEach((record) => {
            const collaborator = record.name;
            const sector = record.sector;

            const key: string = `${collaborator}|${sector}`;

            if(!countByCollaborator[key]){ 
                countByCollaborator[key] = {
                    collaborator,
                    sector,
                    total: 1,
                }; 
            }
            else{
                countByCollaborator[key].total++; // SE ENCONTRAR ALGUM REGISTRO DAQUELE SETOR, ADICIONA MAIS 1
            }
        });

        // ORDENA OS SETORES EM ORDEM DECRESCENTE
        const orderedRecords: MealCountByCollaborator[] = Object.values(countByCollaborator)
            .sort((a: any, b: any) => ( b.total - a.total ));

        return orderedRecords;
    };

    // ENVIA DADOS / CRIA REGISTROS NA PLANILHA
    sendRecord = async (
        range: string,
        values: Array<[number | string]>
    ): Promise<void> => {

        const records = Array.isArray(values) ? values : [values];

        const actualRange =
            range && range.includes("!") ? range : `${range || "EntradaSaida"}!A:G`;

        const sheetName = actualRange.split("!")[0];

        const readResponse = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range: `${sheetName}!A:G`,
        });

        const rows = readResponse.data?.values || [];

        const hasHeader =
            rows.length > 0 &&
            rows[0].some(
                (cell: any) =>
                    typeof cell === "string" && /colaborador.*id/i.test(cell)
            );

        const dataStartIndex = hasHeader ? 1 : 0;

        // COLUNAS
        const idxColab = 0;
        const idxDay = 4;
        const idxEntry = 5;
        const idxExit = 6;

        const now = dayjs().tz("America/Sao_Paulo");
        const todayFormatted = now.format("DD/MM/YY");
        const nowTime = now.format("HH:mm");

        const updatesToApply: { range: string; values: any[][] }[] = [];
        const rowsToAppend: any[][] = [];

        /**
         * INDEXA ÚLTIMO REGISTRO ABERTO
         * key = ID
         * value = rowIndex
         */
        const openEntryIndex = new Map<string, number>();

        for (let i = rows.length - 1; i >= dataStartIndex; i--) {
            const row = rows[i] || [];

            const colab = row[idxColab]?.toString().trim();
            const rawDay = row[idxDay];
            const exit = row[idxExit]?.toString().trim();

            if (!colab || !rawDay) continue;

            const day = normalizeDay(rawDay);

            console.log({
                rawDay,
                normalized: normalizeDay(rawDay)?.format("YYYY-MM-DD"),
                isToday: normalizeDay(rawDay)?.isSame(now, "day")
            });
            if (!day) continue;

            const isToday = day.isSame(now, "day");
            const exitIsEmpty = !exit || exit === "";

            if (isToday && exitIsEmpty) {
                openEntryIndex.set(colab, i);
            }
        }

        // CONVERTE ÍNDICE DA COLUNA DE SAÍDA PARA LETRA
        const exitColumnLetter = (() => {
            let n = idxExit;
            let s = "";
            while (n >= 0) {
                s = String.fromCharCode((n % 26) + 65) + s;
                n = Math.floor(n / 26) - 1;
            }
            return s;
        })();

        // PROCESSA CADA ID RECEBIDO
        for (const record of records) {

            const serializedId = collaboratorIdSchema.parse(
                String(record[0]).trim()
            );

            const foundRowIndex = openEntryIndex.get(String(serializedId));

            // 🟢 FECHA SAÍDA
            if (foundRowIndex !== undefined) {
                const spreadsheetRow = foundRowIndex + 1;

                updatesToApply.push({
                    range: `${sheetName}!${exitColumnLetter}${spreadsheetRow}`,
                    values: [[nowTime]],
                });

                openEntryIndex.delete(String(serializedId));
                continue;
            }

            // 🔵 CRIA NOVA ENTRADA
            const newRow: any[] = [];
            newRow[idxColab] = serializedId;
            newRow[idxDay] = todayFormatted;
            newRow[idxEntry] = nowTime;
            newRow[idxExit] = "";

            rowsToAppend.push(newRow);
        }

        // APLICA SAÍDAS
        if (updatesToApply.length > 0) {
            await this.sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: this.spreadSheetId,
                requestBody: {
                    data: updatesToApply,
                    valueInputOption: "USER_ENTERED",
                },
            });
        }

        // CRIA NOVAS ENTRADAS
        if (rowsToAppend.length > 0) {
            console.log(rowsToAppend);
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadSheetId,
                range: `${sheetName}!A:G`,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: rowsToAppend,
                },
            });
        }

        recordsCache.clear();
    };
}

export default RecordsService;