import { Request, Response } from 'express';
import googleSheetsService from '../config/googleSheets';
import GoogleSheetsResponse from '../responses/googleSheetsResponse';
import RecordsService from '../services/recordsService';
import { Record } from '../types/records/records';

class RecordsController{

    public recordsService: RecordsService;
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

            // console.log(`SPREADSHEET_ID: ${googleSheetsService.getSpreadsheetId}`);
            // console.log(`SHEETSAPI: ${googleSheetsService.getSheetsApi}`);
            // console.log(`AUTHCLIENT: ${googleSheetsService.getAuthClient}`);

            // const { range = 'Página1!A:Z', sheetName = 'EntradaSaida' } = req.query;
            
            const records: Record[] = await this.recordsService.getAll(
                this.range,
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

    listBySector = async (req: Request, res: Response): Promise<Response> => {

        try{

            const { sector } = req.params;

            console.log(`SETOR DO FILTRO: ${sector}`);

            const records: Record[] = await this.recordsService.listBySector(
                this.range,
                this.sheetName,
                sector as string
            );

            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Registros por setor buscados com sucesso!',
                records
            ));
        }
        catch(err: any){
            return res.status(err.httpStatus || 500).json(GoogleSheetsResponse.errorMessage(
                'Falha ao listar por setor!',
                err.message
            ));
        }
    }

    listByDay = async (req: Request, res: Response): Promise<Response> => {

        try{

            const { day } = req.params;

            const records = await this.recordsService.listByDay(
                this.range,
                this.sheetName,
                day as string
            );


            return res.status(200).json(GoogleSheetsResponse.successMessage(
                'Dados listado por dia com sucesso!',
                records
            ))
        }
        catch(err: any){
            return res.status(err.httpStatus || 500).json(GoogleSheetsResponse.errorMessage(
                'Falha ao listar dados por dia!',
                err.message
            ));
        }
    }

    createRecord = async (req: Request, res: Response): Promise<Response> => {

        try{
            const { range, values, sheetName = 'EntradaSaida!A:Z' } = req.body;

            console.log('Dados recebidos:', { range, values, sheetName });

            const createdData: any = await this.recordsService.createRecord(range || sheetName, values);

            return res.status(201).json(GoogleSheetsResponse.successMessage(
                'Dados criados com sucesso!',
                createdData.data
            ));
        }
        catch(err: any) {
            console.error('Erro na controller:', err);
            return res.status(err.httpStatus || 500).json(GoogleSheetsResponse.errorMessage(
                'Falha ao enviar dados',
                err.message
            ));
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