import { NextFunction, Request, Response } from 'express';
import GoogleSheetsResponse from '../res/googleSheetsResponse';
import RecordsService from '../services/recordsService';
import { AverageMealTimeBySector, EntriesByHour, TimeRecord } from '../types/records';
import { recordsFilterSchema } from '../schemas/recordsSchema';
import { createRecordRequestSchema } from '../dto/createRecord';

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

    getAllByFilters = async (
        req: Request, 
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const records = await this.recordsService.getAllByFilters(req.query);
            const response = new GoogleSheetsResponse<any>(
                true,
                'Dados buscados com sucesso!',
                records
            );

            return res.status(200).json(response);
        }
        catch(err: any){
            next(err);
        }
    }

    listMealCountOfAllSectorsByMonthAndYear = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { date, turn } = req.query;

            const mostMealSectors: any[] = await this.recordsService.listMealCountOfAllSectorsByMonthAndYear(
                date as string,
                turn as string
            );

            const responseMessage = 
                turn ?
                `Quantidade de vezes que cada setor comeu durante o período (${date}) no turno (${turn}) carregados!`
                : `Quantidade de vezes que cada setor comeu durante o período (${date}) carregados!`;

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                responseMessage,
                mostMealSectors
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listMealCountOfAllCollaboratorsByMonthAndYear = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { date, turn } = req.query;

            const mostMealCollaborators: any[] = await this.recordsService.listMealCountOfAllCollaboratorsByMonthAndYear(
                date as string,
                turn as string
            );

            const responseMessage = 
                turn ?
                `Quantidade de vezes que cada colaborador comeu durante o período (${date}) no turno (${turn}) carregados!`
                : `Quantidade de vezes que cada colaborador comeu durante o período (${date}) carregados!`;

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                responseMessage,
                mostMealCollaborators
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    listMealCountOfAllCollaboratorTypeByMonthAndYear = async (
        req: Request, 
        res: Response, 
        next: NextFunction
    ): Promise<Response | void> => {

        try{
            const { date, turn } = req.query;

            const mostMealCollaboratorType: any[] = await this.recordsService.listMealCountOfAllCollaboratorTypeByMonthAndYear(
                date as string,
                turn as string
            );

            const responseMessage = 
                turn ?
                `Quantidade de vezes que cada tipo de colaborador comeu durante o período (${date}) no turno (${turn}) carregados!`
                : `Quantidade de vezes que cada tipo de colaborador comeu durante o período (${date}) carregados!`;

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                responseMessage,
                mostMealCollaboratorType
            ));
        }
        catch(err: any){
            next(err);
        }
    }

    groupByPeakTimeByMonth = async (
        req: Request,
        res: Response,
        next: NextFunction        
    ): Promise<Response | void> => {
        try{
            const { date } = req.query;

            const entriesByHour: EntriesByHour[] 
            = await this.recordsService.groupByPeakTimeByMonthAndYear(
                date as string
            );

            const responseMessage = 
                `Horário de pico do período ${date} carregados!`;

            res.status(200).json(GoogleSheetsResponse.successMessage(
                responseMessage,
                entriesByHour,
            )); 
        }
        catch(err: any) {
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