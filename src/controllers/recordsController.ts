import { NextFunction, Request, Response } from 'express';
import googleSheetsService from '../config/googleSheets';
import GoogleSheetsResponse from '../responses/googleSheetsResponse';
import RecordsService from '../services/recordsService';
import { TimeRecord } from '../types/records';

class RecordsController{

    private readonly recordsService: RecordsService;
    public readonly range: string = 'Página1!A:Z';
    public readonly sheetName: string = 'EntradaSaida';

    constructor(recordsService: RecordsService){
        this.recordsService = recordsService;

        if(!this.recordsService){
            throw new Error('Dependencia nao injetada corretamente!');
        }
    }

    getAll = async (req: Request, res: Response): Promise<Response> => {
        
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

    listBySector = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

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

    listByDay = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

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

    listEntryByTurn = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    
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

    sendRecord = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

        try{
            const { values } = req.body;

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

    // static async updateData(req: Request, res: Response){

    //     try{
    //         const { range, values } = req.body;

    //         const updatedData = await googleSheetsService.getSheetsApi.spreadsheets.values.append({
    //             spreadsheetId: googleSheetsService.getSpreadsheetId,
    //             range: range || 'Página1!A:Z',
    //             options: 'RAW',
    //             requestBody: {
    //                 values: [values]
    //             }
    //         });

    //         return res.status(200).json({ success: true, message: 'Dados atualizados com sucesso!', data: updatedData.data })
    //     }
    //     catch(err: any){
    //         res.status(500).json({ success: false, message: 'Falha ao atualizar dados!', error: err.message });
    //     }
    // }
}

export default RecordsController;