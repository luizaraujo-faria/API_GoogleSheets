import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

// Criar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface GoogleSheetsResponse {
  success: boolean;
  data?: any;
  error?: string;
  range?: string;
  message?: string;
  location?: string;
}

class GoogleSheetsService {

  private auth: any;
  private sheets: any;
  private SPREADSHEET_ID: any;

  constructor(){
    try {

      // Caminho para o arquivo de credenciais
      const keyFilePath = join(__dirname, '../../credentials/api-imrea.json');
      console.log('Procurando credenciais em:', keyFilePath);

      
      this.auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.SPREADSHEET_ID = process.env.SPREADSHEET_ID;
      
      console.log('Google Sheets API configurada com sucesso!');
    } 
    catch(err: any){
      console.error(`Erro na configuração do Google Sheets: ${err.message}`);
      throw err;
    }
  }

  // Getters
  get getSpreadsheetId(): string{ return this.SPREADSHEET_ID; }

  get getSheetsApi(): any{ return this.sheets; }

  get getAuthClient(): any{ return this.auth; }

  async testConnection(): Promise<boolean> {

    try {

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.SPREADSHEET_ID,
      });
      
      console.log('Conexão com a planilha estabelecida!');
      console.log('Planilha:', response.data.properties.title);
      return true;

    }
    catch(err: any){
      console.error('Erro ao conectar com a planilha:', err.message);
      console.log('Verifique:');
      console.log(' 1. Se o SPREADSHEET_ID está correto no .env');
      console.log(' 2. Se a planilha foi compartilhada com o email da service account');
      console.log(' 3. Se as credenciais estão no caminho correto');
      return false;
    }
  }

  // BUSCAR DADOS
  async readData(range: string = 'Página1!A:Z'): Promise<GoogleSheetsResponse> {

    try{

      const readResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range: range,
      });

      return {
        success: true,
        data: readResponse.data.values || [],
        range: readResponse.data.range
      };
    } 
    catch(err: any){
      console.error('Erro ao ler dados:', err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }

  // CRIAR DADOS
  async writeData(range: string, values: any[]): Promise<GoogleSheetsResponse> {

    try {
        console.log(`Escrevendo dados no range: ${range}`, values);
        
        // Se o range não tiver "!", assumir que é apenas o nome da aba
        let actualRange = range;
        if(!range.includes('!')){
            actualRange = `${range}!A:Z`;
        }
        
        // Primeiro, ler para encontrar a próxima linha vazia
        const readResponse = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.SPREADSHEET_ID,
            range: actualRange,
        });

        const existingData = readResponse.data.values || [];

        let targetRow = 1;

        for(let i = 0; i < existingData.length; i++){
            if(!existingData[i] || !existingData[i][0] || existingData[i][0] === "" || existingData[i][0] === "Não informado"){
                targetRow = i + 1;
                break;
            }
        }

        if(targetRow === 1 && existingData.length > 0){
          targetRow = existingData.length + 1;
        }

        console.log(`LINHA ALVO: ${targetRow}`);
        console.log(`Dados existentes:`, existingData);
        
        const sheetName = actualRange.split('!')[0];
        const specificRange = `${sheetName}!A${targetRow}`;
        
        console.log(`Escrevendo na linha: ${targetRow}`);
        console.log(`Range específico: ${specificRange}`);

        const createResponse = await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.SPREADSHEET_ID,
            range: specificRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [values]
            }
        });

        console.log('Dados escritos com sucesso!');
        console.log('Local:', createResponse.data.updatedRange);
        
        return {
            success: true,
            data: createResponse.data,
            location: createResponse.data.updatedRange
        };
    } 
    catch(err: any){
        console.error(`Erro ao escrever dados: ${err.message}`);
        return {
            success: false,
            error: err.message
        };
    }
  }

  // ATUALIZAR DADOS
  async updateData(range: string, values: any[]): Promise<GoogleSheetsResponse> {

    try{
      console.log(`Atualizando dados no range ${range}`, values);

      if(!range.includes('!') || !range.match(/[A-Z]+\d+/)){
        throw new Error('Range deve ser específico (ex: Sheet1!A1, Sheet1!B2:D5)');
      }

      const updateResponse = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.SPREADSHEET_ID,
        range: range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values]
        }
      });

      return {
        success: true,
        message: 'Dados atualizados com sucesso',
        data: updateResponse.data
      }
    }
    catch(err: any){
      console.error(`Erro ao atualizar dados: ${err.message}`);
      return {
        success: false,
        error: err.message
      };
    }
  }
}

const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;