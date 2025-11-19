import googleSheetsService from "../config/googleSheets";
import ApiException from "../errors/ApiException";
import { Colaborator, colaboratorType, colaboratorTypeSchema, CreateColaboratorDTO } from "../types/colaborator";
import { searchInSheet } from "../utils/filters";
import { mapSheet, mapSheetRowToColaborator } from "../utils/mappers";
import { validateParams, validateSheetData } from "../utils/validators";

class ColaboratorService {

    private readonly sheets: any = googleSheetsService.getSheetsApi;
    private readonly spreadSheetId?: string = googleSheetsService.getSpreadsheetId;

    getAll = async (range: string): Promise<Colaborator[]> => {

        if(!range || range === undefined)
            throw new ApiException('Nome da folha não informado!', 400);

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range
        });

        const serializedColaborators = validateSheetData<Colaborator>(
            mapSheet<Colaborator>(response.data.values)
        );
        if(!serializedColaborators.valid)
            throw new ApiException('Nenhum colaborador encontrado na planilha!', 404);

        const mappedColaborators = serializedColaborators.data!.map(mapSheetRowToColaborator);

        return mappedColaborators;
    }

    getById = async (range: string, colaboratorId: string | number): Promise<Colaborator> => {

        const serializedId: number | string = colaboratorTypeSchema.colaboratorId.parse(colaboratorId);

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range
        });

        const serializedColaborators = validateSheetData<Colaborator>(
            mapSheet<Colaborator>(response.data.values)
        );
        if(!serializedColaborators.valid)
            throw new ApiException('Nenhum colaborador encontrado na planilha!', 404);

        const mappedColaborators = serializedColaborators.data!.map(mapSheetRowToColaborator);
        const filteredById = searchInSheet<Colaborator>({
            data: mappedColaborators,
            filters: { colaboratorId: serializedId }
        });

        if(!filteredById || filteredById.length === 0)
            throw new ApiException('Nenhum colaborador encontrado com este ID!', 404);

        return filteredById[0];
    }

    listBySector = async (range: string, sector: string): Promise<Colaborator[]> => {

        const serializedSector: string = colaboratorTypeSchema.sector.parse(sector);

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range
        });

        const serializedColaborators = validateSheetData<Colaborator>(
            mapSheet<Colaborator>(response.data.values)
        );
        if(!serializedColaborators.valid)
            throw new ApiException('Nenhum colaborador encontrado na planilha!', 404);

        const mappedColaborators = serializedColaborators.data!.map(mapSheetRowToColaborator);
        const filteredColaborators = searchInSheet<Colaborator>({
            data: mappedColaborators,
            filters: { sector: serializedSector }
        });

        if(!filteredColaborators || filteredColaborators.length === 0)
            throw new ApiException('Nenhum colaborador encontrado com este setor!', 404);

        return filteredColaborators;
    }

    createColaborator = async (range: string, values: unknown[][]): Promise<void> => {

        validateParams(values, 'Dados do colaborador');

        const dataRow = values[0];
        if(!dataRow)
            throw new ApiException('Nenhum dados foi enviado!', 400);

        const data = {
            colaboratorId: dataRow[0],
            name: dataRow[1],
            sector: dataRow[2]
        }

        const serializedData: CreateColaboratorDTO = colaboratorType.parse(data);
        const dataToMatrix = [[
            serializedData.colaboratorId,
            serializedData.name,
            serializedData.sector
        ]];

        await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadSheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: dataToMatrix
            }
        });
    }
}

export default ColaboratorService;