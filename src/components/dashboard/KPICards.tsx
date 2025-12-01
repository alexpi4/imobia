import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Building2, Clock } from 'lucide-react';

interface KPICardsProps {
    kpis?: {
        total_leads: number;
        intencao_counts: Record<string, number>;
        top_unidade: { nome: string; count: number };
        avg_interval_minutes: number;
    };
    isLoading: boolean;
}

export function KPICards({ kpis, isLoading }: KPICardsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-4 w-4 bg-muted rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-muted rounded mb-2" />
                            <div className="h-3 w-32 bg-muted rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const intencaoString = `${kpis?.intencao_counts['Venda'] || 0} / ${kpis?.intencao_counts['Locação'] || 0} / ${kpis?.intencao_counts['Indefinido'] || 0}`;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Leads Novos</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis?.total_leads}</div>
                    <p className="text-xs text-muted-foreground">Total no período</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Intenção</CardTitle>
                    <Target className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{intencaoString}</div>
                    <p className="text-xs text-muted-foreground">Venda / Locação / Indefinido</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unidade Destaque</CardTitle>
                    <Building2 className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {kpis?.top_unidade.nome === 'N/A' ? '-' : kpis?.top_unidade.nome}
                        <span className="text-base font-normal text-muted-foreground ml-2">
                            ({kpis?.top_unidade.count})
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Maior volume de leads</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Intervalo Médio</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis?.avg_interval_minutes} min</div>
                    <p className="text-xs text-muted-foreground">Entre últimos 10 leads</p>
                </CardContent>
            </Card>
        </div>
    );
}
