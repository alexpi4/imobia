import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardPeriod } from '@/hooks/useDashboard';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface DashboardHeaderProps {
    period: DashboardPeriod;
    onPeriodChange: (value: DashboardPeriod) => void;
    customStart?: Date;
    customEnd?: Date;
    onCustomStartChange?: (date: Date | undefined) => void;
    onCustomEndChange?: (date: Date | undefined) => void;
}

export function DashboardHeader({
    period,
    onPeriodChange,
    customStart,
    customEnd,
    onCustomStartChange,
    onCustomEndChange
}: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">
                    Dashboard
                </h1>
                <p className="text-base text-muted-foreground">
                    Visão geral dos seus leads e métricas de vendas
                </p>
            </div>
            <div className="flex items-center gap-3">
                {period === 'custom' && onCustomStartChange && onCustomEndChange && (
                    <DateRangePicker
                        startDate={customStart}
                        endDate={customEnd}
                        onStartDateChange={onCustomStartChange}
                        onEndDateChange={onCustomEndChange}
                    />
                )}
                <Select value={period} onValueChange={(value) => onPeriodChange(value as DashboardPeriod)}>
                    <SelectTrigger className="w-[200px] transition-smooth hover:border-primary/50">
                        <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Hoje</SelectItem>
                        <SelectItem value="7">Últimos 7 dias</SelectItem>
                        <SelectItem value="15">Últimos 15 dias</SelectItem>
                        <SelectItem value="custom">Selecione o período</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
