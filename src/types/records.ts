export interface TimeRecord {
  collaboratorId: number | string;
  name: string;
  sector: string;
  type: string;
  day: Date | string;
  entry: Date;
  exit: Date;
  recordId: number;
}

export interface RecordsFilter {
  collaboratorId?: number;
  name?: string;
  sector?: string;
  type?: string;
  day?: Date;
  entry?: Date;
  exit?: Date;
  recordId?: number;
}



export interface MealCountBySector {
  sector: string;
  total: unknown;
}

export interface MealCountByCollaborator {
  collaborator: string;
  sector: string;
  total: number;
}

export interface MealCountByCollaboratorType {
  type: string;
  total: unknown;
}

export type MealCountMap = Record<string, MealCountByCollaborator>;
