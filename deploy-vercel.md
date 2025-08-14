# Deploy do Frontend na Vercel

## Pré-requisitos
1. Conta na [Vercel](https://vercel.com)
2. Repositório GitHub com o código do frontend
3. Backend API já deployado no Render

## Passos para Deploy

### 1. Criar Repositório GitHub
```bash
# No diretório do frontend
cd /Users/ozen/bacelar-advocacia-frontend

# Inicializar git (se ainda não foi feito)
git init
git add .
git commit -m "Initial commit - Frontend React"

# Adicionar repositório remoto (substitua pela sua URL)
git remote add origin https://github.com/SEU_USUARIO/bacelar-advocacia-frontend.git
git branch -M main
git push -u origin main
```

### 2. Deploy na Vercel

#### Opção 1: Via Dashboard
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe seu repositório GitHub
4. Configure as seguintes opções:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (padrão)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `dist` (padrão)

#### Opção 2: Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Configurar Variáveis de Ambiente
Na Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://bacelar-api.onrender.com
```

**Importante**: Substitua `bacelar-api.onrender.com` pela URL real da sua API no Render.

### 4. Configurar Domínio (Opcional)
1. Na Vercel Dashboard → Settings → Domains
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

### 5. Verificar Deploy
Após o deploy, seu frontend estará disponível em:
```
https://seu-projeto.vercel.app
```

## Configurações Automáticas

### vercel.json
O arquivo já está configurado para:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Build Otimizado
- Minificação automática
- Tree shaking
- Code splitting
- Compressão gzip
- CDN global

## Comandos Úteis

### Deploy local
```bash
# Build local
npm run build

# Preview do build
npm run preview
```

### Vercel CLI
```bash
# Deploy de desenvolvimento
vercel

# Deploy de produção
vercel --prod

# Ver logs
vercel logs

# Ver informações do projeto
vercel inspect
```

## Troubleshooting

### Erro 404 em rotas
- Verifique se o `vercel.json` está configurado
- Confirme se as rotas do React Router estão corretas

### Erro de API
- Verifique se a `VITE_API_BASE_URL` está correta
- Confirme se o backend está funcionando
- Verifique CORS no backend

### Erro de build
- Execute `npm run build` localmente
- Verifique erros de TypeScript
- Confirme se todas as dependências estão instaladas

### Variáveis de ambiente não funcionam
- Certifique-se de usar o prefixo `VITE_`
- Redeploy após alterar variáveis
- Verifique se estão configuradas na Vercel

## Integração Backend + Frontend

### 1. Configurar CORS no Backend
O backend já está configurado para aceitar requisições do frontend.

### 2. Atualizar URL do Frontend no Backend
Após o deploy, atualize a variável `FRONTEND_URL` no Render:
```env
FRONTEND_URL=https://seu-projeto.vercel.app
```

### 3. Testar Integração
1. Acesse o frontend deployado
2. Faça login com as credenciais do superusuário
3. Teste as funcionalidades principais
4. Verifique se as notificações funcionam

## Próximos Passos
1. ✅ Deploy do frontend concluído
2. 🔄 Configurar URL do frontend no backend
3. 🔄 Testar integração completa
4. 🔄 Configurar domínio personalizado (opcional)