import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export function useMenuPermissions() {
    const { profile } = useAuth();
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
        if (menuId === 'dashboard') return true; // Always visible
        return Array.isArray(allowedMenus) && allowedMenus.includes(menuId);
    };

    return { allowedMenus, hasAccess, loading };
}
