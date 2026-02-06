import { NextFunction, Request, Response } from 'express';
import GoogleSheetsResponse from '../responses/googleSheetsResponse';
import RecordsService from '../services/recordsService';
import { TimeRecord } from '../types/records';
import { createRecordRequestSchema } from "../types/records";

class RecordsController{
    constructor(private readonly recordsService: RecordsService){}

    getAll = async (
        req: Request, 
        res: Response
    ): Promise<Response> => {
        
        try{
            
            const records: TimeRecord[] = await this.recordsService.getAll();

            const response = new GoogleSheetsResponse<any>(
                true,
                'Dados buscados com sucesso!',
                records
            );

            return res.status(200).json(response);
        }
        catch(err: any){
            return res.status(err.httpStatus || 500).json(GoogleSheetsResponse.errorMessage(
                'Falha ao buscar dados',
                err.message
            ));
        }
    }

    listBySector = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { sector } = req.params;

            const records: TimeRecord[] = await this.recordsService.listBySector(
                sector as string
            );

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Registros por setor buscados com sucesso!',
                records
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listByDay = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { day } = req.params;

            const records: TimeRecord[] = await this.recordsService.listByDay(
                day as string
            );

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Dados listado por dia com sucesso!',
                records
            ))
        }
        catch(err: any){
            next(err);
        }
    }

    listEntryByTurn = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {
    
        try{
            const { turn } = req.params;

            const records: TimeRecord[] = await this.recordsService.listEntryByTurn(
                turn as string
            );
            
            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Registros carregados por entrada com sucesso!',
                records
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listMealCountByColaboratorIdByMonth = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { colaboratorId, month } = req.params;
            const { turn } = req.query;

            const mealCountByColaborator: number = await this.recordsService.listMealCountByColaboratorIdByMonth(
                colaboratorId as string,
                month as string,
                turn as string
            );

            const responseMessage = 
                turn ?
                `Total de vezes que o colaborador (${colaboratorId}) comeu durante o mês (${month}) no turno (${turn}) carregados!`
                : `Total de vezes que o colaborador (${colaboratorId}) comeu durante o mês (${month}) carregados!`;

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                responseMessage,
                mealCountByColaborator
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listMealCountBySectorByMonth = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { sector, month } = req.params;
            const { turn } = req.query;

            const mealCountBySector: number = await this.recordsService.listMealCountBySectorByMonth(
                sector as string,
                month as string,
                turn as string
            );

            const responseMessage = 
                turn ?
                `Total de vezes que o setor (${sector}) comeu durante o mês (${month}) no turno (${turn}) carregados!`
                : `Total de vezes que o setor (${sector}) comeu durante o mês (${month}) carregados!`;

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                responseMessage,
                mealCountBySector
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listMostMealCountSectorsByMonth = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { month } = req.params;
            const { turn } = req.query;

            const mostMealSectors: any[] = await this.recordsService.listMostMealCountSectorsByMonth(
                month as string,
                turn as string
            );

            const responseMessage = 
                turn ?
                `Os 5 setores que mais comeram durante o mês (${month}) no turno (${turn}) carregados!`
                : `Os 5 setores que mais comeram durante o mês (${month}) carregados!`;

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                responseMessage,
                mostMealSectors
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listMealCountOfAllSectorsByMonth = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { month } = req.params;
            const { turn } = req.query;

            const mostMealSectors: any[] = await this.recordsService.listMealCountOfAllSectorsByMonth(
                month as string,
                turn as string
            );

            const responseMessage = 
                turn ?
                `Quantidade de vezes que cada setor comeu durante o mês (${month}) no turno (${turn}) carregados!`
                : `Quantidade de vezes que cada setor comeu durante o mês (${month}) carregados!`;

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                responseMessage,
                mostMealSectors
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listMealCountOfAllCollaboratorsByMonth = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { month } = req.params;
            const { turn } = req.query;

            const mostMealCollaborators: any[] = await this.recordsService.listMealCountOfAllCollaboratorsByMonth(
                month as string,
                turn as string
            );

            const responseMessage = 
                turn ?
                `Quantidade de vezes que cada colaborador comeu durante o mês (${month}) no turno (${turn}) carregados!`
                : `Quantidade de vezes que cada colaborador comeu durante o mês (${month}) carregados!`;

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                responseMessage,
                mostMealCollaborators
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listMealCountOfAllCollaboratorTypeByMonth = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { month } = req.params;
            const { turn } = req.query;

            const mostMealCollaboratorType: any[] = await this.recordsService.listMealCountOfAllCollaboratorTypeByMonth(
                month as string,
                turn as string
            );

            const responseMessage = 
                turn ?
                `Quantidade de vezes que cada tipo de colaborador comeu durante o mês (${month}) no turno (${turn}) carregados!`
                : `Quantidade de vezes que cada tipo de colaborador comeu durante o mês (${month}) carregados!`;

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                responseMessage,
                mostMealCollaboratorType
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    sendRecord = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { values } = createRecordRequestSchema.parse(req.body);

            await this.recordsService.sendRecord(values);

            return res.status(201).json(GoogleSheetsResponse.successMessage(
                'Registro enviado com sucesso!',
                null
            ));
        }
        catch(err: any) {
            next(err);
        }
    }
}

export default RecordsController;