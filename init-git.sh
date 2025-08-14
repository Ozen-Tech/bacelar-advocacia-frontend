#!/bin/bash

# Script para inicializar Git e fazer primeiro commit do frontend

echo "🚀 Inicializando repositório Git para o frontend..."

# Verificar se já existe um repositório Git
if [ -d ".git" ]; then
    echo "⚠️  Repositório Git já existe!"
    echo "Para reinicializar, execute: rm -rf .git && ./init-git.sh"
    exit 1
fi

# Inicializar Git
git init
echo "✅ Git inicializado"

# Criar .gitignore se não existir
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Build outputs
dist/
build/
.vite/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# ESLint cache
.eslintcache

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/
EOF
    echo "✅ .gitignore criado"
fi

# Adicionar todos os arquivos
git add .
echo "✅ Arquivos adicionados ao staging"

# Fazer primeiro commit
git commit -m "Initial commit - Bacelar Advocacia Frontend

- React 18 + TypeScript application
- Vite build tool for fast development
- Tailwind CSS for modern styling
- React Router for navigation
- Axios for API communication
- Recharts for data visualization
- Lucide React for icons
- Responsive design with mobile-first approach
- Authentication and authorization
- Dashboard with statistics
- Deadline management system
- User management (admin)
- Real-time notifications
- File upload functionality
- Excel import capabilities
- Vercel deployment ready"

echo "✅ Primeiro commit realizado"

echo ""
echo "🎉 Repositório Git inicializado com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Crie um repositório no GitHub"
echo "2. Execute os comandos:"
echo "   git remote add origin https://github.com/SEU_USUARIO/bacelar-advocacia-frontend.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Depois faça o deploy na Vercel seguindo as instruções em deploy-vercel.md"
echo ""