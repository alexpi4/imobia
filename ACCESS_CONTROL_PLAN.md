# Access Control Dashboard Implementation Plan

## Goal
Replace the placeholder `PapeisPermissoesPage` with a functional dashboard that allows Admins to:
1.  View a list of users.
2.  Assign roles to users (updating `user_roles`).
3.  Manage granular menu permissions (updating `liberacao`).

## Proposed Changes

### Frontend (`src/pages/admin/PapeisPermissoesPage.tsx`)
-   **Layout**: Implement a two-column layout using Tailwind CSS.
-   **State**:
    -   `users`: List of profiles (with roles).
    -   `selectedUser`: The currently selected user.
    -   `permissions`: List of active permissions for the selected user.
    -   `searchQuery`: For filtering users.
-   **Components**:
    -   **User List**:
        -   Fetch from `profiles` joined with `user_roles`.
        -   Search functionality.
        -   "Add User" button (placeholder or redirect to invite).
    -   **Permissions Panel**:
        -   **Role Selector**: Dropdown to update `user_roles`.
        -   **Menu Toggles**: List of all available menus (defined in a constant).
        -   Toggle state reflects `liberacao` table.
-   **Logic**:
    -   `fetchUsers`: Get profiles and their roles.
    -   `fetchPermissions`: Get `liberacao` entries for `selectedUser`.
    -   `handleSave`:
        -   Update `user_roles` (delete old, insert new).
        -   Update `liberacao` (delete all for user, insert selected).

### Constants
Define the list of available menus to manage permissions for:
-   `dashboard`, `leads`, `pipeline`, `funil-vendas`, `analise-cl`, `performance`, `chat`, `calendario`, `tarefas`, `contatos`, `imoveis`, `automacoes`, `integracoes`, `webhooks`, `equipe`, `configuracoes`.

## Verification Plan
1.  **Manual Test**:
    -   Go to `/admin/papeis-permissoes`.
    -   Select a user (e.g., `maria@test.com`).
    -   Change role to `CORRETOR`.
    -   Enable/Disable specific menus (e.g., disable `pipeline`).
    -   Save.
    -   Login as `maria@test.com` and verify sidebar reflects changes.
