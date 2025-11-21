import { useCadastro } from '@/hooks/useCadastros';
import { RodadaDistribuicao } from '@/types/operacional';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardRoletaPage() {
    const { data: rodadas, loading } = useCadastro<RodadaDistribuicao>('rodadas_distribuicao', '*, corretor:profiles(nome)');

    // Simple stats
    const totalDistribuidos = rodadas.length;
    const porCorretor = rodadas.reduce((acc, curr) => {
        const nome = curr.corretor?.nome || 'Desconhecido';
        acc[nome] = (acc[nome] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(porCorretor).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard da Roleta</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Distribuído</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDistribuidos}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição por Corretor</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Histórico Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Corretor</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={3}>Carregando...</TableCell></TableRow>
                                ) : (
                                    rodadas.slice(0, 5).map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell>{new Date(r.data_execucao).toLocaleDateString()}</TableCell>
                                            <TableCell>{r.corretor?.nome}</TableCell>
                                            <TableCell>{r.status}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
