import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export type DashboardPeriod = '7' | '15' | '30' | '90' | '180';

interface DashboardKPIs {
    total_leads: number;
    intencao_counts: Record<string, number>;
    top_unidade: { nome: string; count: number };
    avg_interval_minutes: number;
}

interface LeadsByDay {
    date: string;
    compra: number;
    locacao: number;
    indefinido: number;
}

interface LeadsByOrigin {
    origin: string;
    count: number;
}

interface LeadsByUnit {
    unit: string;
    count: number;
}

interface LeadsByUrgency {
    urgency: string;
    count: number;
}

interface UnitDistribution {
    unidade: string;
    site: number;
    upp: number;
    whatsapp: number;
    rd: number;
    redes: number;
    indicacao: number;
    outros: number;
    total: number;
    percentage: number;
}

export function useDashboard(period: DashboardPeriod) {
    const getDates = () => {
        const end = endOfDay(new Date());
        const start = startOfDay(subDays(new Date(), parseInt(period)));
        return { start: start.toISOString(), end: end.toISOString() };
    };

    const { start, end } = getDates();

    const { data: kpis, isLoading: kpisLoading } = useQuery({
        queryKey: ['dashboard-kpis', period],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_dashboard_kpis', {
                start_date: start,
                end_date: end,
            });
            if (error) throw error;
            return data as DashboardKPIs;
        },
    });

    const { data: leadsByDay, isLoading: leadsByDayLoading } = useQuery({
        queryKey: ['dashboard-leads-by-day', period],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_leads_by_day', {
                start_date: start,
                end_date: end,
            });
            if (error) throw error;
            return data as LeadsByDay[];
        },
    });

    const { data: leadsByOrigin, isLoading: leadsByOriginLoading } = useQuery({
        queryKey: ['dashboard-leads-by-origin', period],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_leads_by_origin', {
                start_date: start,
                end_date: end,
            });
            if (error) throw error;
            return data as LeadsByOrigin[];
        },
    });

    const { data: leadsByUnit, isLoading: leadsByUnitLoading } = useQuery({
        queryKey: ['dashboard-leads-by-unit', period],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_leads_by_unit', {
                start_date: start,
                end_date: end,
            });
            if (error) throw error;
            return data as LeadsByUnit[];
        },
    });

    const { data: leadsByUrgency, isLoading: leadsByUrgencyLoading } = useQuery({
        queryKey: ['dashboard-leads-by-urgency', period],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_leads_by_urgency', {
                start_date: start,
                end_date: end,
            });
            if (error) throw error;
            return data as LeadsByUrgency[];
        },
    });

    const { data: unitDistribution, isLoading: unitDistributionLoading } = useQuery({
        queryKey: ['dashboard-unit-distribution', period],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_unit_distribution', {
                start_date: start,
                end_date: end,
            });
            if (error) throw error;
            return data as UnitDistribution[];
        },
    });

    return {
        kpis,
        leadsByDay,
        leadsByOrigin,
        leadsByUnit,
        leadsByUrgency,
        unitDistribution,
        isLoading: kpisLoading || leadsByDayLoading || leadsByOriginLoading || leadsByUnitLoading || leadsByUrgencyLoading || unitDistributionLoading,
    };
}
