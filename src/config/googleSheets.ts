import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// CONFIGURA .ENV
dotenv.config();

// Criar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if(!process.env.GOOGLE_CREDENTIALS) {
  throw new Error("A variável GOOGLE_CREDENTIALS não está definida!");
}

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

class GoogleSheetsService {

  private auth: any;
  private sheets: any;
  private SPREADSHEET_ID: string | undefined;

  constructor(){

    try {

      // CAMINHO PARA O ARQUIVO DE CREDENCIAIS
      console.log('Procurando credenciais em:', credentials);

      // AUTENTICA AS CREDENCIAIS DO GOOGLESHEETS API
      this.auth = new google.auth.GoogleAuth({
        credentials,
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
  get getSpreadsheetId(): string | undefined { return this.SPREADSHEET_ID; }
  get getSheetsApi(): any { return this.sheets; }
  get getAuthClient(): any { return this.auth; }

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
      console.log('\nVerifique:');
      console.log(' 1. Se o SPREADSHEET_ID está correto no .env');
      console.log(' 2. Se a planilha foi compartilhada com o email da service account');
      console.log(' 3. Se as credenciais estão no caminho correto');
      return false;
    }
  }
}

const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;