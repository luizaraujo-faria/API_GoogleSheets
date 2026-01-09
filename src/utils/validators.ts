import dayjs from "dayjs";

// VALIDA OS DADOS CRUS BUSCADOS
export function validateSheetData<T extends object>(
    data: T[],
    emptyValues: any[] = ["", "N/A", null, undefined]
): { valid: boolean; message?: string; data?: T[] } {

    if (!data || data.length === 0) {
        return { valid: false, message: "Nenhum dado encontrado." };
    }

    const allEmpty = data.every(item =>
        Object.values(item).every(value =>
        emptyValues.includes(value)
        )
    );

    if (allEmpty) {
        return { valid: false, message: "Nenhum dado válido encontrado." };
    }

    return { valid: true, data };
}

export const normalizeDay = (value: any): dayjs.Dayjs | null => {
    const parsed = dayjs(value, [
        "DD/MM/YY",
        "DD/MM/YYYY",
        "D/M/YY",
        "YYYY-MM-DD",
        'M/D/YY',
        'MM/DD/YY',
    ], true);

    return parsed.isValid() ? parsed : null;
};