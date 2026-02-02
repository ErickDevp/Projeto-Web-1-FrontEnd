import type { RoleEnum } from './enums'

/** DTO para requisição de login */
export interface LoginRequestDTO {
    email: string
    senha: string
}

/** DTO para requisição de registro */
export interface RegisterRequestDTO {
    nome: string
    email: string
    senha: string
}

/** DTO para requisição de reset de senha */
export interface PasswordResetRequestDTO {
    email: string
}

/** DTO para requisição de alteração de senha */
export interface PasswordChangeRequestDTO {
    token: string
    novaSenha: string
}

/** DTO de resposta de autenticação */
export interface AuthResponseDTO {
    token: string
}

/** DTO de resposta de reset de senha */
export interface PasswordResetResponseDTO {
    token: string
}

/** DTO para requisição de atualização de usuário */
export interface UsuarioRequestDTO {
    nome?: string
    email?: string
    novaSenha?: string
}

/** DTO de resposta do usuário */
export interface UsuarioResponseDTO {
    id: number
    nome: string
    email: string
    criado_em: string
    caminhoFoto?: string
    role: RoleEnum
}

// Aliases de compatibilidade
export type LoginDTO = LoginRequestDTO
export type UsuarioLoginDTO = LoginRequestDTO
export type RegisterDTO = RegisterRequestDTO
export type ForgotPasswordDTO = PasswordResetRequestDTO
export type EsqueciSenhaDTO = PasswordResetRequestDTO
export type ResetPasswordDTO = PasswordChangeRequestDTO
export type RedefinirSenhaDTO = PasswordChangeRequestDTO
export type AuthResponse = AuthResponseDTO
export type ForgotPasswordResponse = PasswordResetResponseDTO

/** 
 * DTO de usuário com campo de senha opcional 
 * Usado em páginas que precisam verificar role do usuário
 */
export interface UsuarioDTO {
    id: number
    nome: string
    email: string
    senha?: string
    role: RoleEnum
}