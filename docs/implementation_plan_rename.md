# Implementation Plan - Rename AnaliseCL to AnaliseVL

## Goal Description
Rename `AnaliseCLPage` to `AnaliseVLPage`, update the menu title to "Análise V/L", and replace "Compra" with "Venda" in the context of this page and menu permissions.

## User Review Required
> [!IMPORTANT]
> This change involves renaming a core page and updating access control keys. Ensure that existing permissions for `analise-cl` are migrated or understood to be replaced by `analise-vl`.

## Proposed Changes

### Frontend (React)

#### [NEW] Page
*   `src/pages/AnaliseVLPage.tsx`: Created from `AnaliseCLPage.tsx` with "Compra" replaced by "Venda" and "Análise C/L" replaced by "Análise V/L".

#### [DELETE] Page
*   `src/pages/AnaliseCLPage.tsx`: Deleted.

#### [MODIFY] Components & Routing
*   `src/App.tsx`: Update import and route from `/analise-cl` to `/analise-vl`.
*   `src/components/layout/AppSidebar.tsx`: Update menu item title to "Análise V/L", URL to `/analise-vl`, and ID to `analise-vl`.
*   `src/pages/admin/PapeisPermissoesPage.tsx`: Update permission ID to `analise-vl` and label to "Análise V/L".
*   `src/hooks/useMenuPermissions.ts`: Update permission key to `analise-vl`.

#### [MODIFY] Dashboard Components (Contextual)
*   `src/components/dashboard/KPICards.tsx`: Replace "Compra" with "Venda" in display text.
*   `src/components/dashboard/LeadsByDayChart.tsx`: Replace "Compra" with "Venda" in chart legend.

### Database (Supabase)
*   **NOTE**: The user request implies replacing "Compra" with "Venda" *wherever it appears*. This might affect the database content (e.g., `intencoes` table). I will check if "Venda" already exists in `intencoes` or if I need to update the data.
    *   *Self-correction*: The `intencoes` table likely has 'Venda' already (as seen in seed data: 'Venda', 'Locação'). The code in `AnaliseCLPage` was hardcoding 'Compra'. I should ensure the code matches the database data. If the database uses 'Venda', then the code change is actually a fix. If the database uses 'Compra', I might need to update the database data too, but usually 'Venda' is the standard term in Real Estate (Sale vs Rent).
    *   *Verification*: Seed data says `INSERT INTO intencoes (nome) VALUES ('Venda'), ('Locação'), ('Indefinido');`. So the database ALREADY uses 'Venda'. The `AnaliseCLPage` using 'Compra' was likely inconsistent with the database or mapping it incorrectly. I will align everything to 'Venda'.

## Verification Plan

### Manual Verification
*   Check if the new route `/analise-vl` works.
*   Check if the sidebar menu shows "Análise V/L".
*   Check if the page title and charts display "Venda" instead of "Compra".
*   Check if permissions work (admin/corretor access).
