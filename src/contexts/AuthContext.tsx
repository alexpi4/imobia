import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AppRole, Tenant, TenantPlan } from '@/types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    tenant: Tenant | null;
    subscription: TenantPlan | null;
    allowedModules: string[];
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    tenant: null,
    subscription: null,
    allowedModules: [],
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [subscription, setSubscription] = useState<TenantPlan | null>(null);
    const [allowedModules, setAllowedModules] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setTenant(null);
                setSubscription(null);
                setAllowedModules([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (profileError) throw profileError;

            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .single();

            // If no role found, default to NENHUM or use profile.papel
            const role = roleData?.role || (profileData.papel as AppRole) || 'NENHUM';

            setProfile({ ...profileData, role });

            // Fetch Tenant and Subscription if tenant_id exists
            if (profileData.tenant_id) {
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profileData.tenant_id)
                    .single();

                setTenant(tenantData);

                const { data: subData } = await supabase
                    .from('tenant_plans')
                    .select('*, plan:plans(*)')
                    .eq('tenant_id', profileData.tenant_id)
                    .single();

                setSubscription(subData);

                // Fetch Allowed Modules via RPC
                const { data: modulesData } = await supabase
                    .rpc('get_tenant_modules', { p_tenant_id: profileData.tenant_id });

                if (modulesData) {
                    setAllowedModules(modulesData.map((m: any) => m.module_key));
                }
            }

        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, tenant, subscription, allowedModules, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
