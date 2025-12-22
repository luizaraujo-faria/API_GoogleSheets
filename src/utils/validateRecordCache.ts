import ApiException from "../errors/ApiException";
import { TimeRecord } from "../types/records";
import { mapSheet, mapSheetRowToRecord } from "./mappers";
import { validateSheetData } from "./validators";

export async function verifyAndUpdateRecordsCache(
    recordsCache: TimeRecord[] | undefined,
    sheets: any,
    spreadSheetId: any,
    range: string
): Promise<TimeRecord[] | undefined> {

    console.log(`CACHE DOS DADOS ANTES DA FUNÇÃO: ${recordsCache?.length}`)

    if(!recordsCache || recordsCache.length === 0){

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadSheetId,
            range,
        });

        const serializedRecords = validateSheetData<TimeRecord>(
            mapSheet<TimeRecord>(response.data.values)
        );

        if(!serializedRecords.valid)
            throw new ApiException('Nenhum registro foi encontrado na planilha!', 404);

        return serializedRecords.data!.map(mapSheetRowToRecord);
    }

    return recordsCache;
}