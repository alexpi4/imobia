# Configuração de Variáveis de Ambiente no Vercel

## Problema Identificado

O build no Vercel está funcionando corretamente, mas a aplicação não consegue carregar dados do Supabase porque as **variáveis de ambiente não estão configuradas** no Vercel.

## Variáveis Necessárias

A aplicação precisa de **2 variáveis de ambiente** para se conectar ao Supabase:

| Variável | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://kmizyovulasavwaalemq.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttaXp5b3Z1bGFzYXZ3YWFsZW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MDM5MTksImV4cCI6MjA3OTE3OTkxOX0.32g4uRchbuEdS-b3FQMpj-pxXQo_CHljL5wo4UDeLnc` |

## Passo a Passo para Configurar

### 1. Acessar o Dashboard do Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto **imobia**

### 2. Navegar até as Configurações

1. Clique na aba **"Settings"** (Configurações)
2. No menu lateral esquerdo, clique em **"Environment Variables"** (Variáveis de Ambiente)

### 3. Adicionar as Variáveis

Para cada variável, faça o seguinte:

#### Variável 1: VITE_SUPABASE_URL

1. No campo **"Key"** (Nome), digite: `VITE_SUPABASE_URL`
2. No campo **"Value"** (Valor), cole: `https://kmizyovulasavwaalemq.supabase.co`
3. Em **"Environment"** (Ambiente), selecione:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Clique em **"Save"** (Salvar)

#### Variável 2: VITE_SUPABASE_ANON_KEY

1. No campo **"Key"** (Nome), digite: `VITE_SUPABASE_ANON_KEY`
2. No campo **"Value"** (Valor), cole: 
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttaXp5b3Z1bGFzYXZ3YWFsZW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MDM5MTksImV4cCI6MjA3OTE3OTkxOX0.32g4uRchbuEdS-b3FQMpj-pxXQo_CHljL5wo4UDeLnc
   ```
3. Em **"Environment"** (Ambiente), selecione:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Clique em **"Save"** (Salvar)

### 4. Forçar um Novo Deploy

Após adicionar as variáveis, você precisa fazer um novo deploy para que elas sejam aplicadas:

**Opção A: Redeploy pelo Dashboard**
1. Vá para a aba **"Deployments"**
2. Encontre o último deployment
3. Clique nos três pontos (**...**) ao lado dele
4. Selecione **"Redeploy"**
5. Confirme clicando em **"Redeploy"** novamente

**Opção B: Novo Commit (Recomendado)**
1. Faça uma pequena alteração no código (pode ser um comentário)
2. Faça commit e push:
   ```bash
   git add .
   git commit -m "trigger redeploy with env vars"
   git push origin main
   ```

### 5. Verificar o Deploy

1. Aguarde o deploy completar (geralmente 1-3 minutos)
2. Acesse a URL do seu projeto no Vercel
3. Teste o login e a página de White Label

## Como Verificar se Funcionou

Após o deploy:

1. **Abra o Console do Navegador** (F12)
2. Vá para a aba **"Console"**
3. Se você ver o erro `Missing Supabase environment variables`, as variáveis ainda não foram aplicadas
4. Se **não** houver esse erro, as variáveis foram configuradas corretamente

## Troubleshooting

### As variáveis foram adicionadas mas ainda não funcionam

- Certifique-se de que fez um **novo deploy** após adicionar as variáveis
- Limpe o cache do navegador (Ctrl + Shift + R)
- Verifique se não há erros de digitação nos nomes das variáveis (são case-sensitive)

### O deploy falha após adicionar as variáveis

- Verifique se copiou os valores completos (especialmente a ANON_KEY que é muito longa)
- Certifique-se de que não há espaços extras no início ou fim dos valores

## Segurança

> [!IMPORTANT]
> A `VITE_SUPABASE_ANON_KEY` é uma chave **pública** e pode ser exposta no frontend. Ela é protegida pelas políticas RLS (Row Level Security) do Supabase, que garantem que apenas usuários autenticados possam acessar dados sensíveis.

> [!WARNING]
> **NUNCA** adicione a `SUPABASE_SERVICE_ROLE_KEY` como variável de ambiente no Vercel para aplicações frontend, pois ela bypassa todas as políticas de segurança RLS.
