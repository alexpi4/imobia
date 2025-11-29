import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardPeriod } from '@/hooks/useDashboard';

interface DashboardHeaderProps {
    period: DashboardPeriod;
    onPeriodChange: (value: DashboardPeriod) => void;
}

export function DashboardHeader({ period, onPeriodChange }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral dos seus leads e métricas de vendas
                </p>
            </div>
            <Select value={period} onValueChange={(value) => onPeriodChange(value as DashboardPeriod)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="15">Últimos 15 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="180">Últimos 180 dias</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
