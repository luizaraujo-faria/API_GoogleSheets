// const { google } = require('googleapis');
// const path = require('path');

import { google } from 'googleapis';
import path from 'node:path';

class GoogleSheetsService {

  constructor(){
    try {

      // Caminho para o arquivo de credenciais
      this.auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, '../credentials/api-imrea.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.SPREADSHEET_ID = process.env.SPREADSHEET_ID;
      
      console.log('Google Sheets API configurada com sucesso!');
    } 
    catch (err){
      console.error('Erro na configuração do Google Sheets:', err.message);
      throw err;
    }
  }

  async testConnection(){

    try {

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.SPREADSHEET_ID,
      });
      
      console.log('Conexão com a planilha estabelecida!');
      console.log('Planilha:', response.data.properties.title);
      return true;

    }
    catch(err){
      console.error('Erro ao conectar com a planilha:', err.message);
      console.log('Verifique:');
      console.log(' 1. Se o SPREADSHEET_ID está correto no .env');
      console.log(' 2. Se a planilha foi compartilhada com o email da service account');
      console.log(' 3. Se as credenciais estão no caminho correto');
      return false;
    }
  }

  async readData(range = 'Página1!A:Z') {

    try{

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range: range,
      });

      return {
        success: true,
        data: response.data.values || [],
        range: response.data.range
      };
    } 
    catch(err){
      console.error('❌ Erro ao ler dados:', err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }

  async writeData(range, values){

    try {

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: {
          values: [values]
        }
      });

      return {
        success: true,
        data: response.data
      };
    } 
    catch(err){
      console.error('Erro ao escrever dados:', err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }
}

const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;