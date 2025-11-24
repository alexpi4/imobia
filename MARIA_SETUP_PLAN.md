# Maria Setup & SaaS Integration Plan

## Goal
Integrate the SaaS subscription system by ensuring real data usage and setting up an initial subscription for `maria@test.com`.

## Proposed Changes

### Database (SQL Script)
Create `supabase/migrations/20251123_setup_maria.sql` to:
1.  **Create User**: Check if `maria@test.com` exists in `auth.users`. If not, create it with password `123456`.
2.  **Create Profile**: Ensure a profile exists for Maria.
3.  **Create Tenant**: Create a tenant named "Maria's Company" (slug: `maria-company`).
4.  **Link User**: Update Maria's profile to belong to this tenant.
5.  **Create Subscription**: Insert a record into `tenant_plans` for this tenant with the 'Inicial' plan (or 'Básico' if preferred for testing features). I will use 'Básico' to give her some modules.

### Frontend
- **Verification**: Confirmed that `PlansManagementPage` and `ModulesManagementPage` use `useCadastro` hook, which fetches from Supabase. No hardcoded mocks need removal.
- **Action**: None required for code.

## Verification Plan
1.  **Run Migration**: Execute `20251123_setup_maria.sql`.
2.  **Login**: Login as `maria@test.com` / `123456`.
3.  **Check Subscription**: Navigate to `/configuracao/assinatura` and verify the plan is active.
4.  **Check Permissions**: Verify she can access menus allowed by her plan.
