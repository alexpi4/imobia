# Implementação de Webhooks Fixos do Sistema

## Objetivo

Adicionar uma seção superior na `WebhooksPage` contendo 10 webhooks fixos do sistema que não podem ser excluídos, mas podem ser editados. Estes webhooks são identificados pelo campo `fix = TRUE` no banco de dados.

## User Review Required

> [!IMPORTANT]
> **Alteração no Banco de Dados**: Esta implementação requer a execução de migrations no Supabase que adicionarão uma nova coluna `fix` à tabela `webhooks` e inserirão 10 webhooks fixos do sistema. Certifique-se de que você tem acesso ao Supabase para aplicar estas migrations.

> [!WARNING]
> **Webhooks Fixos Não Podem Ser Excluídos**: Uma vez criados, os webhooks fixos do sistema não poderão ser excluídos através da interface. Apenas a URL, secret e status ativo podem ser editados.

## Alterações Propostas

### Database Migrations

#### [NEW] [20251129_add_webhooks_fix_column.sql](file:///c:/Users/Alex/imobia/imobia/supabase/migrations/20251129_add_webhooks_fix_column.sql)

Migration para adicionar a coluna `fix` à tabela `webhooks`:
- Adicionar coluna `fix BOOLEAN DEFAULT FALSE`
- Criar índice `idx_webhooks_fix` para melhor performance
- Atualizar RLS policy para prevenir exclusão de webhooks com `fix = TRUE`

#### [NEW] [20251129_seed_fixed_webhooks.sql](file:///c:/Users/Alex/imobia/imobia/supabase/migrations/20251129_seed_fixed_webhooks.sql)

Seed para inserir os 10 webhooks fixos do sistema:
1. Atualiza AGENTE - `https://wk8.dudaimoveis.com.br/webhook/atu-agente`
2. Recebe LEAD - `https://wk8.dudaimoveis.com.br/webhook/rd-lead`
3. Envia RAG - `https://wk8.dudaimoveis.com.br/webhook/cria-rag`
4. Exclui RAG - `https://wk8.dudaimoveis.com.br/webhook/exc-rag`
5. Envia FAQ - `https://wk8.dudaimoveis.com.br/webhook/cria-faq`
6. Exclui FAQ - `https://wk8.dudaimoveis.com.br/webhook/exc-faq`
7. Cria INSTANCIA - `https://wk8.dudaimoveis.com.br/webhook/cria-inst`
8. Exclui INSTANCIA - `https://wk8.dudaimoveis.com.br/webhook/exc-inst`
9. Gera QR - `https://wk8.dudaimoveis.com.br/webhook/QR`
10. Renova QR - `https://wk8.dudaimoveis.com.br/webhook/refreshQR`

Todos com `fix = TRUE`, `tipo = 'manual'`, `ativo = TRUE`, `eventos = []`

---

### TypeScript Types

#### [MODIFY] [index.ts](file:///c:/Users/Alex/imobia/imobia/src/types/index.ts)

Atualizar a interface `Webhook` para incluir o campo `fix`:
```typescript
export interface Webhook {
    id: number;
    nome: string;
    url: string;
    tipo: 'manual' | 'automatico';
    secret?: string;
    eventos: string[];
    ativo: boolean;
    fix?: boolean; // NOVO CAMPO
    ultima_execucao?: string;
    total_execucoes: number;
    created_at: string;
    updated_at: string;
}
```

---

### Hooks & API Layer

#### [MODIFY] [useWebhooks.ts](file:///c:/Users/Alex/imobia/imobia/src/hooks/useWebhooks.ts)

Modificações:
- Adicionar query separada para buscar webhooks fixos (`fix = TRUE`)
- Modificar query principal para buscar apenas webhooks customizados (`fix = FALSE OR fix IS NULL`)
- Adicionar validação no `deleteMutation` para verificar se `webhook.fix = TRUE` e bloquear exclusão
- Retornar ambas as listas: `fixedWebhooks` e `customWebhooks`

---

### Components

#### [NEW] [FixedWebhookCard.tsx](file:///c:/Users/Alex/imobia/imobia/src/components/admin/FixedWebhookCard.tsx)

Novo componente para exibir webhooks fixos em formato de card:
- Layout: Card com informações do webhook
- Campos exibidos: nome, URL (truncada), status badge
- Botões: "Test Connection" e "Atualizar"
- **Não exibir** botão de exclusão
- Estilo consistente com shadcn/ui e design do sistema

#### [MODIFY] [WebhookDialog.tsx](file:///c:/Users/Alex/imobia/imobia/src/components/admin/WebhookDialog.tsx)

