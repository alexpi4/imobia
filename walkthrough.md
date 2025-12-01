# Walkthrough - Supabase Config Page

I have implemented a new page to configure the Supabase connection dynamically.

## Changes

### New Page
-   **Supabase Config Page**: `src/pages/admin/SupabaseConfigPage.tsx`
    -   Allows users to enter `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
    -   Saves to `localStorage`.
    -   Reloads the page to apply changes.
    -   Includes a "Restaurar Padrão" button to revert to `.env` settings.

### Supabase Client
-   **Client Initialization**: `src/integrations/supabase/client.ts`
    -   Modified to check `localStorage` for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before using environment variables.

### Navigation & Access
-   **Sidebar**: Added "Supabase" to "Integrações e API" group in `AppSidebar.tsx`.
-   **Routes**: Added `/admin/supabase` route in `App.tsx`.
-   **Permissions**: Added `admin-supabase` permission to `useMenuPermissions.ts` (requires 'integracoes' module).
-   **Access Control**: Added "Supabase" to the list of available menus in `PapeisPermissoesPage.tsx` under "Administração", allowing granular permission assignment.

### Components
-   **Alert**: Created `src/components/ui/alert.tsx` as it was missing and required for the new page.

## Verification Results

### Automated Checks
-   `npm run build` passed successfully.

### Manual Verification Steps
1.  Navigate to **Integrações e API > Supabase**.
2.  Enter the new Supabase URL and Anon Key.
3.  Click **Salvar e Reiniciar**.
4.  The page should reload.
5.  Verify that the application is now connected to the new Supabase project (e.g., by checking data or network requests).
6.  To revert, go back to the page and click **Restaurar Padrão**.
7.  **Access Control**: Go to **Administração > Papéis e Permissões**, select a user, and verify that "Supabase" appears under "Administração" and can be toggled.
