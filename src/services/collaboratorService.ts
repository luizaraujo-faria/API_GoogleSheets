import { collaboratorCache } from "../cache/collaboratorsCache";
import googleSheetsService from "../config/googleSheets";
import ApiException from "../errors/ApiException";
import { Collaborator, collaboratorType, collaboratorTypeSchema, CreateCollaboratorDTO } from "../types/collaborator";
import { searchInSheet } from "../utils/filters";
import { mapSheet, mapSheetRowToCollaborator } from "../utils/mappers";
import { validateSheetData } from "../utils/validators";

class CollaboratorService {

    private readonly sheets: any = googleSheetsService.getSheetsApi;
    private readonly spreadSheetId?: string = googleSheetsService.getSpreadsheetId;

    // MÉTODO PARA CARREGAR E SALVAR OS DADOS EM CACHE
    private async loadCollaborators(range: string): Promise<Collaborator[]> {

        // BUSCA O CACHE
        const cached = collaboratorCache.get(range);
        if(cached) return cached; // SE EXISTIR O RETORNA

        // SENÃO, FAZ UMA NOVA BUSCA
        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range,
        });

        // SERIALIZA E FORMATA OS DADOS DA PLANILHA UMA VEZ SÓ
        const serializedRecords = validateSheetData<Collaborator>(
            mapSheet<Collaborator>(response.data.values)
        );

        if(!serializedRecords.valid)
            throw new ApiException('Nenhum registro encontrado!', 404);

        const mapped = serializedRecords.data!.map(mapSheetRowToCollaborator);

        collaboratorCache.set(range, mapped);
        return mapped; // RETORNA DADOS SERIALIZADOS E FORMATADOS
    }

    getAll = async (range: string): Promise<Collaborator[]> => {

        const collaborators: Collaborator[] = await this.loadCollaborators(range);
        return collaborators;
    }

    getById = async (range: string, collaboratorId: string | number): Promise<Collaborator> => {

        // VALIDA O ID RECEBIDO
        const serializedId: number | string = collaboratorTypeSchema.collaboratorId.parse(collaboratorId);
        const collaborators: Collaborator[] = await this.loadCollaborators(range);

        // FILTRA PELO ID
        const filteredById = searchInSheet<Collaborator>({
            data: collaborators,
            filters: { collaboratorId: serializedId }
        });

        // VERIFICA SE EXISTE COM O ID
        if(!filteredById || filteredById.length === 0)
            throw new ApiException('Nenhum colaborador encontrado com este ID!', 404);

        return filteredById[0];
    }

    listBySector = async (range: string, sector: string): Promise<Collaborator[]> => {

        // VALIDA O SETOR RECEBIDO
        const serializedSector: string = collaboratorTypeSchema.sector.parse(sector);
        const collaborators: Collaborator[] = await this.loadCollaborators(range);

        // FILTRA PELO SETOR
        const filteredColaborators = searchInSheet<Collaborator>({
            data: collaborators,
            filters: { sector: serializedSector }
        });

        // VERIFICA SE EXISTE PELO SETOR
        if(!filteredColaborators || filteredColaborators.length === 0)
            throw new ApiException('Nenhum colaborador encontrado com este setor!', 404);

        return filteredColaborators;
    }

    createCollaborator = async (range: string, values: any[]): Promise<void> => {

        // PEGA OS VALORES DO ARRAY E PASSA PARA OBJETO
        const [ collaboratorId, name, sector, type ] = values;
        const dataToObject: Collaborator = {
            collaboratorId,
            name,
            sector,
            type: String(type).toLowerCase()
        }

        // VALIDA OS DADOS RECEBIDOS
        const serializedData: CreateCollaboratorDTO = collaboratorType.parse(dataToObject);

        // BUSCA NO CACHE OU NA PLANILHA E VERIFICA SE JÁ NÃO HÁ UM CADASTRADO PELO ID
        const collaborators = await this.loadCollaborators(range);
        const exisitngCollaborator = searchInSheet<Collaborator>({
            data: collaborators,
            filters: { collaboratorId: String(dataToObject.collaboratorId) }
        });

        if(exisitngCollaborator[0])
            throw new ApiException('Colaborador já cadastrado na planilha com este ID!', 400);

        // PASSA OS DADOS PARA MATRIZ (FORMATO ESPERADO PELO GOOGLESHEETSAPI)
        const dataToMatrix = [[
            serializedData.collaboratorId,
            serializedData.name,
            serializedData.sector,
            serializedData.type
        ]];

        // ENVIA PARA O GOOGLESHEETS
        await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadSheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: {
                values: dataToMatrix
            }
        });

        // INVALIDA CACHE
        collaboratorCache.clear();
    }
}

export default CollaboratorService;