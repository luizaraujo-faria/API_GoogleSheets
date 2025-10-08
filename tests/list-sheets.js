import { google } from 'googleapis';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function listSheets() {
  try {
    const credentials = JSON.parse(readFileSync('./credentials/api-imrea.json', 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });

    console.log('📊 Planilha:', response.data.properties.title);
    console.log('📑 Abas disponíveis:');
    
    response.data.sheets.forEach((sheet, index) => {
      const sheetName = sheet.properties.title;
      console.log(`   ${index + 1}. "${sheetName}"`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

listSheets();