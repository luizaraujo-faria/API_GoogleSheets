
export function mapSheetRowToRecord(row: Record<string, any>) {

    return {
        colaboratorId: row["Colaborador_ID"] ?? "",
        name: row["Nome"] ?? "",
        sector: row["Setor"] ?? "",
        day: row["Dia"] ?? "",
        entry: row["Entrada"] ?? "",
        exit: row["Saida"] ?? "",
        id: row["ID"] ?? "",
        recordId: row["ID"] ?? "" 
    };
}

export function mapSheet<T>(values: any[][]): T[] {

    if (!values || values.length === 0) return [];

    const [header, ...rows] = values;

    return rows.map((row) => {

        const obj: any = {};

        header.forEach((colName, i) => {
            obj[colName] = row[i] ?? '';
        });
        
        return obj as T;
    });
}