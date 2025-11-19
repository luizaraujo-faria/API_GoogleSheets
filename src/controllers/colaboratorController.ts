import { NextFunction, Request, Response } from "express";
import GoogleSheetsResponse from "../responses/googleSheetsResponse";
import ColaboratorService from "../services/colaboratorService";
import { Colaborator } from "../types/colaborator";
import { nextTick } from "process";

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

    getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

        try{
            const { colaboratorId } = req.params;

            const colaborator: Colaborator = await this.colaboratorService.getById(
                this.sheetName as string,
                colaboratorId
            );

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Colaborador buscado pelo id com sucesso!',
                colaborator
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listBySector = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

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
            next(err);
        }
    }

    createColaborator = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

        try{

            const { values } = req.body;

            await this.colaboratorService.createColaborator(
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

export default ColaboratorController;