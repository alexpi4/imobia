# Menu Adjustment Plan

## Goal
Ensure that the sidebar menu strictly follows the permissions saved in the `liberacao` table, as managed by the `PapeisPermissoesPage`.

## Analysis
-   `AppSidebar.tsx` uses `hasAccess(id)` for every item.
-   `useMenuPermissions.ts` implements `hasAccess`:
    1.  **Admin Override**: Admins see everything.
    2.  **Subscription Check**: Suspended plans restrict access.
    3.  **Module Check**: Checks if the plan includes the necessary module.
    4.  **ACL Check**: Checks if the user has the specific menu permission in `liberacao`.

## Discrepancy Check
I need to ensure that the IDs used in `AppSidebar.tsx` match exactly the IDs used in `PapeisPermissoesPage.tsx` (which writes to `liberacao`).

**AppSidebar IDs:**
-   `dashboard`
-   `analise-cl`
-   `performance`
-   `pipeline`
-   `leads`
-   `funil-vendas`
-   `gestao-escalas` (Group) -> `planejar-plantao`, `notifica-plantao`
-   `agendamento-visitas` (Group) -> `agendar-visita`
-   `distribuicao-lead-group` (Group) -> `dashboard-roleta`, `distribuir-lead`, `historico-distribuicao`
-   `cadastros-cidades`, `cadastros-time-vendas`, etc.
-   `integracoes-api` (Group) -> `admin-webhooks`, `admin-google-calendar`, `cadastros-integracoes`
-   `seguranca-acessos` (Group) -> `admin-usuarios`, `admin-papeis-permissoes`, `admin-logs-auditoria`
-   `configuracoes-sistema` (Group) -> `admin-personalizacao`, `admin-white-label`, `admin-notificacoes`, `admin-plans`, `admin-modules`, `config-subscription`

**PapeisPermissoesPage IDs (Current):**
-   `dashboard`, `leads`, `pipeline`, `funil-vendas`, `analise-cl`, `performance`, `chat`, `calendario`, `tarefas`, `contatos`, `imoveis`, `automacoes`, `integracoes`, `webhooks`, `equipe`, `configuracoes`

**Problem:**
There is a mismatch in IDs. For example, `AppSidebar` uses `cadastros-cidades` but `PapeisPermissoesPage` doesn't have a granular permission for it, or uses a generic one.
The user wants "respective options to appear according to saved choices". This means I need to align the IDs in `PapeisPermissoesPage` to cover all the specific menu items or groups in `AppSidebar`.

## Proposed Changes
1.  **Update `PapeisPermissoesPage.tsx`**:
    -   Expand `AVAILABLE_MENUS` to include all specific IDs used in `AppSidebar`.
    -   Group them logically in the UI if possible, or just list them all.
2.  **Update `useMenuPermissions.ts`**:
    -   Ensure `hasAccess` returns `false` if the ID is not in `liberacao` (unless Admin).
    -   The current logic `return Array.isArray(allowedMenus) && allowedMenus.includes(menuId);` is correct for this, assuming `allowedMenus` contains the exact ID.

## Detailed Menu List for `PapeisPermissoesPage`
I will update `AVAILABLE_MENUS` to match `AppSidebar` structure more closely.

-   **Dashboard**: `dashboard`
-   **CRM**: `leads`, `pipeline`, `funil-vendas`, `analise-cl`, `performance`
-   **Operacional**: `gestao-escalas`, `agendamento-visitas`, `distribuicao-lead-group` (controlling groups) OR specific items like `planejar-plantao`.
    -   *Decision*: I will use the **Group IDs** for broader control, and specific IDs for critical items if needed. For now, let's map the key items.

**Revised `AVAILABLE_MENUS`:**
-   `dashboard`
-   `analise-cl`
-   `performance`
-   `pipeline`
-   `leads`
-   `funil-vendas`
-   `gestao-escalas`
-   `agendamento-visitas`
-   `distribuicao-lead-group`
-   `cadastros-cidades`
-   `cadastros-time-vendas`
-   `cadastros-unidades`
-   `cadastros-intencoes`
-   `cadastros-origens`
-   `cadastros-turnos`
-   `cadastros-pipelines`
-   `cadastros-automacoes`
-   `integracoes-api`
-   `seguranca-acessos`
-   `configuracoes-sistema`

I will update `PapeisPermissoesPage.tsx` to include these.

## Verification
1.  Open `PapeisPermissoesPage`.
2.  Select a user.
3.  Toggle `cadastros-cidades` OFF.
4.  Login as that user.
5.  Verify "Cidades" menu is gone.
