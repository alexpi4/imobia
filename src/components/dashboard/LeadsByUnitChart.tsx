import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LeadsByUnitChartProps {
    data?: { unit: string; count: number }[];
    isLoading: boolean;
}

const COLORS = [
    'hsl(217, 91%, 60%)',
    'hsl(142, 76%, 56%)',
    'hsl(271, 76%, 63%)',
    'hsl(25, 95%, 63%)',
    'hsl(189, 94%, 43%)',
    'hsl(330, 85%, 65%)',
    'hsl(197, 71%, 52%)',
    'hsl(43, 96%, 56%)'
];

export function LeadsByUnitChart({ data, isLoading }: LeadsByUnitChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-1 border-0 shadow-premium">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Leads por Unidade</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </CardContent>
            </Card>
        );
    }

    const total = data?.reduce((sum, item) => sum + item.count, 0) || 0;

    const formattedData = data?.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
    }));

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return percent > 0.05 ? (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        ) : null;
    };

    return (
        <Card className="col-span-1 border-0 shadow-premium hover-lift transition-smooth animate-scale-in animate-delay-300">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg font-semibold">Leads por Unidade</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={formattedData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={105}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="unit"
                            animationDuration={1000}
                        >
                            {formattedData?.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: 500 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
