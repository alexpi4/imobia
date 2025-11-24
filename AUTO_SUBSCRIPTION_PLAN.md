# Auto Subscription on Signup Plan

## Goal
Automatically create a Tenant and an Initial Subscription for every new user that signs up.

## Proposed Changes

### Database (Migration)
Create `supabase/migrations/20251123_auto_subscription_trigger.sql` to replace the `handle_new_user` function.

**New Logic:**
1.  **Create Profile**: Insert into `profiles` (existing logic).
2.  **Create Tenant**:
    - Name: "Empresa [User Name]" or derived from email.
    - Slug: Generated from email (sanitized) + random suffix to ensure uniqueness.
3.  **Link Tenant**: Update `profiles.tenant_id` with the new tenant ID.
4.  **Create Subscription**:
    - Find 'Inicial' or 'Básico' plan ID.
    - Insert into `tenant_plans` with status 'active'.

## Verification
1.  **Run Migration**: Execute the new SQL script.
2.  **Test Signup**:
    - Go to `/login` -> Sign Up.
    - Register a new user (e.g., `newuser@test.com`).
3.  **Verify**:
    - Check `tenants` table for new entry.
    - Check `tenant_plans` table for new entry.
    - Check `profiles` table for `tenant_id`.
    - Login as new user and check `/configuracao/assinatura`.
