# Bacelar Advocacia - Frontend

Interface web para o sistema de gestão de prazos do escritório de advocacia.

## 🚀 Deploy na Vercel

### Pré-requisitos
1. Conta na [Vercel](https://vercel.com)
2. Repositório GitHub com o código
3. Backend API já deployado

### Passos para Deploy

#### 1. Configurar Variáveis de Ambiente
Na Vercel Dashboard, configure a seguinte variável:

```env
VITE_API_BASE_URL=https://sua-api.onrender.com
```

#### 2. Deploy Automático
1. Conecte seu repositório GitHub à Vercel
2. A Vercel detectará automaticamente que é um projeto Vite
3. Configure a variável de ambiente
4. Faça o deploy

## 🛠️ Desenvolvimento Local

### Instalação
```bash
# Clone o repositório
git clone <seu-repositorio>
cd bacelar-advocacia-frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com a URL da sua API

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## 📋 Funcionalidades

- ✅ Autenticação de usuários
- ✅ Dashboard com estatísticas
- ✅ Gestão de prazos
- ✅ Gestão de usuários (admin)
- ✅ Notificações em tempo real
- ✅ Upload de anexos
- ✅ Importação de planilhas Excel
- ✅ Interface responsiva
- ✅ Tema moderno com Tailwind CSS

## 🔧 Tecnologias

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Deploy**: Vercel
