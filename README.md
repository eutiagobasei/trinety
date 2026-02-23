# Trinety - Plataforma de Planejamento Estratégico

Sistema de planejamento estratégico empresarial com geração assistida por IA.

## Stack Tecnológica

### Frontend
- **React 18** + TypeScript
- **Vite** (bundler)
- **TailwindCSS** + shadcn/ui
- **React Query** (gerenciamento de estado)
- **React Router** (navegação)

### Backend
- **NestJS** (Node.js)
- **TypeORM** (ORM)
- **PostgreSQL** (banco de dados)
- **JWT** (autenticação)
- **OpenAI GPT-4** (geração de conteúdo)

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Chave de API da OpenAI

## Configuração Inicial

### 1. Clonar o repositório

```bash
git clone https://github.com/eutiagobasei/trinety.git
cd trinety
```

### 2. Configurar variáveis de ambiente

**Backend** (`backend/.env`):
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=trinety
DB_PASSWORD=trinety
DB_DATABASE=trinety

JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=sua-chave-openai-aqui
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Iniciar o ambiente de desenvolvimento

**Opção 1: Script automatizado**
```bash
./scripts/start-dev.sh
```

**Opção 2: Manualmente**

```bash
# Terminal 1 - Iniciar PostgreSQL
docker-compose up -d postgres

# Terminal 2 - Iniciar backend
cd backend
npm install
npm run dev

# Terminal 3 - Iniciar frontend
npm install
npm run dev
```

### 4. Acessar a aplicação

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432 (usuário: trinety, senha: trinety)

## Estrutura do Projeto

```
trinety/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticação JWT
│   │   ├── users/          # Gerenciamento de usuários
│   │   ├── organizations/  # Multi-tenancy
│   │   ├── diagnostic/     # Diagnóstico empresarial
│   │   ├── strategic-planning/  # Planejamento estratégico
│   │   └── database/
│   │       └── entities/   # Entidades TypeORM
│   └── package.json
├── src/                     # Frontend React
│   ├── components/         # Componentes React
│   ├── contexts/           # Context API
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários
│   └── pages/              # Páginas da aplicação
├── docker-compose.yml      # Orquestração de containers
└── package.json
```

## Funcionalidades

### Autenticação e Multi-tenancy
- Cadastro e login de usuários
- Múltiplas organizações por usuário
- Controle de acesso baseado em papéis (admin, gestor, usuário)

### Diagnóstico Empresarial
- 27 perguntas organizadas em 10 blocos
- Salva respostas automaticamente
- Base para geração do plano estratégico

### Planejamento Estratégico (gerado por IA)
- Business Model Canvas
- Mapa de Empatia
- Análise SWOT
- Filosofia (Missão, Visão, Valores)
- OKRs
- Indicadores/KPIs
- Plano de Ação
- Rotinas de Gestão

## API Endpoints

### Autenticação
- `POST /api/auth/signup` - Cadastro
- `POST /api/auth/signin` - Login
- `GET /api/auth/profile` - Perfil do usuário
- `POST /api/auth/switch-organization` - Trocar organização

### Organizações
- `POST /api/organizations` - Criar organização
- `GET /api/organizations/:id/members` - Listar membros
- `POST /api/organizations/:id/members` - Adicionar membro

### Diagnóstico
- `GET /api/organizations/:orgId/diagnostic` - Obter diagnóstico
- `POST /api/organizations/:orgId/diagnostic/answers` - Salvar resposta
- `POST /api/organizations/:orgId/diagnostic/complete` - Concluir

### Planejamento Estratégico
- `POST /api/organizations/:orgId/strategic-planning/generate` - Gerar plano
- `GET /api/organizations/:orgId/strategic-planning/canvas` - Business Canvas
- `GET /api/organizations/:orgId/strategic-planning/swot` - SWOT
- ... (demais endpoints)

## Scripts Disponíveis

### Frontend
```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```

### Backend
```bash
npm run dev      # Desenvolvimento com hot-reload
npm run build    # Compilar TypeScript
npm run start    # Iniciar em produção
```

## Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Apenas banco de dados
docker-compose up -d postgres
```

## Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Proprietário - Todos os direitos reservados.
