import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/hooks/useLeads';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = {
    'Compra': '#22c55e',
    'Locação': '#3b82f6',
    'Outros': '#94a3b8',
};

export default function AnaliseCLPage() {
    const { leads, isLoading } = useLeads();

    const intentionData = useMemo(() => {
        if (!leads) return [];

        const grouped = leads.reduce((acc, lead) => {
            const intention = lead.intencao || 'Outros';
            if (!acc[intention]) {
                acc[intention] = { name: intention, value: 0, totalValue: 0 };
            }
            acc[intention].value += 1;
            acc[intention].totalValue += lead.valor || 0;
            return acc;
        }, {} as Record<string, { name: string; value: number; totalValue: number }>);

        return Object.values(grouped);
    }, [leads]);

    const intentionByOrigin = useMemo(() => {
        if (!leads) return [];

        const grouped = leads.reduce((acc, lead) => {
            const key = `${lead.origem}-${lead.intencao}`;
            if (!acc[key]) {
                acc[key] = {
                    origem: lead.origem,
                    intencao: lead.intencao,
                    count: 0,
                };
            }
            acc[key].count += 1;
            return acc;
        }, {} as Record<string, { origem: string; intencao: string; count: number }>);

        // Group by origem for chart
        const byOrigem = Object.values(grouped).reduce((acc, item) => {
            if (!acc[item.origem]) {
                acc[item.origem] = { origem: item.origem, Compra: 0, Locação: 0, Outros: 0 };
            }
            if (item.intencao === 'Compra' || item.intencao === 'Locação') {
                acc[item.origem][item.intencao] = item.count;
            } else {
                acc[item.origem].Outros += item.count;
            }
            return acc;
        }, {} as Record<string, any>);

        return Object.values(byOrigem);
    }, [leads]);

    const intentionByUnit = useMemo(() => {
        if (!leads) return [];

        const grouped = leads.reduce((acc, lead) => {
            const key = `${lead.unidade}-${lead.intencao}`;
            if (!acc[key]) {
                acc[key] = {
                    unidade: lead.unidade,
                    intencao: lead.intencao,
                    count: 0,
                };
            }
            acc[key].count += 1;
            return acc;
        }, {} as Record<string, { unidade: string; intencao: string; count: number }>);

        // Group by unidade for chart
        const byUnidade = Object.values(grouped).reduce((acc, item) => {
            if (!acc[item.unidade]) {
                acc[item.unidade] = { unidade: item.unidade, Compra: 0, Locação: 0, Outros: 0 };
            }
            if (item.intencao === 'Compra' || item.intencao === 'Locação') {
                acc[item.unidade][item.intencao] = item.count;
            } else {
                acc[item.unidade].Outros += item.count;
            }
            return acc;
        }, {} as Record<string, any>);

        return Object.values(byUnidade);
    }, [leads]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Carregando dados...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Análise Compra vs Locação</CardTitle>
                    <CardDescription>
                        Distribuição de leads por intenção de compra ou locação
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Resumo de Intenções */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {intentionData.map((item) => (
                    <Card key={item.name} className={
                        item.name === 'Compra' ? 'border-green-200 bg-green-50' :
                            item.name === 'Locação' ? 'border-blue-200 bg-blue-50' :
                                'border-gray-200 bg-gray-50'
                    }>
                        <CardHeader className="pb-2">
                            <CardDescription>{item.name}</CardDescription>
                            <CardTitle className="text-3xl">{item.value}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                }).format(item.totalValue)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Gráfico de Pizza */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribuição por Intenção</CardTitle>
                    <CardDescription>Proporção de leads por tipo de intenção</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={intentionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {intentionData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Outros}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Intenção por Origem */}
            <Card>
                <CardHeader>
                    <CardTitle>Intenção por Origem</CardTitle>
                    <CardDescription>Comparativo de intenções por canal de origem</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={intentionByOrigin}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="origem" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Compra" fill={COLORS.Compra} />
                            <Bar dataKey="Locação" fill={COLORS.Locação} />
                            <Bar dataKey="Outros" fill={COLORS.Outros} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Intenção por Unidade */}
            <Card>
                <CardHeader>
                    <CardTitle>Intenção por Unidade</CardTitle>
                    <CardDescription>Comparativo de intenções por unidade de atendimento</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={intentionByUnit}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="unidade" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Compra" fill={COLORS.Compra} />
                            <Bar dataKey="Locação" fill={COLORS.Locação} />
                            <Bar dataKey="Outros" fill={COLORS.Outros} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
