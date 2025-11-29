import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LeadsByOriginChartProps {
    data?: { origin: string; count: number }[];
    isLoading: boolean;
}

export function LeadsByOriginChart({ data, isLoading }: LeadsByOriginChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Leads por Origem</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </CardContent>
            </Card>
        );
    }

    // Sort data descending by count for better visualization
    const sortedData = data ? [...data].sort((a, b) => b.count - a.count) : [];

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Leads por Origem</CardTitle>
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
                            dataKey="origin"
                            type="category"
                            width={100}
                            tick={{ fontSize: 11 }}
                            interval={0}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                            {sortedData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill="#3b82f6" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
