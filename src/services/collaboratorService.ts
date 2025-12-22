import googleSheetsService from "../config/googleSheets";
import ApiException from "../errors/ApiException";
import { Collaborator, collaboratorType, collaboratorTypeSchema, CreateCollaboratorDTO } from "../types/collaborator";
import { searchInSheet } from "../utils/filters";
import { mapSheet, mapSheetRowToCollaborator } from "../utils/mappers";
import { validateParams, validateSheetData } from "../utils/validators";

class CollaboratorService {

    private readonly sheets: any = googleSheetsService.getSheetsApi;
    private readonly spreadSheetId?: string = googleSheetsService.getSpreadsheetId;

    getAll = async (range: string): Promise<Collaborator[]> => {

        if(!range || range === undefined)
            throw new ApiException('Nome da folha não informado!', 400);

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range
        });

        const serializedColaborators = validateSheetData<Collaborator>(
            mapSheet<Collaborator>(response.data.values)
        );
        if(!serializedColaborators.valid)
            throw new ApiException('Nenhum colaborador encontrado na planilha!', 404);

        const mappedColaborators = serializedColaborators.data!.map(mapSheetRowToCollaborator);

        return mappedColaborators;
    }

    getById = async (range: string, colaboratorId: string | number): Promise<Collaborator> => {

        const serializedId: number | string = collaboratorTypeSchema.collaboratorId.parse(colaboratorId);

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range
        });

        const serializedColaborators = validateSheetData<Collaborator>(
            mapSheet<Collaborator>(response.data.values)
        );
        if(!serializedColaborators.valid)
            throw new ApiException('Nenhum colaborador encontrado na planilha!', 404);

        const mappedColaborators = serializedColaborators.data!.map(mapSheetRowToCollaborator);
        const filteredById = searchInSheet<Collaborator>({
            data: mappedColaborators,
            filters: { collaboratorId: serializedId }
        });

        if(!filteredById || filteredById.length === 0)
            throw new ApiException('Nenhum colaborador encontrado com este ID!', 404);

        return filteredById[0];
    }

    listBySector = async (range: string, sector: string): Promise<Collaborator[]> => {

        const serializedSector: string = collaboratorTypeSchema.sector.parse(sector);

        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range
        });

        const serializedColaborators = validateSheetData<Collaborator>(
            mapSheet<Collaborator>(response.data.values)
        );
        if(!serializedColaborators.valid)
            throw new ApiException('Nenhum colaborador encontrado na planilha!', 404);

        const mappedColaborators = serializedColaborators.data!.map(mapSheetRowToCollaborator);
        const filteredColaborators = searchInSheet<Collaborator>({
            data: mappedColaborators,
            filters: { sector: serializedSector }
        });

        if(!filteredColaborators || filteredColaborators.length === 0)
            throw new ApiException('Nenhum colaborador encontrado com este setor!', 404);

        return filteredColaborators;
    }

    createCollaborator = async (range: string, values: unknown[][]): Promise<void> => {

        validateParams(values, 'Dados do colaborador');

        const dataRow = values[0];
        if(!dataRow)
            throw new ApiException('Nenhum dados foi enviado!', 400);

        console.log(`Dados recebidos: ${values[0]} ${values[1]} ${values[2]}`)
        console.log(range)

        const data = {
            colaboratorId: dataRow[0],
            name: dataRow[1],
            sector: dataRow[2]
        }

        const serializedData: CreateCollaboratorDTO = collaboratorType.parse(data);
        const dataToMatrix = [[
            serializedData.collaboratorId,
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

export default CollaboratorService;