# SaaS Subscription Implementation Plan

## Goal
Implement a subscription-based access control system where user permissions are the intersection of their Role ACL and their Tenant's Active Plan.

## Proposed Changes

### Database
- **New Tables**:
    - `plans`: id, name, description, price, active
    - `modules`: id, name, key (e.g., 'crm_full', 'chat'), description
    - `plan_modules`: plan_id, module_id
    - `tenant_plans`: tenant_id, plan_id, status ('active', 'suspended', 'cancelled'), start_date, end_date
    - `billing_history`: tenant_id, amount, date, status
- **Modifications**:
    - Ensure `profiles` has `tenant_id`.
    - Ensure `tenants` table exists and is linked.

### Backend (Supabase)
- **Functions**:
    - `get_user_final_permissions(user_id)`: Returns the list of allowed menu items based on Plan + Role.
    - `check_tenant_status(tenant_id)`: Returns status (active/suspended).

### Frontend
- **Types**: Add `Plan`, `Module`, `Subscription` interfaces.
- **AuthContext**:
    - Fetch `tenant_plan` and `tenant_status` on login.
    - If status is 'suspended', restrict access to basic menus only.
- **useMenuPermissions**:
    - Modify `hasAccess` to check:
        1. Is the module enabled in the Tenant's Plan?
        2. Is the module allowed in the User's ACL?
    - Logic: `FinalAccess = PlanModules AND UserACL`.

### UI
- **Admin Panel**:
    - `/admin/plans`: CRUD for Plans.
    - `/admin/modules`: CRUD for Modules.
    - `/admin/subscriptions`: Manage Tenant Subscriptions (Assign plans manually for now).

## Verification Plan
1.  **Manual Test**:
    - Create a "Basic" plan with only "CRM Limited".
    - Create a "Pro" plan with "CRM Full" + "Chat".
    - Assign "Basic" to Tenant A.
    - Login as User from Tenant A -> Verify Chat is hidden even if ACL allows it.
    - Assign "Pro" to Tenant A.
    - Refresh -> Verify Chat is visible.
    - Set Tenant A status to "Suspended".
    - Refresh -> Verify only Dashboard/Financial is visible.
