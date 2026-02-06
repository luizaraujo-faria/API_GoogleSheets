import { google, sheets_v4 } from "googleapis";

export class GoogleSheetsClient {
  private sheets: sheets_v4.Sheets;
  private readonly spreadSheetId: string;

  constructor(credentials: any, spreadSheetId: string) {
    this.spreadSheetId = spreadSheetId;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth: auth });
  }

  async testConnection(): Promise<void> {
    await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadSheetId,
    });
  }

  async append(range: string, values: string[][]): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadSheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  }

  async get(range: string): Promise<any[][]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadSheetId,
      range,
    });

    return res.data.values ?? [];
  }

  async batchGetValues(ranges: string[]): Promise<any[][]> {
    const res = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId: this.spreadSheetId,
      ranges,
    });

    return res.data.valueRanges?.map(v => v.values ?? []) ?? [];
  }

  async batchUpdateValues(values: any[]): Promise<void> {
    await this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadSheetId,
      requestBody: {
        data: values,
        valueInputOption: 'USER_ENTERED',
      }
    })
  }
}
