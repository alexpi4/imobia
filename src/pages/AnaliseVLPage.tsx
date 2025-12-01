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
    'Venda': '#3b82f6', // Blue
    'Locação': '#22c55e', // Green
    'Indefinido': '#f97316', // Orange
    'Outros': '#94a3b8', // Gray
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
            return data as any;
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
        <div className="p-8 space-y-6 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-cyan-500">Análise Venda / Locação</h1>
                    <p className="text-muted-foreground">Análise detalhada dos leads de Venda e locação</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Leads de Venda</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{kpis?.venda?.count}</div>
                        <p className="text-xs text-muted-foreground">{kpis?.venda?.percentage}% do total</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Leads de Locação</CardTitle>
                        <Home className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{kpis?.locacao?.count}</div>
                        <p className="text-xs text-muted-foreground">{kpis?.locacao?.percentage}% do total</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Distribuição Venda vs Locação vs Indefinido</CardTitle>
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
                                    label={({ payload }: any) => `${payload.intencao}: ${payload.count} (${payload.percentage}%)`}
                                >
                                    {distribuicao?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.intencao as keyof typeof COLORS] || COLORS.Indefinido} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Vertical Bar Chart (Units) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Venda e Locação por Unidade</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={unidades}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="unidade" tick={{ fontSize: 12 }} interval={0} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="venda" name="Venda" fill={COLORS.Venda} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="locacao" name="Locação" fill={COLORS.Locação} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Horizontal Bar Chart (Cities) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Venda e Locação por Cidade (Top 10)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={cidades} margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="cidade" type="category" width={100} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="venda" name="Venda" fill={COLORS.Venda} radius={[0, 4, 4, 0]} />
                                <Bar dataKey="locacao" name="Locação" fill={COLORS.Locação} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Horizontal Bar Chart (Origins) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Venda e Locação por Canal de Origem</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={origens} margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="origem" type="category" width={100} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="venda" name="Venda" fill={COLORS.Venda} radius={[0, 4, 4, 0]} />
                                <Bar dataKey="locacao" name="Locação" fill={COLORS.Locação} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Summary Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Resumo Detalhado</CardTitle>
                    <div className="flex gap-2">
                        {/* Placeholder for table filters if needed, currently static as per PRD "Visualização por" logic handled by RPC/Query if implemented dynamically, but PRD implies table columns are fixed for Unidade view, and filters reorganize. For now implementing Unidade view as default/main. */}
                        {/* To implement "Visualização por Unidade/Cidade/Origem", we would need state and different RPC calls or data processing. PRD says "Cada filtro reorganiza as colunas". I'll stick to Unidade for now as it's the primary view in the image. */}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Unidade</TableHead>
                                    <TableHead className="text-center">Venda</TableHead>
                                    <TableHead className="text-center">% Venda</TableHead>
                                    <TableHead className="text-center">Locação</TableHead>
                                    <TableHead className="text-center">% Locação</TableHead>
                                    <TableHead className="text-center font-bold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tabelaResumo?.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{row.unidade}</TableCell>
                                        <TableCell className="text-center">{row.venda}</TableCell>
                                        <TableCell className="text-center">{row.venda_perc}%</TableCell>
                                        <TableCell className="text-center">{row.locacao}</TableCell>
                                        <TableCell className="text-center">{row.locacao_perc}%</TableCell>
                                        <TableCell className="text-center font-bold">{row.total}</TableCell>
                                    </TableRow>
                                ))}
                                {/* Total Row */}
                                <TableRow className="bg-muted/50 font-bold">
                                    <TableCell>TOTAL</TableCell>
                                    <TableCell className="text-center">{tabelaResumo?.reduce((acc, curr) => acc + curr.venda, 0)}</TableCell>
                                    <TableCell className="text-center">-</TableCell>
                                    <TableCell className="text-center">{tabelaResumo?.reduce((acc, curr) => acc + curr.locacao, 0)}</TableCell>
                                    <TableCell className="text-center">-</TableCell>
                                    <TableCell className="text-center">{tabelaResumo?.reduce((acc, curr) => acc + curr.total, 0)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
