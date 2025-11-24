# SaaS Subscription System Walkthrough

This document outlines the changes made to implement the SaaS subscription system and how to verify them.

## Changes Implemented

### Database
- **New Tables**: `tenants`, `plans`, `modules`, `plan_modules`, `tenant_plans`, `billing_history`, `tenant_module_status`.
- **Missing Tables Added**: `tasks`, `notifications`, `visits`.
- **Updates**: Added `tenant_id` to `profiles`.
- **Functions**: `get_tenant_modules`, `check_subscription_status`.
- **Seed Data**: Initial plans (Inicial, Básico, Intermediário, Total) and modules.

### Frontend
- **Types**: Added `Tenant`, `Plan`, `Module`, `TenantPlan`.
- **AuthContext**: Fetches tenant and subscription data on login.
- **Permissions**: `useMenuPermissions` now checks:
  1. **Subscription Status**: If suspended, only basic menus are allowed.
  2. **Plan Modules**: Menus are filtered based on the modules included in the tenant's plan.
  3. **User ACL**: Existing role-based permissions are still applied.

### UI
- **Admin**:
  - `PlansManagementPage` (/admin/plans): Manage plans and their modules.
  - `ModulesManagementPage` (/admin/modules): Manage system modules.
- **Tenant**:
  - `SubscriptionStatusPage` (/configuracao/assinatura): View current plan, status, and billing history.
- **Navigation**: Updated `AppSidebar` to include these new pages.

## Verification Steps

### 1. Database Setup
Ensure the migration files `supabase/migrations/20251123_saas_schema.sql` and `supabase/migrations/20251123_missing_tables.sql` have been applied.

### 2. Verify Missing Tables
1.  Check if `tasks`, `notifications`, and `visits` tables exist in Supabase.
2.  (Optional) Insert a test task:
    ```sql
    INSERT INTO tasks (title, description, status) VALUES ('Test Task', 'Verify table creation', 'pending');
    ```

### 3. Admin Verification
1.  Navigate to `/admin/modules`.
    - Verify that default modules (CRM Básico, CRM Completo, etc.) are listed.
    - Try creating a new module.
2.  Navigate to `/admin/plans`.
    - Verify that default plans are listed.
    - Edit a plan and change its active modules.
    - Create a new plan.

### 3. User & Tenant Setup (Automated)
Run the migration file `supabase/migrations/20251123_setup_maria.sql`.
This script will:
1.  Create user `maria@test.com` (password: `123456`) if not exists.
2.  Create tenant "Maria Company".
3.  Assign the "Básico" plan to this tenant.

### 4. Permission Verification
1.  **Login**: Log in with `maria@test.com` / `123456`.
2.  **Check Menu**:
    - Verify that the sidebar only shows menus allowed by the 'Básico' plan.
    - Menus requiring 'CRM Completo' (like Análise C/L) should be hidden.
3.  **Subscription Status**:
    - Go to `/configuracao/assinatura`.
    - Verify the plan details match the 'Básico' plan.

### 5. Suspension Test
1.  **Suspend Plan**:
    ```sql
    UPDATE tenant_plans SET status = 'suspended' WHERE tenant_id = <TENANT_ID>;
    ```
2.  **Refresh Page**:
    - Verify that most menus disappear.
    - Only basic menus (Dashboard, Financeiro, Configuração) should be visible.
