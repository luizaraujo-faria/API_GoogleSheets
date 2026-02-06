import ApiException from "../errors/ApiException";
import { mapSheet, mapSheetRowToRecord } from "../utils/mappers";
import { filterByMonthAndYear, filterByTurn, searchInSheet } from "../utils/filters";
import { normalizeDay, validateSheetData } from "../utils/validators";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Turns, turnsTypeSchema } from "../constants/turns";
import { recordsCache } from "../cache/recordsCache";
import { GoogleSheetsRepository } from "../config/googleSheetsRepository";
import { recordsRanges } from "../constants/SheetsRange";
import dayjs from "dayjs";
import { MealCountByCollaborator, MealCountByCollaboratorType, MealCountBySector, MealCountMap, RecordsFilter, TimeRecord } from "../types/records";
import { collaboratorIdSchema } from "../schemas/commonSchema";
import { recordsFilterSchema } from "../schemas/recordsSchema";

dayjs.extend(customParseFormat);
dayjs.extend(utc)
dayjs.extend(timezone)

class RecordsService {
    private readonly sheetRange = recordsRanges;
    constructor(private readonly googleSheetsRepository: GoogleSheetsRepository) {}

    // MÉTODO PARA CARREGAR E SALVAR OS DADOS EM CACHE
    private async loadRecords(range: string): Promise<TimeRecord[]> {

        // BUSCA O CACHE
        const cached = recordsCache.get(range);
        if(cached) return cached; // SE EXISTIR O RETORNA

        // SENÃO, FAZ UMA NOVA BUSCA
        const response = await this.googleSheetsRepository.getData(range);

        // SERIALIZA E FORMATA OS DADOS DA PLANILHA UMA VEZ SÓ
        const serializedRecords = validateSheetData<TimeRecord>(
            mapSheet<TimeRecord>(response)
        );

        if(!serializedRecords.valid)
            throw new ApiException('Nenhum registro encontrado!', 404);

        const mapped = serializedRecords.data!.map(mapSheetRowToRecord);

        recordsCache.set(range, mapped);
        return mapped; // RETORNA DADOS SERIALIZADOS E FORMATADOS
    }

    // BUSCA TODOS
    async getAll(): Promise<TimeRecord[]> {

        const records: TimeRecord[] = await this.loadRecords(this.sheetRange.fullRange);
        return records;
    }



    // LISTA OS 5 SETORES QUE MAIS COMERAM NO MES
    listMostMealCountSectorsByMonth = async (
        month: string,
        turn?: string
    ): Promise<MealCountBySector[]> => {

        let serializedTurn: Turns | undefined = undefined; // TURNO É OPCIONAL
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns; // VALIDA TURNO

        const records = await this.loadRecords(this.sheetRange.fullRange);

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
            throw new ApiException('Nenhum registro encontrado para este mês e ou turno!', 404);

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

    async getAllByFilters(rawFilters: RecordsFilter): Promise<TimeRecord[]> {

        const filters = recordsFilterSchema.parse(rawFilters);
        const records = await this.loadRecords(this.sheetRange.fullRange);

        // const normalizedFilters = {
        //     ...filters,
        //     collaboratorId: filters.collaboratorId
        //         ? Number(filters.collaboratorId)
        //         : undefined,
        //     recordId: filters.recordId
        //         ? Number(filters.recordId)
        //         : undefined,
        // };

        const filteredRecords = searchInSheet<TimeRecord>({
            data: records,
            filters: filters,
        });

        if(!filteredRecords || filteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado para os filtros informados!',404);

        return filteredRecords;
    }

    // LISTA O QUANTO CADA SETOR COMEU
    listMealCountOfAllSectorsByMonth = async (
        month: string,
        turn?: string
    ): Promise<MealCountBySector[]> => {

        let serializedTurn: Turns | undefined = undefined; // TURNO É OPCIONAL
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns; // VALIDA TURNO

        const records = await this.loadRecords(this.sheetRange.fullRange);

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
            throw new ApiException('Nenhum registro encontrado para este mês e ou turno!', 404);

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

    // QUANTIDADE DE VEZES QUE CADA COLABORADOR COMEU NO MÊS
    listMealCountOfAllCollaboratorsByMonth = async (
        month: string,
        turn?: string,
    ): Promise<MealCountByCollaborator[]> => {
        
        let serializedTurn: Turns | undefined = undefined; // TURNO É OPCIONAL
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns; // VALIDA TURNO

        const records = await this.loadRecords(this.sheetRange.fullRange);

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
            throw new ApiException('Nenhum registro encontrado para este mês e ou turno!', 404);

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

    // QUANTIDADE DE VEZES QUE CADA TIPO DE COLABORADOR COMEU NO MÊS
    listMealCountOfAllCollaboratorTypeByMonth = async (
        month: string,
        turn?: string,
    ): Promise<MealCountByCollaboratorType[]> => {
        
        let serializedTurn: Turns | undefined = undefined; // TURNO É OPCIONAL
        const currentYear = dayjs().year();
        const targetMonth = Number(month);

        if(isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12)
            throw new ApiException('Mês informado é inválido!', 400);

        if(turn) serializedTurn = turnsTypeSchema.parse(turn?.toLowerCase()) as Turns; // VALIDA TURNO

        const records = await this.loadRecords(this.sheetRange.fullRange);

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
            throw new ApiException('Nenhum registro encontrado para este mês e ou turno!', 404);

        const countByCollaborator: any = {}; // ARMAZENA CONTAGEM POR SETOR

        finalFilteredRecords!.forEach((record) => {
            const type = record.type;

            if(!countByCollaborator[type]){ 
                countByCollaborator[type] = 1; 
            }
            else{
                countByCollaborator[type]++; // SE ENCONTRAR ALGUM REGISTRO DAQUELE SETOR, ADICIONA MAIS 1
            }
        });

        // ORDENA OS SETORES EM ORDEM DECRESCENTE
        const orderedRecords: MealCountByCollaboratorType[] = Object.entries(countByCollaborator)
            .map(([type, total]) => ({ type, total }))
            .sort((a: any, b: any) => ( b.total - a.total ));

        return orderedRecords;
    };

    // ENVIA DADOS / CRIA REGISTROS NA PLANILHA
    sendRecord = async (
        values: Array<[number | string]>
    ): Promise<void> => {
        const range = this.sheetRange.fullRange
        const records = Array.isArray(values) ? values : [values];

        const actualRange =
            range && range.includes("!") ? range : `${range || "EntradaSaida"}!A:G`;

        const sheetName = actualRange.split("!")[0];

        const readResponse = await this.googleSheetsRepository.getData(`${sheetName}!A:G`);

        const rows = readResponse;

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
            this.googleSheetsRepository.updateData('', updatesToApply)
        }

        // CRIA NOVAS ENTRADAS
        if (rowsToAppend.length > 0) {
            console.log(rowsToAppend);

            await this.googleSheetsRepository.sendData(
                `${sheetName}!A:G`,
                rowsToAppend
            );
        }

        recordsCache.clear();
    };
}

export default RecordsService;