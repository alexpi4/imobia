import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadsByDayChartProps {
    data?: { date: string; compra: number; locacao: number; indefinido: number }[];
    isLoading: boolean;
}

export function LeadsByDayChart({ data, isLoading }: LeadsByDayChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-1 border-0 shadow-premium">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Leads com Intenção por Dia</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </CardContent>
            </Card>
        );
    }

    const formattedData = data?.map(item => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'dd/MM', { locale: ptBR }),
    }));

    return (
        <Card className="col-span-1 border-0 shadow-premium hover-lift transition-smooth animate-scale-in animate-delay-100">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg font-semibold">Leads com Intenção por Dia</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorVenda" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorLocacao" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(142, 76%, 56%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(142, 76%, 56%)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorIndefinido" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(25, 95%, 63%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(25, 95%, 63%)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 500 }} />
                        <Area
                            type="monotone"
                            dataKey="compra"
                            name="Venda"
                            stroke="hsl(217, 91%, 60%)"
                            strokeWidth={2.5}
                            fill="url(#colorVenda)"
                            animationDuration={1000}
                        />
                        <Area
                            type="monotone"
                            dataKey="locacao"
                            name="Locação"
                            stroke="hsl(142, 76%, 56%)"
                            strokeWidth={2.5}
                            fill="url(#colorLocacao)"
                            animationDuration={1000}
                        />
                        <Area
                            type="monotone"
                            dataKey="indefinido"
                            name="Indefinido"
                            stroke="hsl(25, 95%, 63%)"
                            strokeWidth={2.5}
                            fill="url(#colorIndefinido)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
