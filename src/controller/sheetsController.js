import googleSheetsService from '../config/googleSheets.js';

class SheetsController{

    static async readData(req, res){

        try{
            const { range } = req.query;

            const requestedData = await googleSheetsService.sheets.spreadsheets.values.get({
                spreadsheetId: googleSheetsService.SPREADSHEET_ID,
                range: range || 'Página1!A:Z',
            });

            return res.status(200).json({ success: true, message: 'Dados buscados com sucesso!',data: requestedData.data.values || []});
        }
        catch(err){
            res.status(500).json({ success: false, message: 'Falha ao buscar dados!',error: err.message });
        }
    }

    static async writeData(req, res){

        try{
            const { range, values } = req.query;

            const createdData = await googleSheetsService.sheets.spreadsheets.values.update({
                spreadsheetId: googleSheetsService.SPREADSHEET_ID,
                range: range || 'Página1!A:Z',
                options: 'RAW',
                requestBody: {
                    values: [values],
                }
            });

            return res.status(201).json({ success: true, message: 'Dados enviados com sucesso!', data: createdData.data })
        }
        catch(err){
            res.status(500).json({ success: false, message: 'Falha ao enviar dados!',error: err.message });
        }
    }

    static async updateData(req, res){

        try{
            const { range, values } = req.body;

            const updatedData = await googleSheetsService.sheets.spreadsheets.values.append({
                spreadsheetId: googleSheetsService.SPREADSHEET_ID,
                range: range || 'Página1!A:Z',
                options: 'RAW',
                requestBody: {
                    values: [values]
                }
            });

            return res.status(200).json({ success: true, message: 'Dados atualizados com sucesso!', data: updatedData.data })
        }
        catch(err){
            res.status(500).json({ success: false, message: 'Falha ao atualizar dados!', error: err.message });
        }
    }
}

export default SheetsController;