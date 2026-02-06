import CollaboratorService from "../services/collaboratorService";
import RecordsService from "../services/recordsService";
import { GoogleSheetsClient } from "./googleSheetsClient";
import { GoogleSheetsRepository } from "./googleSheetsRepository";

export async function buildContainer() {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS!);

    const googleSheetsClient = new GoogleSheetsClient(
        credentials,
        process.env.SPREADSHEET_ID!
    );

    try {
        await googleSheetsClient.testConnection();
        console.log('-    Google Sheets conectado');
    } 
    catch {
        console.error('-  Falha ao conectar com Google Sheets');
        process.exit(1);
    }

    const googleSheetsRepository = new GoogleSheetsRepository(googleSheetsClient);

    return {
        collaboratorService: new CollaboratorService(googleSheetsRepository),
        recordsService: new RecordsService(googleSheetsRepository),
    }
}