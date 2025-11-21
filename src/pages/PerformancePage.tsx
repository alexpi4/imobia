import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/hooks/useLeads';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';

export default function PerformancePage() {
    const { leads, isLoading } = useLeads();

    const performanceByUser = useMemo(() => {
        if (!leads) return [];

        const grouped = leads.reduce((acc, lead) => {
            const userName = lead.criador?.nome || 'Não atribuído';
            if (!acc[userName]) {
                acc[userName] = {
                    name: userName,
                    total: 0,
                    ganho: 0,
                    perdido: 0,
                    emAndamento: 0,
                    totalValue: 0,
                };
            }
            acc[userName].total += 1;
            if (lead.pipeline === 'Ganho') {
                acc[userName].ganho += 1;
                acc[userName].totalValue += lead.valor || 0;
            } else if (lead.pipeline === 'Perdido') {
                acc[userName].perdido += 1;
            } else {
                acc[userName].emAndamento += 1;
            }
            return acc;
        }, {} as Record<string, any>);

        return Object.values(grouped).sort((a: any, b: any) => b.ganho - a.ganho);
    }, [leads]);

    const leadsByDay = useMemo(() => {
        if (!leads) return [];

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = startOfDay(subDays(new Date(), 6 - i));
            return {
                date: format(date, 'dd/MM', { locale: ptBR }),
                fullDate: date,
                count: 0,
            };
        });

        leads.forEach(lead => {
            const leadDate = startOfDay(new Date(lead.data_criacao));
            const dayData = last7Days.find(d => d.fullDate.getTime() === leadDate.getTime());
            if (dayData) {
                dayData.count += 1;
            }
        });

        return last7Days.map(({ date, count }) => ({ date, count }));
    }, [leads]);

    const topPerformer = useMemo(() => {
        if (performanceByUser.length === 0) return null;
        return performanceByUser[0];
    }, [performanceByUser]);

    const totalMetrics = useMemo(() => {
        if (!leads) return { total: 0, ganho: 0, conversao: 0, valorTotal: 0 };

        const total = leads.length;
        const ganho = leads.filter(l => l.pipeline === 'Ganho').length;
        const valorTotal = leads
            .filter(l => l.pipeline === 'Ganho' && l.valor)
            .reduce((sum, l) => sum + (l.valor || 0), 0);

        return {
            total,
            ganho,
            conversao: total > 0 ? ((ganho / total) * 100).toFixed(1) : '0',
            valorTotal,
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
                    <CardTitle>Performance do Time</CardTitle>
                    <CardDescription>
                        Métricas de desempenho e produtividade da equipe de vendas
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Métricas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription>Total de Leads</CardDescription>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-3xl">{totalMetrics.total}</CardTitle>
                    </CardHeader>
                </Card>

                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription>Leads Ganhos</CardDescription>
                            <Trophy className="h-4 w-4 text-green-600" />
                        </div>
                        <CardTitle className="text-3xl text-green-600">{totalMetrics.ganho}</CardTitle>
                    </CardHeader>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription>Taxa de Conversão</CardDescription>
                            <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <CardTitle className="text-3xl text-blue-600">{totalMetrics.conversao}%</CardTitle>
                    </CardHeader>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription>Valor Total</CardDescription>
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                        </div>
                        <CardTitle className="text-2xl text-purple-600">
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                notation: 'compact',
                            }).format(totalMetrics.valorTotal)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Top Performer */}
            {topPerformer && (
                <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Trophy className="h-6 w-6 text-yellow-600" />
                            <div>
                                <CardTitle>Top Performer</CardTitle>
                                <CardDescription>{topPerformer.name}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold">{topPerformer.total}</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{topPerformer.ganho}</p>
                                <p className="text-xs text-muted-foreground">Ganhos</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{topPerformer.emAndamento}</p>
                                <p className="text-xs text-muted-foreground">Em Andamento</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-600">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                        notation: 'compact',
                                    }).format(topPerformer.totalValue)}
                                </p>
                                <p className="text-xs text-muted-foreground">Valor</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Performance por Usuário */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Individual</CardTitle>
                    <CardDescription>Leads por membro da equipe</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={performanceByUser}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="ganho" name="Ganhos" fill="#22c55e" stackId="a" />
                            <Bar dataKey="emAndamento" name="Em Andamento" fill="#3b82f6" stackId="a" />
                            <Bar dataKey="perdido" name="Perdidos" fill="#ef4444" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Tendência de Leads */}
            <Card>
                <CardHeader>
                    <CardTitle>Tendência de Leads (Últimos 7 dias)</CardTitle>
                    <CardDescription>Volume de novos leads por dia</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={leadsByDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                name="Novos Leads"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
