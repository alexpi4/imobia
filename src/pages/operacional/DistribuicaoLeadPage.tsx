import { useState } from 'react';
import { useCadastro } from '@/hooks/useCadastros';
import { distributeLead } from '@/lib/roleta';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lead } from '@/types';
import { Play } from 'lucide-react';

export default function DistribuicaoLeadPage() {
    const { data: leads, loading, refetch } = useCadastro<Lead>('leads', '*');
    const [distributing, setDistributing] = useState<number | null>(null);

    const unassignedLeads = leads.filter(l => !l.atribuido);

    const handleDistribute = async (leadId: number) => {
        setDistributing(leadId);
        try {
            await distributeLead(leadId);
            refetch();
        } catch {
            // Error handled in lib
        } finally {
            setDistributing(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Distribuição de Leads</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Leads Pendentes ({unassignedLeads.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Origem</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Carregando...</TableCell>
                                </TableRow>
                            ) : unassignedLeads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Nenhum lead pendente.</TableCell>
                                </TableRow>
                            ) : (
                                unassignedLeads.map(lead => (
                                    <TableRow key={lead.id}>
                                        <TableCell>{lead.nome}</TableCell>
                                        <TableCell>{lead.origem}</TableCell>
                                        <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleDistribute(lead.id)}
                                                disabled={distributing === lead.id}
                                            >
                                                <Play className="mr-2 h-4 w-4" />
                                                {distributing === lead.id ? 'Distribuindo...' : 'Distribuir'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