Adicionar suporte para webhooks fixos:
- Adicionar prop `isFixed?: boolean`
- Quando `isFixed = true`:
  - Desabilitar edição do campo `nome`
  - Desabilitar edição do campo `tipo`
  - Permitir apenas edição de `url`, `secret` e `ativo`
  - Atualizar título do dialog para "Atualizar Webhook do Sistema"

---

### Page Updates

#### [MODIFY] [WebhooksPage.tsx](file:///c:/Users/Alex/imobia/imobia/src/pages/admin/WebhooksPage.tsx)

Reestruturar a página para incluir duas seções:

**Seção Superior - WebHooks do Sistema:**
- Título: "WebHooks do Sistema"
- Grid com 3 colunas (responsivo)
- Renderizar `FixedWebhookCard` para cada webhook fixo
- Total de 10 cards

**Divisor Visual:**
- Linha separadora ou espaçamento

**Seção Inferior - WebHooks para Integração:**
- Título: "WebHooks para Integração"
- Manter tabela existente
- Exibir apenas webhooks customizados (`fix = FALSE`)
- Manter funcionalidade de busca (aplicada apenas aos customizados)
- Manter botão "Novo Webhook"

---

## Regras de Negócio

### Webhooks Fixos (`fix = TRUE`)
- ✅ Podem ser editados (URL, secret, ativo)
- ✅ Podem ter conexão testada
- ❌ **Não podem ser excluídos**
- ❌ Não podem ter nome alterado
- ❌ Não podem ter tipo alterado (sempre `manual`)
- ❌ Não aparecem na tabela de webhooks customizados

### Webhooks Customizados (`fix = FALSE`)
- ✅ CRUD completo (criar, editar, excluir)
- ✅ Aparecem apenas na tabela inferior
- ✅ Filtráveis por busca
- ✅ Não aparecem na seção de webhooks fixos

### Backend Validation
- DELETE em webhook com `fix = TRUE` deve retornar erro
- Mensagem de erro: "Webhooks do sistema não podem ser excluídos"

---

## Plano de Verificação

### Manual Verification

**1. Aplicar Migrations no Supabase:**
```bash
# Conectar ao Supabase e executar as migrations:
# 1. 20251129_add_webhooks_fix_column.sql
# 2. 20251129_seed_fixed_webhooks.sql

# Verificar no Supabase SQL Editor:
SELECT * FROM webhooks WHERE fix = TRUE;
# Deve retornar 10 webhooks fixos
```

**2. Verificar Exibição dos Webhooks Fixos:**
- Acessar `http://localhost:8080/admin/webhooks`
- Verificar que a seção "WebHooks do Sistema" aparece no topo da página
- Confirmar que 10 cards são exibidos em grid de 3 colunas
- Verificar que cada card mostra:
  - Nome do webhook
  - URL (truncada se muito longa)
  - Badge de status (verde se ativo)
  - Botão "Test Connection"
  - Botão "Atualizar"
  - **Sem** botão de exclusão

**3. Testar Edição de Webhook Fixo:**
- Clicar no botão "Atualizar" em qualquer webhook fixo
- Verificar que o modal abre com dados pré-preenchidos
- Verificar que os campos `nome` e `tipo` estão desabilitados (não editáveis)
- Alterar a URL para um valor diferente
- Clicar em "Salvar"
- Verificar toast de sucesso
- Recarregar a página e confirmar que a URL foi atualizada

**4. Testar Impossibilidade de Exclusão:**
- Verificar visualmente que não há botão "Excluir" nos cards de webhooks fixos
- (Opcional) Tentar fazer DELETE direto via Supabase e verificar que a RLS policy bloqueia

**5. Verificar Webhooks Customizados (Regressão):**
- Rolar para baixo até a seção "WebHooks para Integração"
- Verificar que a tabela existente funciona normalmente
- Clicar em "Novo Webhook" e criar um webhook customizado
- Verificar que o novo webhook aparece apenas na tabela inferior
- Editar o webhook customizado criado
- Excluir o webhook customizado criado
- Verificar que a busca filtra apenas webhooks customizados (não afeta os fixos)

**6. Verificar Responsividade:**
- Redimensionar a janela do navegador
- Verificar que o grid de cards adapta de 3 colunas para 2 ou 1 em telas menores
- Verificar que a tabela de webhooks customizados permanece responsiva

**7. Verificar Test Connection (se implementado):**
- Clicar no botão "Test Connection" em um webhook fixo
- Verificar que uma requisição é feita ao endpoint
- Verificar feedback visual (toast ou indicador de sucesso/erro)

---

## Notas de Implementação

- Manter design consistente com a imagem de referência fornecida pelo usuário
- Usar componentes shadcn/ui existentes para manter consistência visual
- Garantir que todas as strings estão em português brasileiro
- Implementar loading states apropriados durante operações assíncronas
- Adicionar toasts de sucesso/erro para feedback ao usuário
- Seguir padrões de código existentes no projeto
