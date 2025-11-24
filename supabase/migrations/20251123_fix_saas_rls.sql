-- FIX SAAS RLS POLICIES
-- Allow ADMINs to manage Plans, Modules, and Subscriptions

-- 1. PLANS
CREATE POLICY "Admin can insert plans" ON plans FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can update plans" ON plans FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can delete plans" ON plans FOR DELETE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));

-- 2. MODULES
CREATE POLICY "Admin can insert modules" ON modules FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can update modules" ON modules FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can delete modules" ON modules FOR DELETE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));

-- 3. PLAN_MODULES
CREATE POLICY "Admin can insert plan_modules" ON plan_modules FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can update plan_modules" ON plan_modules FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can delete plan_modules" ON plan_modules FOR DELETE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));

-- 4. TENANT_PLANS
CREATE POLICY "Admin can insert tenant_plans" ON tenant_plans FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can update tenant_plans" ON tenant_plans FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can delete tenant_plans" ON tenant_plans FOR DELETE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));

-- 5. TENANT_MODULE_STATUS
CREATE POLICY "Admin can insert tenant_module_status" ON tenant_module_status FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can update tenant_module_status" ON tenant_module_status FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can delete tenant_module_status" ON tenant_module_status FOR DELETE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));

-- 6. BILLING_HISTORY (Allow Admin to manage for now)
CREATE POLICY "Admin can insert billing_history" ON billing_history FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can update billing_history" ON billing_history FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admin can delete billing_history" ON billing_history FOR DELETE TO authenticated USING (has_role(auth.uid(), 'ADMIN'));

-- Refresh cache just in case
NOTIFY pgrst, 'reload config';
