export interface Collaborator {
    collaboratorId: number | string;
    name: string;
    sector: string;
    type: string;
}

export interface CollaboratorFilter {
    collaboratorId?: number | string;
    name?: string;
    sector?: string;
    type?: string;
}