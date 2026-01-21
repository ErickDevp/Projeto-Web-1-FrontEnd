// =====================
// Auth DTOs
// =====================

// Espelha LoginRequestDTO
export interface LoginRequestDTO {
    email: string
    senha: string
}

// Espelha RegisterRequestDTO
export interface RegisterRequestDTO {
    nome: string
    email: string
    senha: string
}

// Espelha PasswordResetRequestDTO
export interface PasswordResetRequestDTO {
    email: string
}

// Espelha PasswordChangeRequestDTO
export interface PasswordChangeRequestDTO {
    token: string
    novaSenha: string
}

// Espelha AuthResponseDTO
export interface AuthResponseDTO {
    token: string
}

// Espelha PasswordResetResponseDTO
export interface PasswordResetResponseDTO {
    token: string
}

// =====================
// Usuário DTOs
// =====================

// Espelha UsuarioRequestDTO (para atualização)
export interface UsuarioRequestDTO {
    nome: string
    email: string
}

// Espelha UsuarioResponseDTO
export interface UsuarioResponseDTO {
    id: number
    nome: string
    email: string
    criado_em: string
    camionhoFoto?: string
}

// =====================
// Aliases (compatibilidade)
// =====================

// Alias com o nome exato do backend (compatibilidade)
export type LoginDTO = LoginRequestDTO
export type UsuarioLoginDTO = LoginRequestDTO
export type RegisterDTO = RegisterRequestDTO
export type ForgotPasswordDTO = PasswordResetRequestDTO
export type EsqueciSenhaDTO = PasswordResetRequestDTO
export type ResetPasswordDTO = PasswordChangeRequestDTO
export type RedefinirSenhaDTO = PasswordChangeRequestDTO
export type AuthResponse = AuthResponseDTO
export type ForgotPasswordResponse = PasswordResetResponseDTO

// Legacy UsuarioDTO (descontinuado - usar UsuarioResponseDTO)
export interface UsuarioDTO {
    id: number
    nome: string
    email: string
    senha?: string
    role?: 'ADMIN' | 'USER'
}