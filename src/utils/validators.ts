import ApiException from "../errors/ApiException";

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

export function validateRangeAndSheetName(range: string, sheetName: string){

    
    if(!range || range === undefined)
        throw new ApiException('Range da folha não informado!', 400);
    
    if(!sheetName || sheetName === undefined)
        throw new ApiException('Nome da folha não informado!', 400);
}

export function validateParams(param: any, paramName: string){

    if(!param || param === undefined || param === null || param.length === 0)
        throw new ApiException(`${paramName} não fornecido corretamente!`, 400);
}