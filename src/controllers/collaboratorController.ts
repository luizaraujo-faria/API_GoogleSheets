import { NextFunction, Request, Response } from "express";
import GoogleSheetsResponse from "../res/googleSheetsResponse";
import CollaboratorService from "../services/collaboratorService";
import { Collaborator } from "../types/collaborator";

class CollaboratorController {
    constructor(private readonly collaboratorService: CollaboratorService){}

    getAll = async (req: Request, res: Response): Promise<Response> => {

        try{

            const collaborators: Collaborator[] = await this.collaboratorService.getAll();

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

    // listByFilter = async (
    //     req: Request, 
    //     res: Response, 
    //     next: NextFunction
    // ): Promise<Response | void> => {

    //     try{
    //         const { sector } = req.params;

    //         const collaborators: Collaborator[] = await this.collaboratorService.listBySector(
    //             sector
    //         );

    //         return res.status(200).json(GoogleSheetsResponse.successMessage(
    //             'Colaboradores listados por setor com sucesso!',
    //             collaborators
    //         ))
    //     }
    //     catch(err: any){
    //         next(err);
    //     }
    // }

    createCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

        try{
            const { values } = req.body;

            await this.collaboratorService.createCollaborator(
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