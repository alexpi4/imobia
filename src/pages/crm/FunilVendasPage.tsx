import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/hooks/useLeads';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const PIPELINE_COLORS = {
    'Novo': '#3b82f6',
    'Qualificação': '#eab308',
    'Visita': '#a855f7',
    'Ganho': '#22c55e',
    'Perdido': '#ef4444',
};

export default function FunilVendasPage() {
    const { leads, isLoading } = useLeads();

    const funnelData = useMemo(() => {
        if (!leads) return [];

        const stages = ['Novo', 'Qualificação', 'Visita', 'Ganho', 'Perdido'];

        return stages.map(stage => {
            const count = leads.filter(lead => lead.pipeline === stage).length;
            const totalValue = leads
                .filter(lead => lead.pipeline === stage && lead.valor)
                .reduce((sum, lead) => sum + (lead.valor || 0), 0);

            return {
                stage,
                count,
                totalValue,
                color: PIPELINE_COLORS[stage as keyof typeof PIPELINE_COLORS],
            };
        });
    }, [leads]);

    const conversionMetrics = useMemo(() => {
        if (!leads || leads.length === 0) return null;

        const total = leads.length;
        const ganho = leads.filter(l => l.pipeline === 'Ganho').length;
        const perdido = leads.filter(l => l.pipeline === 'Perdido').length;
        const emAndamento = total - ganho - perdido;

        return {
            total,
            ganho,
            perdido,
            emAndamento,
            taxaConversao: total > 0 ? ((ganho / total) * 100).toFixed(1) : '0',
            taxaPerda: total > 0 ? ((perdido / total) * 100).toFixed(1) : '0',
        };
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
                    <CardTitle>Funil de Vendas</CardTitle>
                    <CardDescription>
                        Análise de conversão e distribuição de leads por etapa do pipeline
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Métricas Resumidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total de Leads</CardDescription>
                        <CardTitle className="text-3xl">{conversionMetrics?.total || 0}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Em Andamento</CardDescription>
                        <CardTitle className="text-3xl text-blue-600">
                            {conversionMetrics?.emAndamento || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                        <CardDescription>Taxa de Conversão</CardDescription>
                        <CardTitle className="text-3xl text-green-600">
                            {conversionMetrics?.taxaConversao || 0}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {conversionMetrics?.ganho || 0} leads ganhos
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                        <CardDescription>Taxa de Perda</CardDescription>
                        <CardTitle className="text-3xl text-red-600">
                            {conversionMetrics?.taxaPerda || 0}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {conversionMetrics?.perdido || 0} leads perdidos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Funil */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribuição por Etapa</CardTitle>
                    <CardDescription>Quantidade de leads em cada etapa do funil</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={funnelData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="stage" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number, name: string) => {
                                    if (name === 'count') return [value, 'Leads'];
                                    if (name === 'totalValue') {
                                        return [
                                            new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            }).format(value),
                                            'Valor Total'
                                        ];
                                    }
                                    return [value, name];
                                }}
                            />
                            <Legend
                                formatter={(value) => {
                                    if (value === 'count') return 'Quantidade de Leads';
                                    if (value === 'totalValue') return 'Valor Total (R$)';
                                    return value;
                                }}
                            />
                            <Bar dataKey="count" name="count" radius={[8, 8, 0, 0]}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Gráfico de Valor Total */}
            <Card>
                <CardHeader>
                    <CardTitle>Valor Total por Etapa</CardTitle>
                    <CardDescription>Soma dos valores dos leads em cada etapa</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={funnelData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="stage" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number) =>
                                    new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    }).format(value)
                                }
                            />
                            <Bar dataKey="totalValue" name="Valor Total" radius={[8, 8, 0, 0]}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
