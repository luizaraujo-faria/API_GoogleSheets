sendRecord = async (range: string, values: CreateRecordDTO[]): Promise<void> => {

        // Se veio um só objeto em vez de array, normalizamos
        const records = Array.isArray(values) ? values : [values];

        // Ajusta range e sheetName
        let actualRange = range && range.includes("!") ? range : `${range || 'EntradaSaida'}!A:Z`;
        const sheetName = actualRange.includes("!") ? actualRange.split("!")[0] : actualRange;

        // Busca tudo apenas 1 vez
        const readResponse = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadSheetId,
            range: `${sheetName}!A:Z`,
        });

        const rows = (readResponse.data && readResponse.data.values) || [];

        // Detectar header
        const hasHeader =
            rows.length > 0 &&
            rows[0].some((cell: any) => typeof cell === "string" && /colaborador.*id/i.test(cell));

        const dataStartIndex = hasHeader ? 1 : 0;

        // Índices fixos ou detectados pelo header (aqui mantive os seus)
        let idxColab = 0, idxDay = 3, idxEntry = 4, idxExit = 5;

        // juntar todas as linhas que precisam ser inseridas
        const rowsToAppend: any[] = [];

        // processa CADA registro da lista mantendo sua lógica original
        for (const record of records) {

            const serializedId = recordTypeFields.colaboratorId.parse(String(record).trim());
            const today = dayjs().format("DD/MM/YY");

            let foundRowIndex: number | null = null;

            for (let i = rows.length - 1; i >= dataStartIndex; i--) {
                const row = rows[i] || [];
                const rowColab = row[idxColab] ? String(row[idxColab]).trim() : "";
                if (rowColab !== serializedId) continue;

                const rowDayRaw = row[idxDay] ? String(row[idxDay]).trim() : "";
                const rowDayNormalized = rowDayRaw
                    ? dayjs(rowDayRaw, ["DD/MM/YY", "DD/MM/YYYY", "YYYY-MM-DD"]).format("DD/MM/YY")
                    : "";

                if (rowDayNormalized !== today) continue;

                const entryCell = row[idxEntry] ? String(row[idxEntry]).trim() : "";
                const exitCell = row[idxExit] ? String(row[idxExit]).trim() : "";

                const exitIsEmpty = !exitCell || exitCell === "xx:xx" || exitCell === "XX:XX" || exitCell === "N/A";

                if (entryCell && exitIsEmpty) {
                    foundRowIndex = i;
                    break;
                }
            }

            // Atualizar saída se existir registro válido
            if (foundRowIndex !== null) {

                const spreadsheetRow = foundRowIndex + 1;

                const exitColumnLetter = (() => {
                    let n = idxExit;
                    let s = "";
                    while (n >= 0) {
                        s = String.fromCharCode((n % 26) + 65) + s;
                        n = Math.floor(n / 26) - 1;
                    }
                    return s;
                })();

                const updateRange = `${sheetName}!${exitColumnLetter}${spreadsheetRow}`;
                const nowTime = dayjs().format("HH:mm");

                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.spreadSheetId,
                    range: updateRange,
                    valueInputOption: "USER_ENTERED",
                    requestBody: {
                        values: [[nowTime]]
                    }
                });

                continue; // vai para o próximo registro
            }

            // Se não encontrou → cria nova linha
            const newRow: any[] = [];
            newRow[idxColab] = serializedId;

            // acumulamos as novas linhas para inserir todas juntas
            rowsToAppend.push(newRow);

            // adicionamos na matriz local para que próximos registros possam detectar corretamente
            rows.push(newRow);
        }

        // Se houver linhas novas, inserir TODAS em um único append
        if (rowsToAppend.length > 0) {
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadSheetId,
                range: `${sheetName}!A:Z`,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: rowsToAppend
                }
            });
        }

        return;
    };

    // sendRecord = async(range: string, values: CreateRecordDTO[]): Promise<void> => {

    //     const serializedId = recordTypeFields.colaboratorId.parse(String(values).trim());
    //     const today = dayjs().format("DD/MM/YY");

    //     // Ajusta range e sheetName
    //     let actualRange = range && range.includes("!") ? range : `${range || 'EntradaSaida'}!A:Z`;
    //     const sheetName = actualRange.includes("!") ? actualRange.split("!")[0] : actualRange;

    //     // Busca tudo
    //     const readResponse = await this.sheets.spreadsheets.values.get({
    //         spreadsheetId: this.spreadSheetId,
    //         range: `${sheetName}!A:Z`,
    //     });

    //     const rows = (readResponse.data && readResponse.data.values) || [];

    //     // Detectar se existe header
    //     const hasHeader =
    //     rows.length > 0 &&
    //     rows[0].some((cell: any) => typeof cell === "string" && /colaborador.*id/i.test(cell));

    //     const dataStartIndex = hasHeader ? 1 : 0;

    //     // Índices das colunas (tenta detectar pelo header, senão usa posições fixas)
    //     let idxColab = 0, idxDay = 3, idxEntry = 4, idxExit = 5;

    //     let foundRowIndex: number | null = null;
    //     for(let i = rows.length - 1; i >= dataStartIndex; i--){
    //         const row = rows[i] || [];
    //         const rowColab = row[idxColab] ? String(row[idxColab]).trim() : "";
    //         if (rowColab !== serializedId) continue;

    //         const rowDayRaw = row[idxDay] ? String(row[idxDay]).trim() : "";
    //         const rowDayNormalized = rowDayRaw ? dayjs(rowDayRaw, ["DD/MM/YY", "DD/MM/YYYY", "YYYY-MM-DD"]).format("DD/MM/YY") : "";

    //         if (rowDayNormalized !== today) continue;

    //         const entryCell = row[idxEntry] ? String(row[idxEntry]).trim() : "";
    //         const exitCell  = row[idxExit]  ? String(row[idxExit]).trim()  : "";

    //         const exitIsEmpty = !exitCell || exitCell === "xx:xx" || exitCell === "XX:XX" || exitCell === "N/A";

    //         if (entryCell && exitIsEmpty) {
    //             foundRowIndex = i;
    //             break;
    //         }
    //     }

    //     // Atualiza registro e preenche saída
    //     if(foundRowIndex !== null){
    //         // spreadsheet row number = array index + 1 (porque rows[0] -> linha 1)
    //         const spreadsheetRow = foundRowIndex + 1;
    //         const exitColumnLetter = (() => {
    //             // traduz idxExit (0-based) para letra (A,B,C...)
    //             const colIndex = idxExit; // 0-based
    //             let n = colIndex;
    //             let s = "";
    //             while (n >= 0){
    //                 s = String.fromCharCode((n % 26) + 65) + s;
    //                 n = Math.floor(n / 26) - 1;
    //             }
    //             return s;
    //         })();

    //         const updateRange = `${sheetName}!${exitColumnLetter}${spreadsheetRow}`;
    //         const nowTime = dayjs().format("HH:mm");

    //         await this.sheets.spreadsheets.values.update({
    //             spreadsheetId: this.spreadSheetId,
    //             range: updateRange,
    //             valueInputOption: "USER_ENTERED",
    //             requestBody: {
    //             values: [[nowTime]]
    //             }
    //         });

    //         return;
    //     }

    //     // Cria nova linha na tabela
    //     const newRow: (string | number)[] = [];
    //     newRow[idxColab] = serializedId;

    //     await this.sheets.spreadsheets.values.append({
    //         spreadsheetId: this.spreadSheetId,
    //         range: `${sheetName}!A:Z`,
    //         valueInputOption: "USER_ENTERED",
    //         requestBody: {
    //             values: [newRow]
    //         }
    //     });

    //     return;
    // }

//     // ATUALIZAR DADOS
//     async updateData(range: string, values: any[]): Promise<GoogleSheetsResponse> {

//     try{
//         console.log(`Atualizando dados no range ${range}`, values);

//         if(!range.includes('!') || !range.match(/[A-Z]+\d+/)){
//         throw new Error('Range deve ser específico (ex: Sheet1!A1, Sheet1!B2:D5)');
//         }

//         const updateResponse = await this.sheets.spreadsheets.values.update({
//         spreadsheetId: this.SPREADSHEET_ID,
//         range: range,
//         valueInputOption: 'USER_ENTERED',
//         requestBody: {
//             values: [values]
//         }
//         });

//         return {
//             success: true,
//             message: 'Dados atualizados com sucesso',
//             data: updateResponse.data
//         }
//     }
//     catch(err: any){
//         console.error(`Erro ao atualizar dados: ${err.message}`);
//         return {
//             success: false,
//             error: err.message
//         };
//     }
//     }