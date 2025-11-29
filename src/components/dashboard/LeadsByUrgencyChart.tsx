import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LeadsByUrgencyChartProps {
    data?: { urgency: string; count: number }[];
    isLoading: boolean;
}

const URGENCY_COLORS: Record<string, string> = {
    'Normal': '#22c55e',
    'Alta': '#f97316',
    'Crítica': '#ef4444',
};

export function LeadsByUrgencyChart({ data, isLoading }: LeadsByUrgencyChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Leads por Urgência</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </CardContent>
            </Card>
        );
    }

    const sortedData = data ? [...data].sort((a, b) => {
        const order = { 'Crítica': 3, 'Alta': 2, 'Normal': 1 };
        return (order[a.urgency as keyof typeof order] || 0) - (order[b.urgency as keyof typeof order] || 0);
    }) : [];

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Leads por Urgência</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={sortedData}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="urgency"
                            type="category"
                            width={60}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                            {sortedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={URGENCY_COLORS[entry.urgency] || '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
