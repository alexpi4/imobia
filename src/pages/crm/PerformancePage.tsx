import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/hooks/useLeads';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';

export default function PerformancePage() {
    const { leads, isLoading } = useLeads();

    interface PerformanceData {
        name: string;
        total: number;
        ganho: number;
        perdido: number;
        emAndamento: number;
        totalValue: number;
    }

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
        }, {} as Record<string, PerformanceData>);

        return Object.values(grouped).sort((a: PerformanceData, b: PerformanceData) => b.ganho - a.ganho);
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">Performance do Time</h1>
                    <p className="text-base text-muted-foreground">Métricas de desempenho e produtividade da equipe de vendas</p>
                </div>
            </div>

            {/* Métricas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in delay-100">
                <Card className="gradient-blue shadow-premium border-none text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardDescription className="text-blue-100 font-medium">Total de Leads</CardDescription>
                        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                            <Users className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold mb-1">{totalMetrics.total}</div>
                        <p className="text-xs text-blue-100 font-medium bg-blue-800/30 inline-block px-2 py-1 rounded-full">Total da base</p>
                    </CardContent>
                </Card>

                <Card className="gradient-green shadow-premium border-none text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardDescription className="text-green-100 font-medium">Leads Ganhos</CardDescription>
                        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                            <Trophy className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold mb-1">{totalMetrics.ganho}</div>
                        <p className="text-xs text-green-100 font-medium bg-green-800/30 inline-block px-2 py-1 rounded-full">Convertidos</p>
                    </CardContent>
                </Card>

                <Card className="gradient-purple shadow-premium border-none text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Target className="w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardDescription className="text-purple-100 font-medium">Taxa de Conversão</CardDescription>
                        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                            <Target className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold mb-1">{totalMetrics.conversao}%</div>
                        <p className="text-xs text-purple-100 font-medium bg-purple-800/30 inline-block px-2 py-1 rounded-full">Eficiência</p>
                    </CardContent>
                </Card>

                <Card className="gradient-orange shadow-premium border-none text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardDescription className="text-orange-100 font-medium">Valor Total</CardDescription>
                        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold mb-1">
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                notation: 'compact',
                            }).format(totalMetrics.valorTotal)}
                        </div>
                        <p className="text-xs text-orange-100 font-medium bg-orange-800/30 inline-block px-2 py-1 rounded-full">Gerado</p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performer */}
            {topPerformer && (
                <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 shadow-premium border-none text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 animate-slide-in-up">
                    <div className="absolute opacity-10 -right-10 -top-10">
                        <Trophy className="w-64 h-64 text-white transform rotate-12" />
                    </div>
                    <CardHeader className="relative z-10 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full backdrop-blur-md shadow-lg">
                                <Trophy className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-white">Top Performer</CardTitle>
                                <CardDescription className="text-yellow-100 text-lg font-medium">{topPerformer.name}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 relative z-10">
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                                <p className="text-3xl font-bold text-white">{topPerformer.total}</p>
                                <p className="text-sm text-yellow-100 font-medium">Total</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                                <p className="text-3xl font-bold text-white">{topPerformer.ganho}</p>
                                <p className="text-sm text-yellow-100 font-medium">Ganhos</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                                <p className="text-3xl font-bold text-white">{topPerformer.emAndamento}</p>
                                <p className="text-sm text-yellow-100 font-medium">Em Andamento</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-colors">
                                <p className="text-xl font-bold text-white">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                        notation: 'compact',
                                    }).format(topPerformer.totalValue)}
                                </p>
                                <p className="text-sm text-yellow-100 font-medium">Valor</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Performance por Usuário */}
            <Card className="shadow-premium border-none hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold gradient-text">Performance Individual</CardTitle>
                    <CardDescription>Leads por membro da equipe</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={performanceByUser}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#1e293b' }}
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            />
                            <Legend iconType="circle" />
                            <Bar dataKey="ganho" name="Ganhos" fill="hsl(142, 76%, 56%)" stackId="a" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="emAndamento" name="Em Andamento" fill="hsl(217, 91%, 60%)" stackId="a" />
                            <Bar dataKey="perdido" name="Perdidos" fill="hsl(0, 84%, 60%)" stackId="a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Tendência de Leads */}
            <Card className="shadow-premium border-none hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold gradient-text">Tendência de Leads (Últimos 7 dias)</CardTitle>
                    <CardDescription>Volume de novos leads por dia</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={leadsByDay}>
                            <defs>
                                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#1e293b' }}
                            />
                            <Legend iconType="circle" />
                            <Area
                                type="monotone"
                                dataKey="count"
                                name="Novos Leads"
                                stroke="hsl(217, 91%, 60%)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorLeads)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(217, 91%, 60%)" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
