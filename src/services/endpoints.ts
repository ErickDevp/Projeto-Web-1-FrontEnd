export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    // No backend atual não existe /auth/me. Se você criar, pode habilitar aqui.
    // me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  usuario: {
    base: '/usuario',
    me: '/usuario/me',
  },
  notificacao: {
    base: '/notificacao',
    create: '/notificacao/criar',
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
  statusMovimentacao: {
    base: '/status',
    create: '/status/criar',
  },
  saldoUsuarioPrograma: {
    base: '/saldo',
  },
}
