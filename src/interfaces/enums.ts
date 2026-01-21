// Espelha os enums do backend (br.edu.ifs.academico.entity.enums.*)

// Status de movimentações
export type StatusMovimentacaoEnum = 'PENDENTE' | 'CREDITADO' | 'CANCELADO'

// Bandeiras de cartão de crédito/débito
export type BandeiraEnum = 'VISA' | 'MASTERCARD' | 'ELO' | 'AMERICAN_EXPRESS' | 'HIPERCARD'

// Roles de usuário
export type RoleEnum = 'ADMIN' | 'USER'

// Tipo do cartão
export type TipoCartaoEnum = 'CREDITO' | 'DEBITO'

// Status de validade de cartões e promoções
export type ValidoEnum = 'ATIVO' | 'VENCIDO'
