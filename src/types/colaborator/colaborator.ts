export interface Colaborator {
    colaboratorId: number;
    name: string;
    sector: string;
}

export interface CreateColaboratorDTO {
    name: string;
    sector: string;
}

export interface ColaboratorFilter {
    colaboratorId?: number;
    name?: string;
    sector?: string;
}