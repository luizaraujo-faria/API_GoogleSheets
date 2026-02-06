import { GoogleSheetsClient } from "./googleSheetsClient";

export class GoogleSheetsRepository {
  constructor(private readonly sheetsClient: GoogleSheetsClient) {}

  async sendData(range: string, values: any[]): Promise<void> {
    await this.sheetsClient.append(range, values);
  }

  async getData(range: string): Promise<any[][]> {
    return await this.sheetsClient.get(range);
  }

  async getDataByFilter(range: string): Promise<any[][]> {
    return await this.sheetsClient.get(range);
  }

  async updateData(range: string, values: any[]) {
    await this.sheetsClient.batchUpdateValues(values);
  }
}
