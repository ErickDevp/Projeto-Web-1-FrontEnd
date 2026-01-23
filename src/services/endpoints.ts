export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  usuario: {
  base: '/usuario',
  me: '/usuario/me',
  foto: '/usuario/foto',
  fotoPerfil: '/usuario/foto-perfil',
  },
  notificacao: {
    base: '/notificacao',
    create: '/notificacao/criar',
    publicas: '/notificacao/publicas',
  },
  promocao: {
    base: '/promocao',
    create: '/promocao/criar',
  },
  programaFidelidade: {
    base: '/programa',
    create: '/programa/criar',
  },
  cartaoUsuario: {
    base: '/cartao',
    create: '/cartao/criar',
  },
  comprovante: {
    base: '/comprovante',
    create: '/comprovante/criar',
    arquivo: (id: string | number) => `/comprovante/${id}/arquivo`,
  },
  movimentacaoPontos: {
    base: '/movimentacao',
    create: '/movimentacao/criar',
  },
  relatorio: {
    base: '/relatorios',
    csv: '/relatorios/csv',
    pdf: '/relatorios/pdf',
  },
  saldoUsuarioPrograma: {
    base: '/saldo',
  },
}
