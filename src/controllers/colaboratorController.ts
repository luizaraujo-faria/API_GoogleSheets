import { Request, Response } from "express";
import GoogleSheetsResponse from "../responses/googleSheetsResponse";
import ColaboratorService from "../services/colaboratorService";
import { Colaborator } from "../types/colaborator/colaborator";

class ColaboratorController {

    public readonly range: string = 'Página1!A:Z';
    public readonly sheetName: string = 'Colaboradores';
    private readonly colaboratorService: ColaboratorService;

    constructor(colaboratorService: ColaboratorService){
        this.colaboratorService = colaboratorService;

        if(!this.colaboratorService){
            throw new Error('Dependencia não injetada corretamente');
        }
    }

    getAll = async (req: Request, res: Response): Promise<Response> => {

        try{

            const colaborators: Colaborator[] = await this.colaboratorService.getAll(
                this.sheetName as string
            );

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Colaboradores buscados com sucesso!',
                colaborators
            ));
        }
        catch(err: any){
            return res.status(err.httpStatus || 500).json(GoogleSheetsResponse.errorMessage(
                'Falha ao buscar colaboradores!',
                err.message
            ));
        }
    }

    getById = async (req: Request, res: Response): Promise<Response> => {

        try{

            const { colaboratorId } = req.params;

            const colaborator: Colaborator[] = await this.colaboratorService.getById(
                this.sheetName as string,
                colaboratorId
            );

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Colaborador buscado pelo id com sucesso!',
                colaborator
            ));
        }
        catch(err: any){
            return res.status(err.httpStatus || 500).json(GoogleSheetsResponse.errorMessage(
                'Falha ao buscar colaborador pelo ID!',
                err.message
            ));
        }
    }

    listBySector = async (req: Request, res: Response): Promise<Response> => {

        try{

            const { sector } = req.params;

            const colaborators: Colaborator[] = await this.colaboratorService.listBySector(
                this.sheetName as string,
                sector
            );

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Colaboradore listados por setor com sucesso!',
                colaborators
            ))
        }
        catch(err: any){
            return res.status(err.httpStatus || 500).json(GoogleSheetsResponse.errorMessage(
                'Falha ao listar colaboradores por setor!',
                err.message
            ));
        }
    }

}

export default ColaboratorController;