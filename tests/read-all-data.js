import { google } from 'googleapis';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function readAllData() {
  try {
    const credentials = JSON.parse(readFileSync('./credentials/api-imrea.json', 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Primeiro, listar as abas
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });

    console.log('📊 Planilha:', spreadsheet.data.properties.title);
    
    // Para cada aba, ler os dados
    for (const sheet of spreadsheet.data.sheets) {
      const sheetName = sheet.properties.title;
      console.log(`\n📖 Lendo aba: "${sheetName}"`);
      
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: `${sheetName}!A:Z`,
        });

        if (response.data.values && response.data.values.length > 0) {
          console.log(`✅ Dados encontrados: ${response.data.values.length} linhas`);
          console.log('Primeiras 5 linhas:');
          response.data.values.slice(0, 5).forEach((row, index) => {
            console.log(`   Linha ${index + 1}:`, row);
          });
        } else {
          console.log('ℹ️  Nenhum dado encontrado nesta aba');
        }
      } catch (error) {
        console.log(`❌ Erro ao ler aba "${sheetName}":`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

readAllData();