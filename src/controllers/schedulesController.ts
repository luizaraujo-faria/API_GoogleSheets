import { Request, Response } from 'express';
import googleSheetsService from '../config/googleSheets';
import GoogleSheetsResponse from '../responses/googleSheetsResponse';
import SchedulesService from '../services/schedulesService';
import ApiException from '../errors/ApiException';

class schedulesController{

    public schedulesService: SchedulesService;

    constructor(schedulesService: SchedulesService){
        this.schedulesService = schedulesService;

        if(!this.schedulesService){
            throw new Error('Dependencia nao injetada corretamente!');
        }
    }

    getAll = async (req: Request, res: Response): Promise<any> => {
        
        try{

            // console.log(`SPREADSHEET_ID: ${googleSheetsService.getSpreadsheetId}`);
            // console.log(`SHEETSAPI: ${googleSheetsService.getSheetsApi}`);
            // console.log(`AUTHCLIENT: ${googleSheetsService.getAuthClient}`);

            const { range = 'Página1!A:Z', sheetName = 'EntradaSaida' } = req.query;
            
            const requestedData: any = await this.schedulesService.getAll(
                range as string,
                sheetName as string
            );

            const response = new GoogleSheetsResponse<any>(
                true,
                'Dados buscados com sucesso!',
                requestedData
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

    writeData = async (req: Request, res: Response): Promise<any> => {

        try{
            const { range, values, sheetName = 'EntradaSaida!A:Z' } = req.body;

            console.log('Dados recebidos:', { range, values, sheetName });

            const createdData: any = await this.schedulesService.writeData(range || sheetName, values);

            return res.status(201).json(GoogleSheetsResponse.successMessage(
                'Dados criados com sucesso!',
                createdData.data
            ));
        }
        catch(err: any) {
            console.error('Erro na controller:', err);
            res.status(err.httpStatus || 500).json(GoogleSheetsResponse.errorMessage(
                'Falha ao enviar dados',
                err.message
            ));
        }
    }

    static async updateData(req: Request, res: Response){

        try{
            const { range, values } = req.body;

            const updatedData = await googleSheetsService.getSheetsApi.spreadsheets.values.append({
                spreadsheetId: googleSheetsService.getSpreadsheetId,
                range: range || 'Página1!A:Z',
                options: 'RAW',
                requestBody: {
                    values: [values]
                }
            });

            return res.status(200).json({ success: true, message: 'Dados atualizados com sucesso!', data: updatedData.data })
        }
        catch(err: any){
            res.status(500).json({ success: false, message: 'Falha ao atualizar dados!', error: err.message });
        }
    }
}

export default schedulesController;