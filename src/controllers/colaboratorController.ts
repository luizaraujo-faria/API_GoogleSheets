import { Request, Response } from "express";
import GoogleSheetsResponse from "../responses/googleSheetsResponse";
import ColaboratorService from "../services/colaboratorService";
import { Colaborator } from "../types/colaborator/colaborator";

class ColaboratorController {

    private colaboratorService: ColaboratorService;

    constructor(colaboratorService: ColaboratorService){
        this.colaboratorService = colaboratorService;

        if(!this.colaboratorService){
            throw new Error('Dependencia não injetada corretamente');
        }
    }

    getAll = async (req: Request, res: Response): Promise<any> => {

        try{

            const { range, sheetName = 'Colaboradores' } = req.query;

            const colaborators: Colaborator = await this.colaboratorService.getAll(
                range as string || sheetName as string
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

    getById = async (req: Request, res: Response): Promise<any> => {

        try{

            const { range, sheetName = 'Colaboradores' } = req.query;

            // const colaborator: Colaborator = await this.colaboratorService.getById(
            //     range as string || sheetName as string
            // );

            // return res.status(200).json(GoogleSheetsResponse.successMessage(
            //     'Colaborador buscado com sucesso!',
            //     colaborator
            // ));

        }
        catch(err: any){
            return res.status(err.httpStatus || 500).json(GoogleSheetsResponse.errorMessage(
                'Falha ao buscar colaborador pelo ID!',
                err.message
            ));
        }
    }

}

export default ColaboratorController;