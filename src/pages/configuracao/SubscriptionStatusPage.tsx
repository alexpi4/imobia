import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, CreditCard } from 'lucide-react';

export default function SubscriptionStatusPage() {
    const { tenant, subscription, allowedModules } = useAuth();
    const [billingHistory, setBillingHistory] = useState<any[]>([]);
    const [modulesList, setModulesList] = useState<any[]>([]);

    useEffect(() => {
        if (tenant) {
            fetchBillingHistory();
            fetchModulesDetails();
        }
    }, [tenant, allowedModules]);

    const fetchBillingHistory = async () => {
        if (!tenant) return;
        const { data } = await supabase
            .from('billing_history')
            .select('*')
            .eq('tenant_id', tenant.id)
            .order('date', { ascending: false });

        if (data) setBillingHistory(data);
    };

    const fetchModulesDetails = async () => {
        if (allowedModules.length === 0) return;
        const { data } = await supabase
            .from('modules')
            .select('*')
            .in('key', allowedModules);

        if (data) setModulesList(data);
    };

    if (!tenant || !subscription) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">Nenhuma assinatura ativa encontrada.</h2>
                <p className="text-muted-foreground">Entre em contato com o suporte.</p>
            </div>
        );
    }

    const statusColor = {
        active: 'bg-green-500',
        suspended: 'bg-red-500',
        cancelled: 'bg-gray-500',
        trial: 'bg-blue-500',
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Assinatura e Cobrança</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Current Plan Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plano Atual</CardTitle>
                        <CardDescription>Detalhes da sua assinatura</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold">{subscription.plan?.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subscription.plan?.price || 0)} / mês
                                </p>
                            </div>
                            <Badge className={`${statusColor[subscription.status]} text-white`}>
                                {subscription.status.toUpperCase()}
                            </Badge>
                        </div>

                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Início:</span>
                                <span>{format(new Date(subscription.start_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </div>
                            {subscription.end_date && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Renovação:</span>
                                    <span>{format(new Date(subscription.end_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                </div>
                            )}
                        </div>

                        <Button className="w-full mt-4">
                            <CreditCard className="mr-2 h-4 w-4" /> Gerenciar Assinatura
                        </Button>
                    </CardContent>
                </Card>

                {/* Modules Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Módulos Ativos</CardTitle>
                        <CardDescription>Funcionalidades liberadas no seu plano</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            {modulesList.map(module => (
                                <div key={module.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="font-medium text-sm">{module.name}</p>
                                        <p className="text-xs text-muted-foreground">{module.description}</p>
                                    </div>
                                </div>
                            ))}
                            {modulesList.length === 0 && (
                                <p className="text-sm text-muted-foreground">Nenhum módulo adicional ativo.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Billing History */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Cobrança</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Fatura</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {billingHistory.map((bill) => (
                                <TableRow key={bill.id}>
                                    <TableCell>{format(new Date(bill.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{bill.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {bill.invoice_url && (
                                            <Button variant="link" size="sm" asChild>
                                                <a href={bill.invoice_url} target="_blank" rel="noreferrer">Ver PDF</a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {billingHistory.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Nenhum histórico encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
