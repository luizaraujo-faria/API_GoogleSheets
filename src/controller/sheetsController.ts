import { Request, Response } from 'express';
import googleSheetsService from '../config/googleSheets.js';

class SheetsController{

    static async readData(req: Request, res: Response){

        try{

            console.log(`SPREADSHEET_ID: ${googleSheetsService.getSpreadsheetId}`);
            console.log(`SHEETSAPI: ${googleSheetsService.getSheetsApi}`);
            console.log(`AUTHCLIENT: ${googleSheetsService.getAuthClient}`);

            const { range, sheetName = 'EntradaSaida' } = req.query;

            const requestedData = await googleSheetsService.getSheetsApi.spreadsheets.values.get({
                spreadsheetId: googleSheetsService.getSpreadsheetId,
                range: range || sheetName,
            });

            return res.status(200).json({ success: true, message: 'Dados buscados com sucesso!',data: requestedData.data.values || []});
        }
        catch(err: any){
            res.status(500).json({ success: false, message: 'Falha ao buscar dados!',error: err.message });
        }
    }

    static async writeData(req: Request, res: Response){

        try{
             const { range, values, sheetName = 'EntradaSaida' } = req.body;

            console.log('Dados recebidos:', { range, values, sheetName });
            
            if (!values || !Array.isArray(values)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'O campo "values" é obrigatório e deve ser um array' 
                });
            }

            // Use o sheetsService em vez de this.sheets
            const result = await googleSheetsService.writeData(range || sheetName, values);

            if(result.success){
                return res.status(201).json({ 
                    success: true, 
                    message: 'Dados enviados com sucesso!', 
                    data: result.data,
                    location: result.location 
                });
            }
            else{
                return res.status(500).json({ 
                    success: false, 
                    message: 'Falha ao enviar dados!', 
                    error: result.error 
                });
            }
        }
        catch(err: any) {
            console.error('Erro na controller:', err);
            res.status(500).json({ 
                success: false, 
                message: 'Falha ao enviar dados!', 
                error: err.message 
            });
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

export default SheetsController;