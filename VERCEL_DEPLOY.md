# Deploy do CRM System no Vercel

## ✅ Configuração Completa

O projeto já está configurado para deploy no Vercel com as seguintes configurações:

### Arquivos de Configuração

- ✅ [`vercel.json`](file:///c:/Users/Alex/.gemini/antigravity/crm-system/vercel.json) - Configuração do Vercel
- ✅ [`package.json`](file:///c:/Users/Alex/.gemini/antigravity/crm-system/package.json) - Scripts de build
- ✅ [`vite.config.ts`](file:///c:/Users/Alex/.gemini/antigravity/crm-system/vite.config.ts) - Configuração do Vite

## 🚀 Como Fazer o Deploy

### 1. Instalar Vercel CLI (Opcional)

```bash
npm i -g vercel
```

### 2. Deploy via Dashboard Vercel (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta
3. Clique em **"Add New Project"**
4. Importe o repositório Git do projeto
5. Configure as variáveis de ambiente (veja abaixo)
6. Clique em **"Deploy"**

### 3. Deploy via CLI

```bash
# No diretório do projeto
vercel

# Para produção
vercel --prod
```

## 🔐 Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no painel do Vercel:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | `https://seu-projeto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase | `eyJhbGc...` |

### Como Adicionar no Vercel:

1. No dashboard do projeto, vá em **Settings** → **Environment Variables**
2. Adicione cada variável com seu valor
3. Selecione os ambientes: **Production**, **Preview**, **Development**
4. Clique em **Save**

## 📋 Configuração do vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### O que cada configuração faz:

- **buildCommand**: Comando para compilar o projeto
- **outputDirectory**: Pasta com os arquivos compilados
- **framework**: Framework detectado (Vite)
- **rewrites**: Redireciona todas as rotas para `index.html` (necessário para React Router)

## ✨ Recursos Automáticos do Vercel

- ✅ Deploy automático a cada push no Git
- ✅ Preview deployments para Pull Requests
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Rollback instantâneo
- ✅ Analytics e logs

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ Aplicação carrega corretamente
2. ✅ Rotas funcionam (navegação entre páginas)
3. ✅ Conexão com Supabase está funcionando
4. ✅ Login/autenticação funciona
5. ✅ Dados são carregados corretamente

## 🐛 Troubleshooting

### Erro 404 nas rotas

Se você receber erro 404 ao navegar para rotas específicas, verifique se o `vercel.json` contém a configuração de `rewrites`.

### Variáveis de ambiente não funcionam

- Certifique-se de que as variáveis começam com `VITE_`
- Faça um novo deploy após adicionar variáveis de ambiente
- Verifique se as variáveis estão configuradas para o ambiente correto (Production/Preview)

### Build falha

Execute localmente para verificar erros:

```bash
npm run build
```

## 📚 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Guia Vite + Vercel](https://vercel.com/docs/frameworks/vite)
- [Configuração de Variáveis de Ambiente](https://vercel.com/docs/concepts/projects/environment-variables)
