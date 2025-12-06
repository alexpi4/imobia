import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LeadsByOriginChartProps {
    data?: { origin: string; count: number }[];
    isLoading: boolean;
}

export function LeadsByOriginChart({ data, isLoading }: LeadsByOriginChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-1 border-0 shadow-premium">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Leads por Origem</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </CardContent>
            </Card>
        );
    }

    // Sort data descending by count for better visualization
    const sortedData = data ? [...data].sort((a, b) => b.count - a.count) : [];

    const barColors = [
        'hsl(217, 91%, 60%)',
        'hsl(142, 76%, 56%)',
        'hsl(271, 76%, 63%)',
        'hsl(25, 95%, 63%)',
        'hsl(189, 94%, 43%)',
        'hsl(330, 85%, 65%)',
        'hsl(197, 71%, 52%)',
        'hsl(43, 96%, 56%)'
    ];

    return (
        <Card className="col-span-1 border-0 shadow-premium hover-lift transition-smooth animate-scale-in animate-delay-200">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg font-semibold">Leads por Origem</CardTitle>
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
                            dataKey="origin"
                            type="category"
                            width={100}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            interval={0}
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
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1000}>
                            {sortedData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
