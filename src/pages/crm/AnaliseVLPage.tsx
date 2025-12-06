import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Home } from 'lucide-react';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const COLORS = {
    'Venda': 'hsl(217, 91%, 60%)',
    'Locação': 'hsl(142, 76%, 56%)',
    'Indefinido': 'hsl(25, 95%, 63%)',
    'Outros': 'hsl(220, 13%, 60%)',
};

type Periodo = '0' | '7' | '15' | 'custom';

export default function AnaliseVLPage() {
    const [periodo, setPeriodo] = useState<Periodo>('7');
    const [customStart, setCustomStart] = useState<Date | undefined>(undefined);
    const [customEnd, setCustomEnd] = useState<Date | undefined>(undefined);

    const getDates = () => {
        if (periodo === 'custom') {
            const start = customStart ? startOfDay(customStart) : startOfDay(new Date());
            const end = customEnd ? endOfDay(customEnd) : endOfDay(new Date());
            return { start: start.toISOString(), end: end.toISOString() };
        }

        const end = endOfDay(new Date());
        const days = parseInt(periodo);
        const start = startOfDay(days === 0 ? new Date() : subDays(new Date(), days));
        return { start: start.toISOString(), end: end.toISOString() };
    };

    const { start, end } = getDates();

    // --- Data Fetching ---

    const { data: kpis, isLoading: loadingKpis } = useQuery({
        queryKey: ['analise-vl-kpis', periodo, customStart, customEnd],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('rpc_get_kpis', { start_date: start, end_date: end });
            if (error) throw error;
            return data as { venda: { count: number; percentage: number }; locacao: { count: number; percentage: number } };
        }
    });

    const { data: distribuicao, isLoading: loadingDistribuicao } = useQuery({
        queryKey: ['analise-vl-distribuicao', periodo, customStart, customEnd],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('rpc_get_distribuicao_intencao', { start_date: start, end_date: end });
            if (error) throw error;
            return data as { intencao: string; count: number; percentage: number }[];
        }
    });

    const { data: unidades, isLoading: loadingUnidades } = useQuery({
        queryKey: ['analise-vl-unidades', periodo, customStart, customEnd],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('rpc_get_unidades', { start_date: start, end_date: end });
            if (error) throw error;
            return data as { unidade: string; venda: number; locacao: number }[];
        }
    });

    const { data: cidades, isLoading: loadingCidades } = useQuery({
        queryKey: ['analise-vl-cidades', periodo, customStart, customEnd],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('rpc_get_cidades', { start_date: start, end_date: end });
            if (error) throw error;
            return data as { cidade: string; venda: number; locacao: number }[];
        }
    });

    const { data: origens, isLoading: loadingOrigens } = useQuery({
        queryKey: ['analise-vl-origens', periodo, customStart, customEnd],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('rpc_get_origens', { start_date: start, end_date: end });
            if (error) throw error;
            return data as { origem: string; venda: number; locacao: number }[];
        }
    });

    const { data: tabelaResumo, isLoading: loadingTabela } = useQuery({
        queryKey: ['analise-vl-tabela', periodo, customStart, customEnd],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('rpc_get_tabela_resumo', { start_date: start, end_date: end });
            if (error) throw error;
            return data as { unidade: string; total: number; venda: number; venda_perc: number; locacao: number; locacao_perc: number; total_geral: number }[];
        }
    });

    const isLoading = loadingKpis || loadingDistribuicao || loadingUnidades || loadingCidades || loadingOrigens || loadingTabela;

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Carregando dados...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">Análise Venda / Locação</h1>
                        <p className="text-base text-muted-foreground">Análise detalhada dos leads de Venda e locação</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {periodo === 'custom' && (
                            <DateRangePicker
                                startDate={customStart}
                                endDate={customEnd}
                                onStartDateChange={setCustomStart}
                                onEndDateChange={setCustomEnd}
                            />
                        )}
                        <Select value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione o período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Hoje</SelectItem>
                                <SelectItem value="7">Últimos 7 dias</SelectItem>
                                <SelectItem value="15">Últimos 15 dias</SelectItem>
                                <SelectItem value="custom">Selecione o período</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in delay-100">
                    <Card className="gradient-blue shadow-premium border-none text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShoppingCart className="w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-blue-100">Leads de Venda</CardTitle>
                            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                <ShoppingCart className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold mb-1">{kpis?.venda?.count}</div>
                            <p className="text-xs text-blue-100 font-medium bg-blue-800/30 inline-block px-2 py-1 rounded-full">{kpis?.venda?.percentage}% do total</p>
                        </CardContent>
                    </Card>
                    <Card className="gradient-green shadow-premium border-none text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Home className="w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-green-100">Leads de Locação</CardTitle>
                            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                <Home className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold mb-1">{kpis?.locacao?.count}</div>
                            <p className="text-xs text-green-100 font-medium bg-green-800/30 inline-block px-2 py-1 rounded-full">{kpis?.locacao?.percentage}% do total</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <Card className="shadow-premium border-none hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold gradient-text">Distribuição: Venda vs Locação</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distribuicao}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="intencao"
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        label={(props: any) => `${props.payload.intencao}: ${props.payload.count} (${props.payload.percentage}%)`}
                                    >
                                        {distribuicao?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.intencao as keyof typeof COLORS] || COLORS.Indefinido} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Vertical Bar Chart (Units) */}
                    <Card className="shadow-premium border-none hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold gradient-text">Venda e Locação por Unidade</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={unidades}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="unidade" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="venda" name="Venda" fill={COLORS.Venda} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="locacao" name="Locação" fill={COLORS.Locação} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Horizontal Bar Chart (Cities) */}
                    <Card className="shadow-premium border-none hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold gradient-text">Top 10 Cidades</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={cidades} margin={{ left: 10, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="cidade" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="venda" name="Venda" fill={COLORS.Venda} radius={[0, 4, 4, 0]} barSize={20} />
                                    <Bar dataKey="locacao" name="Locação" fill={COLORS.Locação} radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Horizontal Bar Chart (Origins) */}
                    <Card className="shadow-premium border-none hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold gradient-text">Canais de Origem</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={origens} margin={{ left: 10, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="origem" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="venda" name="Venda" fill={COLORS.Venda} radius={[0, 4, 4, 0]} barSize={20} />
                                    <Bar dataKey="locacao" name="Locação" fill={COLORS.Locação} radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Summary Table */}
                <Card className="shadow-premium border-none hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-semibold gradient-text">Resumo Detalhado por Unidade</CardTitle>
                        <div className="flex gap-2">
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-gray-100 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[200px] font-semibold text-gray-700">Unidade</TableHead>
                                        <TableHead className="text-center font-semibold text-blue-600">Venda</TableHead>
                                        <TableHead className="text-center font-semibold text-blue-600">% Venda</TableHead>
                                        <TableHead className="text-center font-semibold text-green-600">Locação</TableHead>
                                        <TableHead className="text-center font-semibold text-green-600">% Locação</TableHead>
                                        <TableHead className="text-center font-bold text-gray-800">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tabelaResumo?.map((row, index) => (
                                        <TableRow key={index} className="hover:bg-blue-50/30 transition-colors">
                                            <TableCell className="font-medium text-gray-700">{row.unidade}</TableCell>
                                            <TableCell className="text-center font-medium text-gray-600">{row.venda}</TableCell>
                                            <TableCell className="text-center text-gray-500 text-sm">{row.venda_perc}%</TableCell>
                                            <TableCell className="text-center font-medium text-gray-600">{row.locacao}</TableCell>
                                            <TableCell className="text-center text-gray-500 text-sm">{row.locacao_perc}%</TableCell>
                                            <TableCell className="text-center font-bold text-gray-800 bg-gray-50/30">{row.total}</TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Total Row */}
                                    <TableRow className="bg-gradient-to-r from-blue-50/50 to-green-50/50 font-bold border-t-2 border-white">
                                        <TableCell className="text-gray-800">TOTAL GERAL</TableCell>
                                        <TableCell className="text-center text-blue-700">{tabelaResumo?.reduce((acc, curr) => acc + curr.venda, 0)}</TableCell>
                                        <TableCell className="text-center">-</TableCell>
                                        <TableCell className="text-center text-green-700">{tabelaResumo?.reduce((acc, curr) => acc + curr.locacao, 0)}</TableCell>
                                        <TableCell className="text-center">-</TableCell>
                                        <TableCell className="text-center text-gray-900 text-lg">{tabelaResumo?.reduce((acc, curr) => acc + curr.total, 0)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
