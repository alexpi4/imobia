import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPICards } from '@/components/dashboard/KPICards';
import { LeadsByDayChart } from '@/components/dashboard/LeadsByDayChart';
import { LeadsByOriginChart } from '@/components/dashboard/LeadsByOriginChart';
import { LeadsByUnitChart } from '@/components/dashboard/LeadsByUnitChart';
import { LeadsByUrgencyChart } from '@/components/dashboard/LeadsByUrgencyChart';
import { UnitDistributionTable } from '@/components/dashboard/UnitDistributionTable';
import { useDashboard, DashboardPeriod } from '@/hooks/useDashboard';

export default function DashboardPage() {
    const [period, setPeriod] = useState<DashboardPeriod>('7');
    const [customStart, setCustomStart] = useState<Date | undefined>(undefined);
    const [customEnd, setCustomEnd] = useState<Date | undefined>(undefined);

    const {
        kpis,
        leadsByDay,
        leadsByOrigin,
        leadsByUnit,
        leadsByUrgency,
        unitDistribution,
        isLoading
    } = useDashboard(period, customStart, customEnd);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="p-8 space-y-8">
                <DashboardHeader
                    period={period}
                    onPeriodChange={setPeriod}
                    customStart={customStart}
                    customEnd={customEnd}
                    onCustomStartChange={setCustomStart}
                    onCustomEndChange={setCustomEnd}
                />

                <KPICards kpis={kpis} isLoading={isLoading} />

                <div className="grid gap-6 md:grid-cols-2">
                    <LeadsByDayChart data={leadsByDay} isLoading={isLoading} />
                    <LeadsByOriginChart data={leadsByOrigin} isLoading={isLoading} />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <LeadsByUnitChart data={leadsByUnit} isLoading={isLoading} />
                    <LeadsByUrgencyChart data={leadsByUrgency} isLoading={isLoading} />
                </div>

                <UnitDistributionTable data={unitDistribution} isLoading={isLoading} />
            </div>
        </div>
    );
}
