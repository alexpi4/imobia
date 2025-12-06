import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LeadsByUrgencyChartProps {
    data?: { urgency: string; count: number }[];
    isLoading: boolean;
}

const URGENCY_COLORS: Record<string, string> = {
    'Normal': 'hsl(142, 76%, 56%)',
    'Alta': 'hsl(25, 95%, 63%)',
    'Crítica': 'hsl(0, 84%, 60%)',
};

export function LeadsByUrgencyChart({ data, isLoading }: LeadsByUrgencyChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-1 border-0 shadow-premium">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Leads por Urgência</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </CardContent>
            </Card>
        );
    }

    const sortedData = data ? [...data].sort((a, b) => {
        const order = { 'Crítica': 3, 'Alta': 2, 'Normal': 1 };
        return (order[a.urgency as keyof typeof order] || 0) - (order[b.urgency as keyof typeof order] || 0);
    }) : [];

    return (
        <Card className="col-span-1 border-0 shadow-premium hover-lift transition-smooth animate-scale-in animate-delay-400">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg font-semibold">Leads por Urgência</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={sortedData}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="urgency"
                            type="category"
                            width={60}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={32} animationDuration={1000}>
                            {sortedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={URGENCY_COLORS[entry.urgency] || 'hsl(217, 91%, 60%)'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
