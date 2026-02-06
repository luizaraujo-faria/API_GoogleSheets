import dayjs from "dayjs";
import { normalizeDay } from "./validators";
import { collaboratorIdSchema } from "../schemas/commonSchema";

interface OpenEntryIndexParams {
  rows: any[][];
  dataStartIndex: number;
  now: dayjs.Dayjs;
  idxColab: number;
  idxDay: number;
  idxExit: number;
}

interface ProcessRecordParams {
  record: Array<number | string>;
  sheetName: string;
  nowTime: string;
  todayFormatted: string;
  exitColumnLetter: string;
  idxColab: number;
  idxDay: number;
  idxEntry: number;
  idxExit: number;
  openEntryIndex: Map<string, number>;
  updatesToApply: { range: string; values: any[][] }[];
  rowsToAppend: any[][];
}

export function columnIndexToLetter(index: number): string {
    let n = index;
    let s = '';

    while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
    }

    return s;
}

export function hasHeaderRow(rows: any[][]): boolean {
    return (
        rows.length > 0 &&
        rows[0].some(
        cell =>
            typeof cell === 'string' &&
            /colaborador.*id/i.test(cell)
        )
    );
}

export function indexOpenEntries({
  rows,
  dataStartIndex,
  now,
  idxColab,
  idxDay,
  idxExit,
}: OpenEntryIndexParams): Map<string, number> {

    const openEntryIndex = new Map<string, number>();

    for (let i = rows.length - 1; i >= dataStartIndex; i--) {
        const row = rows[i] || [];

        const colab = row[idxColab]?.toString().trim();
        const rawDay = row[idxDay];
        const exit = row[idxExit]?.toString().trim();

        if (!colab || !rawDay) continue;

        const day = normalizeDay(rawDay);
        if (!day) continue;

        const isToday = day.isSame(now, 'day');
        const exitIsEmpty = !exit;

        if (isToday && exitIsEmpty) {
        openEntryIndex.set(colab, i);
        }
    }

    return openEntryIndex;
}

export function processRecord(params: ProcessRecordParams) {
  const {
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
  } = params;

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
        return;
    }

    // 🔵 NOVA ENTRADA
    const newRow: any[] = [];
    newRow[idxColab] = serializedId;
    newRow[idxDay] = todayFormatted;
    newRow[idxEntry] = nowTime;
    newRow[idxExit] = '';

    rowsToAppend.push(newRow);
}