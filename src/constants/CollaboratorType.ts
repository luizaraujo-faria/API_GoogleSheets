import z from "zod";

export const colaboratorTypeSchema = z.enum(['residente', 'visitante', 'terceirizado', 'colaborador'], {
    required_error: 'Tipo de colaborador é obrigatório!',
    invalid_type_error: 'Tipo de colaborador inválido!'
})

export enum ColaboratorType {
    RESIDENT = 'residente',
    VISITOR = 'visitante',
    OUTSOURCED = 'terceirizado',
    COLLABORATOR = 'colaborador'
}