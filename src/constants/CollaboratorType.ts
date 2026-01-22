import z from "zod";

export const collaboratorRoleSchema = z.enum(['Residente', 'Visitante', 'Terceirizado', 'Colaborador'], {
    required_error: 'Tipo de colaborador é obrigatório!',
    invalid_type_error: 'Tipo de colaborador inválido!'
})

export enum ColalboratorRole {
    RESIDENT = 'Residente',
    VISITOR = 'Visitante',
    OUTSOURCED = 'Terceirizado',
    COLLABORATOR = 'Colaborador'
}