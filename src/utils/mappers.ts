import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Turns, TurnsRange } from "../constants/turns";
import { Collaborator } from "../types/collaborator";
dayjs.extend(customParseFormat);

// MAPEIA PARA O TIPO DA PLANILHA DE ENTRADA E SAIDA
export function mapSheetRowToRecord(row: Record<string, any>) {

    return {
        collaboratorId: row["Colaborador_ID"] ?? "",
        name: row["Nome"] ?? "",
        sector: row["Setor"] ?? "",
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