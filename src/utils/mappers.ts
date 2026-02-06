import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Turns, TurnsRange } from "../constants/turns";
import { Collaborator } from "../types/collaborator";
import { TimeRecord } from "../types/records";
dayjs.extend(customParseFormat);

// MAPEIA PARA O TIPO DA PLANILHA DE ENTRADA E SAIDA
export function mapSheetRowToRecord(row: Record<string, any>) {

    return {
        collaboratorId: row["Colaborador_ID"] ?? "",
        name: row["Nome"] ?? "",
        sector: row["Setor"] ?? "",
        type: row["Tipo"] ?? "",
        day: row["Dia"] ?? "",
        entry: row["Entrada"] ?? "",
        exit: row["Saida"] ?? "",
        recordId: row["ID"] ?? "" 
    };
}

// MAPEIA PARA O TIPO DA PLANILHA COLABORADORES
export function mapSheetRowToCollaborator(row: Collaborator | any) {

    return {
        collaboratorId: row["Colaborador_ID"] ?? "",
        name: row["Nome"] ?? "",
        sector: row["Setor"] ?? "",
        type: row["Tipo"] ?? "",
    };
}

// MAPEIA OS DADOS CRUS PARA ARRAY DE OBJETOS LIMPO
export function mapSheet<T>(values: any[][]): T[] {

    if (!values || values.length === 0) return [];

    const [header, ...rows] = values;

    return rows.map((row) => {

        const obj: any = {};

        header.forEach((colName, i) => {
            obj[colName] = row[i] ?? '';
        });
        
        return obj as T;
    });
}

// MAPEIA PELO LIMITE DE TEMPO
export function isTimeInsideShift(time: string, turn: Turns): boolean {
    const range = TurnsRange[turn];

    const t = dayjs(time, "HH:mm");
    const start = dayjs(range.start, "HH:mm");
    const end = dayjs(range.end, "HH:mm");

    return (
        (t.isAfter(start) || t.isSame(start)) &&
        (t.isBefore(end) || t.isSame(end))
    );
}

// MAPEIA PARA CONTAGEM DE POR OBJETO
export function groupAndCount<T>(
    data: TimeRecord[],
    keyFn: (record: TimeRecord) => T,
    mapFn: (key: T, total: number) => any
) {
    const counter = new Map<string, { key: T; total: number }>();

    data.forEach(record => {
        const key = keyFn(record);
        const hash = JSON.stringify(key);

        if(!counter.has(hash)) {
        counter.set(hash, { key, total: 1 });
        } 
        else {
        counter.get(hash)!.total++;
        }
    });

    return Array.from(counter.values())
        .map(({ key, total }) => mapFn(key, total))
        .sort((a, b) => b.total - a.total);
}

// MAPEIA PARA DURAÇÃO EM MINUTOS
export function getDurationInMinutes(
    entry: string | Date,
    exit: string | Date
): number | null {

    if (!entry || !exit) return null;

    const start = dayjs(entry, ['HH:mm', 'HH:mm:ss']);
    const end = dayjs(exit, ['HH:mm', 'HH:mm:ss']);

    if (!start.isValid() || !end.isValid()) return null;

    const diff = end.diff(start, 'minute');

    return diff > 0 ? diff : null;
}

// MAPEIA PARA HH:mm
export function minutesToHHmm(totalMinutes: number): string {
    if (totalMinutes <= 0 || !Number.isFinite(totalMinutes)) {
        return '00:00';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');

    return `${hh}:${mm}`;
}