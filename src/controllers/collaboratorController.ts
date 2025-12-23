import { NextFunction, Request, Response } from "express";
import GoogleSheetsResponse from "../responses/googleSheetsResponse";
import CollaboratorService from "../services/collaboratorService";
import { Collaborator } from "../types/collaborator";

class CollaboratorController {

    public readonly range: string = 'Página1!A:Z';
    public readonly sheetName: string = 'Colaboradores';
    private readonly collaboratorService: CollaboratorService;

    constructor(collaboratorService: CollaboratorService){
        this.collaboratorService = collaboratorService;

        if(!this.collaboratorService){
            throw new Error('Dependencia não injetada corretamente');
        }
    }

    getAll = async (req: Request, res: Response): Promise<Response> => {

        try{

            const collaborators: Collaborator[] = await this.collaboratorService.getAll(
                this.sheetName as string
            );

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Colaboradores buscados com sucesso!',
                collaborators
            ));
        }
        catch(err: any){
            return res.status(err.httpStatus || 500).json(GoogleSheetsResponse.errorMessage(
                'Falha ao buscar colaboradores!',
                err.message
            ));
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

        try{
            const { collaboratorId } = req.params;

            const collaborator: Collaborator = await this.collaboratorService.getById(
                this.sheetName as string,
                collaboratorId
            );

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Colaborador buscado pelo id com sucesso!',
                collaborator
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listBySector = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

        try{
            const { sector } = req.params;

            const collaborators: Collaborator[] = await this.collaboratorService.listBySector(
                this.sheetName as string,
                sector
            );

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Colaboradores listados por setor com sucesso!',
                collaborators
            ))
        }
        catch(err: any){
            next(err);
        }
    }

    createCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

        try{
            const { values } = req.body;

            await this.collaboratorService.createCollaborator(
                this.sheetName,
                values
            );

            return res.status(201).json(GoogleSheetsResponse.successMessage(
                'Colaborador registrado com sucesso!',
                null
            ));
        }
        catch(err: any){
            next(err);
        }
    }
}

export default CollaboratorController;