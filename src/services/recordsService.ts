import ApiException from "../errors/ApiException";
import { getDurationInMinutes, groupAndCount, groupByTime, mapSheet, mapSheetRowToRecord } from "../utils/mappers";
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
import { EntriesByHour, MealCountByCollaborator, MealCountByCollaboratorType, MealCountBySector, RecordsFilter, TimeRecord } from "../types/records";
import { recordsFilterSchema } from "../schemas/recordsSchema";
import { columnIndexToLetter, hasHeaderRow, indexOpenEntries, processRecord } from "../utils/sendRecordsHelper";

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

    // BUSCA TODOS OS REGISTROS COM FILTROS
    async getAllByFilters(rawFilters: RecordsFilter): Promise<TimeRecord[]> {

        const filters = recordsFilterSchema.parse(rawFilters);
        const records = await this.loadRecords(this.sheetRange.fullRange);

        const filteredRecords = searchInSheet<TimeRecord>({
            data: records,
            filters: filters,
        });

        if(!filteredRecords || filteredRecords.length === 0)
            throw new ApiException('Nenhum registro encontrado para os filtros informados!',404);

        return filteredRecords;
    }

    // LISTA QUANTAS VEZES CADA SETOR COMEU NO MÊS
    listMealCountOfAllSectorsByMonthAndYear = async (
        date: string,
        turn?: string
    ): Promise<MealCountBySector[]> => {

        const records = await this.getMonthlyFilteredRecords(date, turn);

        return groupAndCount(
            records,
            r => r.sector,
            (sector, total) => ({ sector, total })
        );
    };

    // QUANTIDADE DE VEZES QUE CADA COLABORADOR COMEU NO MÊS
    listMealCountOfAllCollaboratorsByMonthAndYear = async (
        date: string,
        turn?: string
    ): Promise<MealCountByCollaborator[]> => {

        const records = await this.getMonthlyFilteredRecords(date, turn);

        return groupAndCount(
            records,
            r => ({ collaborator: r.name, sector: r.sector }),
            (key, total) => ({
            collaborator: key.collaborator,
            sector: key.sector,
            total,
            })
        );
    };

    // QUANTIDADE DE VEZES QUE CADA TIPO DE COLABORADOR COMEU NO MÊS
    listMealCountOfAllCollaboratorTypeByMonthAndYear = async (
        date: string,
        turn?: string
    ): Promise<MealCountByCollaboratorType[]> => {

        const records = await this.getMonthlyFilteredRecords(date, turn);

        return groupAndCount(
            records,
            r => r.type,
            (type, total) => ({ type, total })
        );
    };

    // LISTA POR QUANTIDADE POR HORA
    groupByPeakTimeByMonthAndYear = async (date: string): Promise<EntriesByHour[]> => {

        const records = await this.getMonthlyFilteredRecords(date);
        return groupByTime(records);
    }

    // ENVIA DADOS / CRIA REGISTROS NA PLANILHA
    sendRecord = async (
        values: Array<[number | string]>
    ): Promise<void> => {

        const records = Array.isArray(values) ? values : [values];

        const range =
            this.sheetRange.fullRange?.includes('!')
            ? this.sheetRange.fullRange
            : `${this.sheetRange.fullRange || 'EntradaSaida'}!A:G`;

        const sheetName = range.split('!')[0];

        const rows = await this.googleSheetsRepository.getData(
            `${sheetName}!A:G`
        );

        const dataStartIndex = hasHeaderRow(rows) ? 1 : 0;

        // índices fixos
        const idxColab = 0;
        const idxDay = 4;
        const idxEntry = 5;
        const idxExit = 6;

        const now = dayjs().tz('America/Sao_Paulo');
        const todayFormatted = now.format('DD/MM/YY');
        const nowTime = now.format('HH:mm');

        const openEntryIndex = indexOpenEntries({
            rows,
            dataStartIndex,
            now,
            idxColab,
            idxDay,
            idxExit,
        });

        const updatesToApply: { range: string; values: any[][] }[] = [];
        const rowsToAppend: any[][] = [];

        const exitColumnLetter = columnIndexToLetter(idxExit);

        for (const record of records) {
            processRecord({
            record,
            sheetName,
            nowTime,
            todayFormatted,
            exitColumnLetter,
            idxColab,
            idxDay,
            idxEntry,
            idxExit,
            openEntryIndex,
            updatesToApply,
            rowsToAppend,
            });
        }

        if (updatesToApply.length > 0) {
            await this.googleSheetsRepository.updateData('', updatesToApply);
        }

        if (rowsToAppend.length > 0) {
            await this.googleSheetsRepository.sendData(
            `${sheetName}!A:G`,
            rowsToAppend
            );
        }

        recordsCache.clear();
    };

    // CENTRALIZA VALIDAÇÃO E FILTROS DE BUSCA PELO MÊS e ANO
    private async getMonthlyFilteredRecords(
        date: string,
        turn?: string
    ): Promise<TimeRecord[]> {

        const targetMonth = Number(date.slice(0, 2));
        const targetYear = Number(date.slice(3));

        if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
            throw new ApiException('Mês informado é inválido!', 400);
        }

        const serializedTurn = turn
            ? turnsTypeSchema.parse(turn.toLowerCase()) as Turns
            : undefined;

        const records = await this.loadRecords(this.sheetRange.fullRange);

        let filtered = filterByMonthAndYear(records, targetMonth, targetYear);

        if (!filtered || filtered.length === 0) {
            throw new ApiException('Nenhum registro encontrado para este período!', 404);
        }

        if (serializedTurn) {
            filtered = filterByTurn(filtered, 'entry', serializedTurn);
        }

        if (!filtered || filtered.length === 0) {
            throw new ApiException('Nenhum registro encontrado para este peŕiodo e/ou turno!', 404);
        }

        return filtered;
    }
}

export default RecordsService;