<div align="center">

<h1>✈️ Gerenciador de Pontos e Milhas — Front-end</h1>

<p>Interface web para gerenciamento de pontos e milhas, desenvolvida com <strong>React + TypeScript + Tailwind CSS</strong>.</p>

<p>
  <a href="https://gerenciador-de-milhas.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀 Deploy-Vercel-black?style=for-the-badge" alt="Deploy" />
  </a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

<p>
  <a href="https://github.com/ErickDevp/Projeto-Web-1">⚙️ Repositório Back-end (Spring Boot)</a> •
  <a href="https://gerenciador-de-milhas.vercel.app/">🌐 Demo ao vivo</a>
</p>

</div>

---

## 📋 Sobre o Projeto

O **Gerenciador de Pontos e Milhas** é uma aplicação web fullstack que permite aos usuários controlar seus programas de fidelidade, cartões de crédito, movimentações de pontos e relatórios — tudo em um único painel. Este repositório contém o **front-end** da aplicação.

---

## 🚀 Funcionalidades

- 🔐 **Autenticação completa** — login, cadastro, recuperação e reset de senha
- 🏦 **Gestão de cartões** — cadastro com bandeira (Visa, Mastercard, Elo, Amex, Hipercard), tipo e preview visual do cartão
- 🎯 **Programas de fidelidade** — gerenciamento de programas como Livelo, Latam Pass e Esfera
- 💳 **Movimentações de pontos** — registro com status (`PENDENTE`, `CREDITADO`, `CANCELADO`) e upload de comprovante
- 📊 **Dashboard analítico** — gráficos de pontos por cartão, por programa e por mês
- 📈 **Relatórios** — exportação em CSV e PDF
- 🔔 **Notificações** — alertas de expiração de milhas e promoções
- 🎨 **Personalização** — tema claro/escuro e preferências de aparência
- 📱 **Responsivo** — layout adaptado para mobile com sidebar recolhível

---

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia |
|---|---|
| Framework UI | React 19 |
| Linguagem | TypeScript 5.9 |
| Estilização | Tailwind CSS 3.4 |
| Build | Vite 7 |
| Roteamento | React Router DOM 7 |
| HTTP Client | Axios |
| Notificações | React Toastify |
| Deploy | Vercel |

---

## 📁 Estrutura do Projeto

```
src/
├── assets/
│   └── brands/
│       ├── bandeiras/       # SVGs das bandeiras (Visa, Master, Elo...)
│       └── programas/       # SVGs dos programas (Livelo, Latam, Esfera...)
├── components/
│   ├── auth/                # UI de autenticação
│   ├── dashboard/
│   │   ├── cartoes/         # Lista, formulário e preview de cartões
│   │   ├── config/          # Configurações de aparência, segurança e notificações
│   │   ├── dashboard/       # Cards, gráficos e estatísticas do dashboard
│   │   ├── movimentacoes/   # Tabela e stats de movimentações
│   │   ├── programas/       # Cards e formulários de programas
│   │   └── relatorios/      # Gráficos e histórico de relatórios
│   ├── home/                # Landing page
│   ├── layouts/             # Layout de autenticação
│   ├── sidebar/             # Navegação lateral
│   ├── topbar/              # Barra superior
│   └── ui/                  # Componentes reutilizáveis (Modal, Input, Badge...)
├── config/                  # Configuração de variáveis de ambiente
├── constants/               # Constantes de navegação
├── context/
│   └── auth/                # Context API de autenticação (JWT)
├── hooks/                   # Custom hooks (useAuth, useCartoes, useDashboard...)
├── interfaces/              # Tipagens TypeScript de todas as entidades
├── pages/
│   ├── Dashboard/           # Cartoes, Programas, Movimentacoes, Relatorios...
│   ├── ForgotPassword/
│   ├── Home/
│   ├── Legal/               # Termos e Política de Privacidade
│   ├── Login/
│   ├── Register/
│   └── ResetPassword/
├── routes/                  # Rotas protegidas e públicas
├── services/                # Camada de integração com a API
│   ├── auth/
│   ├── cartaoUsuario/
│   ├── comprovante/
│   ├── movimentacaoPontos/
│   ├── notificacao/
│   ├── programaFidelidade/
│   ├── promocao/
│   ├── relatorio/
│   ├── saldoUsuarioPrograma/
│   └── usuario/
├── styles/                  # Tokens CSS e estilos base
└── utils/                   # Formatação, validação, helpers de marcas e status
```

---

## ⚙️ Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Back-end rodando localmente ou em produção

---

## 🔧 Configuração e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/ErickDevp/Projeto-Web-1-FrontEnd.git
cd Projeto-Web-1-FrontEnd
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha:

```bash
cp .env.example .env
```

```env
# URL base do back-end (Spring Boot)
VITE_API_BASE_URL=http://localhost:8080

# Habilitar envio de cookies (false para JWT no header)
VITE_API_WITH_CREDENTIALS=false

# Timeout padrão de requests (ms)
VITE_API_TIMEOUT_MS=10000
```

### 4. Execute o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

---

## 📦 Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Pré-visualiza o build de produção |
| `npm run lint` | Executa o ESLint no projeto |

---

## 🗂️ Páginas da Aplicação

| Rota | Página | Descrição |
|---|---|---|
| `/` | Home | Landing page da aplicação |
| `/login` | Login | Autenticação do usuário |
| `/register` | Cadastro | Criação de nova conta |
| `/forgot-password` | Recuperar Senha | Solicitação de reset |
| `/reset-password` | Resetar Senha | Definição de nova senha |
| `/dashboard` | Dashboard | Visão geral com gráficos e estatísticas |
| `/dashboard/cartoes` | Cartões | Gerenciamento de cartões de crédito |
| `/dashboard/programas` | Programas | Programas de fidelidade cadastrados |
| `/dashboard/movimentacoes` | Movimentações | Histórico de pontos |
| `/dashboard/registrar-pontos` | Registrar Pontos | Lançamento de movimentação |
| `/dashboard/relatorios` | Relatórios | Exportação e análise de dados |
| `/dashboard/promocoes` | Promoções | Promoções disponíveis |
| `/dashboard/notificacoes` | Notificações | Alertas e avisos |
| `/dashboard/perfil` | Perfil | Dados e foto do usuário |
| `/dashboard/configuracoes` | Configurações | Aparência, segurança e preferências |

---

## 🔗 Repositório Relacionado

| Projeto | Tecnologia | Link |
|---|---|---|
| ⚙️ Back-end | Java + Spring Boot | [Projeto-Web-1](https://github.com/ErickDevp/Projeto-Web-1) |

---

<div align="center">
  Feito com ⚛️ React, 💙 TypeScript e 🎨 Tailwind CSS
</div>
