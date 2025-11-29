import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadsByDayChartProps {
    data?: { date: string; compra: number; locacao: number; indefinido: number }[];
    isLoading: boolean;
}

export function LeadsByDayChart({ data, isLoading }: LeadsByDayChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Leads com Intenção por Dia</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </CardContent>
            </Card>
        );
    }

    const formattedData = data?.map(item => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'dd/MM', { locale: ptBR }),
    }));

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Leads com Intenção por Dia</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="compra" name="Compra" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="locacao" name="Locação" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="indefinido" name="Indefinido" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
