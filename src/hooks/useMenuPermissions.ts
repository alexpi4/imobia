import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

// Define which modules grant access to which menus
// If a menu is listed here, the user MUST have at least one of the required modules
const MENU_MODULE_REQUIREMENTS: Record<string, string[]> = {
    'crm': ['crm_basic', 'crm_full'],
    'pipeline': ['crm_basic', 'crm_full'],
    'leads': ['crm_basic', 'crm_full'],
    'funil-vendas': ['crm_basic', 'crm_full'],
    'analise-cl': ['crm_full'],
    'performance': ['crm_full'],

    'webhooks': ['integracoes'],
    'chat': ['chat_internal', 'multiatendimento'],
};

export function useMenuPermissions() {
    const { profile, allowedModules, subscription } = useAuth();
    const [allowedMenus, setAllowedMenus] = useState<string[] | 'all'>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile) {
            setAllowedMenus([]);
            setLoading(false);
            return;
        }

        if (profile.role === 'ADMIN') {
            setAllowedMenus('all');
            setLoading(false);
            return;
        }

        const fetchPermissions = async () => {
            const { data, error } = await supabase
                .from('liberacao')
                .select('menu')
                .eq('usuario_id', profile.id);

            if (error) {
                console.error('Error fetching permissions:', error);
                setAllowedMenus([]);
            } else {
                setAllowedMenus(data.map((item) => item.menu));
            }
            setLoading(false);
        };

        fetchPermissions();

        // Realtime subscription
        const channel = supabase
            .channel('permissions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'liberacao',
                    filter: `usuario_id=eq.${profile.id}`,
                },
                () => {
                    fetchPermissions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile]);

    const hasAccess = (menuId: string): boolean => {
        if (loading) return false;
        if (profile?.role === 'ADMIN') return true;

        // 1. Check Subscription Status
        // If suspended, only allow basic menus
        if (subscription?.status === 'suspended') {
            const basicMenus = ['dashboard', 'financeiro', 'configuracao', 'perfil'];
            return basicMenus.includes(menuId);
        }

        // 2. Check Module Requirements (Plan Limits)
        const requiredModules = MENU_MODULE_REQUIREMENTS[menuId];
        if (requiredModules) {
            // User must have at least one of the required modules in their plan
            const hasModule = requiredModules.some(mod => allowedModules.includes(mod));
            if (!hasModule) return false;
        }

        // 3. Check ACL (User Permissions)
        if (menuId === 'dashboard') return true; // Always visible
        return Array.isArray(allowedMenus) && allowedMenus.includes(menuId);
    };

    return { allowedMenus, hasAccess, loading };
}
