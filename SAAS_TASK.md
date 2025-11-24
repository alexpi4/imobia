
# SaaS Subscription System Implementation (Part 3)

## Database Schema
- [x] Create `plans` table <!-- id: 0 -->
- [x] Create `modules` table <!-- id: 1 -->
- [x] Create `plan_modules` table <!-- id: 2 -->
- [x] Create `tenant_plans` table (Subscription) <!-- id: 3 -->
- [x] Create `billing_history` table <!-- id: 4 -->
- [x] Create `tenant_module_status` table <!-- id: 5 -->
- [x] Add `tenant_id` to `profiles` (if missing) <!-- id: 6 -->
- [x] Seed initial Plans and Modules <!-- id: 7 -->

## Missing Tables (Identified)
- [x] Create `tasks` table <!-- id: 20 -->
- [x] Create `notifications` table <!-- id: 21 -->
- [x] Create `visits` table <!-- id: 22 -->

## Backend Logic (Supabase)
- [x] Create function `get_tenant_plan_modules(tenant_id)` <!-- id: 8 -->
- [x] Create function `check_subscription_status(tenant_id)` <!-- id: 9 -->
- [x] Implement RLS policies for new tables <!-- id: 10 -->

## Frontend Logic
- [x] Update `types/index.ts` with new interfaces <!-- id: 11 -->
- [x] Update `AuthContext` to fetch Tenant Plan & Status <!-- id: 12 -->
- [x] Update `useMenuPermissions` to intersect Plan Modules with ACL <!-- id: 13 -->

## UI Implementation
- [x] Create Admin Page: `PlansManagement` <!-- id: 14 -->
- [x] Create Admin Page: `ModulesManagement` <!-- id: 15 -->
- [x] Create Tenant Page: `SubscriptionStatus` <!-- id: 16 -->
- [x] Update `AppSidebar` with new menu items <!-- id: 17 -->
- [x] Update `App.tsx` with new routes <!-- id: 18 -->
- [ ] Verify Menu Generation (Intersection Logic) <!-- id: 19 -->

## Verification
- [ ] Verify Login Flow with Active Plan (Manual) <!-- id: 17 -->
- [ ] Verify Login Flow with Suspended Plan (Manual) <!-- id: 18 -->
- [ ] Verify CRUD Operations (Manual) <!-- id: 23 -->
