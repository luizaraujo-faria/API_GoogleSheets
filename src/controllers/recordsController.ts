import { NextFunction, Request, Response } from 'express';
import googleSheetsService from '../config/googleSheets';
import GoogleSheetsResponse from '../responses/googleSheetsResponse';
import RecordsService from '../services/recordsService';
import { TimeRecord } from '../types/records';

class RecordsController{

    private readonly recordsService: RecordsService;
    public readonly range: string = 'Página1!A:G';
    public readonly sheetName: string = 'EntradaSaida!A:G';

    constructor(recordsService: RecordsService){
        this.recordsService = recordsService;

        if(!this.recordsService){
            throw new Error('Dependencia nao injetada corretamente!');
        }
    }

    getAll = async (
        req: Request, 
        res: Response
    ): Promise<Response> => {
        
        try{
            
            const records: TimeRecord[] = await this.recordsService.getAll(
                this.sheetName
            );

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
                this.sheetName,
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
                this.sheetName,
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
                this.sheetName,
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
                this.sheetName,
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
                this.sheetName,
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
                this.sheetName,
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

    sendRecord = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const values = req.body;

            await this.recordsService.sendRecord(this.sheetName, values);

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