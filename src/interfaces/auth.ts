// Espelha o UsuarioLoginDTO
export interface LoginDTO {
    email: string;
    senha: string;
}

// Alias com o nome exato do backend
export type UsuarioLoginDTO = LoginDTO;

// Espelha o UsuarioDTO do backend
export interface UsuarioDTO {
    id: number;
    nome: string;
    email: string;
    senha: string;
    role?: 'ADMIN' | 'USER';
}

// Espelha o UsuarioDTO (usado no cadastro)
export interface RegisterDTO {
    nome: string;
    email: string;
    senha: string;
}

// Espelha o EsqueciSenhaDTO
export interface ForgotPasswordDTO {
    email: string;
}

// Alias com o nome exato do backend
export type EsqueciSenhaDTO = ForgotPasswordDTO;

// Espelha o RedefinirSenhaDTO
export interface ResetPasswordDTO {
    token: string;
    novaSenha: string;
}

// Alias com o nome exato do backend
export type RedefinirSenhaDTO = ResetPasswordDTO;

// Resposta do servidor
export interface AuthResponse {
    token: string;
}

export interface ForgotPasswordResponse {
    message: string;
    reset_token: string;
}