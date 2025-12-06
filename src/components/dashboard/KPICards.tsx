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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse border-0 shadow-premium">
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

    const cards = [
        {
            title: 'Leads Novos',
            value: kpis?.total_leads,
            description: 'Total no período',
            icon: TrendingUp,
            gradient: 'gradient-blue',
            iconColor: 'text-blue-100',
            delay: 'animate-delay-100'
        },
        {
            title: 'Intenção',
            value: intencaoString,
            description: 'Venda / Locação / Indefinido',
            icon: Target,
            gradient: 'gradient-green',
            iconColor: 'text-green-100',
            delay: 'animate-delay-200'
        },
        {
            title: 'Unidade Destaque',
            value: kpis?.top_unidade.nome === 'N/A' ? '-' : kpis?.top_unidade.nome,
            count: kpis?.top_unidade.count,
            description: 'Maior volume de leads',
            icon: Building2,
            gradient: 'gradient-purple',
            iconColor: 'text-purple-100',
            delay: 'animate-delay-300'
        },
        {
            title: 'Intervalo Médio',
            value: `${kpis?.avg_interval_minutes} min`,
            description: 'Entre últimos 10 leads',
            icon: Clock,
            gradient: 'gradient-orange',
            iconColor: 'text-orange-100',
            delay: 'animate-delay-400'
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card
                        key={index}
                        className={`relative overflow-hidden border-0 shadow-premium hover-lift transition-smooth ${card.gradient} animate-scale-in ${card.delay}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-white/90">
                                {card.title}
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                                <Icon className={`h-5 w-5 ${card.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-white mb-1">
                                {card.value}
                                {card.count !== undefined && (
                                    <span className="text-lg font-normal text-white/80 ml-2">
                                        ({card.count})
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-white/70 font-medium">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
