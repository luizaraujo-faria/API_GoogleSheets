import ApiException from "../errors/ApiException";
import { mapSheet, mapSheetRowToCollaborator, mapSheetRowToRecord } from "./mappers";
import { validateSheetData } from "./validators";
import { Collaborator } from "../types/collaborator";
import { TimeRecord } from "../types/records";

export function serializeCollaboratorData(sheetData: any): Collaborator[] {

    // SERIALIZA E FORMATA OS DADOS DA PLANILHA UMA VEZ SÓ
    const serializedCollaborator = validateSheetData<Collaborator>(
        mapSheet<Collaborator>(sheetData.data.values)
    );

    if(!serializedCollaborator.valid)
        throw new ApiException('Nenhum registro encontrado!', 404);

    const mapped: Collaborator[] = serializedCollaborator.data!.map(mapSheetRowToCollaborator);

    return mapped; // RETORNA DADOS SERIALIZADOS E FORMATADOS
}

export function serializeRecordData(sheetData: any): TimeRecord[] {

    // SERIALIZA E FORMATA OS DADOS DA PLANILHA UMA VEZ SÓ
    const serializedRecords = validateSheetData<TimeRecord>(
        mapSheet<TimeRecord>(sheetData.data.values)
    );

    if(!serializedRecords.valid)
        throw new ApiException('Nenhum registro encontrado!', 404);

    const mapped: TimeRecord[] = serializedRecords.data!.map(mapSheetRowToRecord);

    return mapped; // RETORNA DADOS SERIALIZADOS E FORMATADOS
}