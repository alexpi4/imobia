# Create Supabase Config Page

## Goal Description
Create a new page "Supabase" under "Integrações e API" to allow users to configure `SUPABASE_URL` and `SUPABASE_ANON_KEY`. This configuration should override the default environment variables, allowing dynamic connection switching.

## Proposed Changes

### Client Initialization

#### [MODIFY] [src/integrations/supabase/client.ts](file:///c:/Users/Alex/imobia/imobia/src/integrations/supabase/client.ts)
-   Modify initialization to check `localStorage` for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before falling back to `import.meta.env`.
-   This enables the "runtime switching" requested without needing a backend to write to `.env`.

### New Page

#### [NEW] [src/pages/admin/SupabaseConfigPage.tsx](file:///c:/Users/Alex/imobia/imobia/src/pages/admin/SupabaseConfigPage.tsx)
-   Create a form with inputs for URL and Anon Key.
-   "Save" button: Saves values to `localStorage` and reloads the page (simulating "restart service").
-   "Reset" button: Clears `localStorage` to revert to `.env` defaults.

### Navigation & Access Control

#### [MODIFY] [src/components/layout/AppSidebar.tsx](file:///c:/Users/Alex/imobia/imobia/src/components/layout/AppSidebar.tsx)
-   Add "Supabase" item to `adminMenuStructure` under "Integrações e API".
-   ID: `admin-supabase`.

#### [MODIFY] [src/App.tsx](file:///c:/Users/Alex/imobia/imobia/src/App.tsx)
-   Add route `/admin/supabase` pointing to `SupabaseConfigPage`.

#### [MODIFY] [src/hooks/useMenuPermissions.ts](file:///c:/Users/Alex/imobia/imobia/src/hooks/useMenuPermissions.ts)
-   Add `admin-supabase` to `MENU_MODULE_REQUIREMENTS` if necessary (likely under 'integracoes' or just leave it for admins).

## Verification Plan

### Manual Verification
1.  Navigate to "Integrações e API" -> "Supabase".
2.  Enter new Supabase credentials.
3.  Click Save.
4.  Verify page reloads and app is now connected to the new project (e.g., check data or network requests).
5.  Click Reset.
6.  Verify app reverts to original connection.
