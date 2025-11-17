export interface Colaborator {
    colaboratorId: number | string;
    name: string;
    sector: string;
}

export interface CreateColaboratorDTO {
    colaboratorId: number;
    name: string;
    sector: string;
}

export interface ColaboratorFilter {
    colaboratorId?: number;
    name?: string;
    sector?: string;
}