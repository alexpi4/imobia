import { useState } from 'react';
import { useCadastro } from '@/hooks/useCadastros';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lead } from '@/types';
import { Play } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DistribuicaoLeadPage() {
    const { data: leads, loading, refetch } = useCadastro<Lead>('leads', '*');
    const [distributing, setDistributing] = useState<number | null>(null);

    // Dialog State
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
    const [currentDateTime, setCurrentDateTime] = useState<{ date: string, time: string } | null>(null);

    const unassignedLeads = leads.filter(l => !l.atribuido);

    const handleDistributeClick = (leadId: number) => {
        const now = new Date();
        const dateStr = format(now, 'yyyy-MM-dd');
        const timeStr = format(now, 'HH:mm');

        setSelectedLeadId(leadId);
        setCurrentDateTime({ date: dateStr, time: timeStr });
        setConfirmDialogOpen(true);
    };

    const handleConfirmDistribute = async () => {
        if (!selectedLeadId || !currentDateTime) return;

        setDistributing(selectedLeadId);
        setConfirmDialogOpen(false); // Close dialog immediately or wait? Better close to show state on button

        try {
            // 1. Call RPC fn_plantao_atual
            const { data: corretorData, error: rpcError } = await supabase.rpc('fn_plantao_atual', {
                p_data: currentDateTime.date,
                p_hora: currentDateTime.time
            });

            if (rpcError) throw new Error('Erro ao buscar plantão: ' + rpcError.message);

            if (!corretorData) {
                throw new Error('Nenhum corretor disponível no plantão atual.');
            }

            let targetCorretorId: number;

            if (Array.isArray(corretorData) && corretorData.length > 0) {
                // RPC returns an array: [{ corretor_id: 1, ... }]
                targetCorretorId = corretorData[0].corretor_id || corretorData[0].id;
            } else if (typeof corretorData === 'object' && corretorData !== null) {
                // RPC returns single object
                targetCorretorId = (corretorData as any).corretor_id || (corretorData as any).id;
            } else {
                // RPC returns scalar
                targetCorretorId = Number(corretorData);
            }

            if (!targetCorretorId || isNaN(targetCorretorId)) {
                console.error('Invalid corretorData from RPC:', corretorData);
                throw new Error('Formato de dados inválido retornado pelo plantão.');
            }

            // 2. Assign Lead
            const { error: updateError } = await supabase
                .from('leads')
                .update({
                    responsavel_id: targetCorretorId,
                    atribuido: true,
                    // pipeline: 'Novo' // Optional: keep or remove based on preference, roleta.ts had it
                })
                .eq('id', selectedLeadId);

            if (updateError) throw new Error('Erro ao atualizar lead: ' + updateError.message);

            // 3. Log Distribution (Optional but good practice to match previous logic)
            await supabase.from('rodadas_distribuicao').insert({
                corretor_id: targetCorretorId,
                lead_id: selectedLeadId,
                cliente_atribuido: 'Lead ' + selectedLeadId,
                status: 'sucesso',
                origem_disparo: 'manual_plantao'
            });

            toast.success('Lead distribuído com sucesso!');
            refetch();

        } catch (error: any) {
            console.error('Erro na distribuição:', error);
            toast.error(error.message || 'Erro ao distribuir lead.');
        } finally {
            setDistributing(null);
            setSelectedLeadId(null);
            setCurrentDateTime(null);
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
                                                onClick={() => handleDistributeClick(lead.id)}
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

            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Distribuição</DialogTitle>
                        <DialogDescription>
                            Deseja distribuir este lead usando o plantão atual?
                        </DialogDescription>
                    </DialogHeader>

                    {currentDateTime && (
                        <div className="py-4 space-y-2">
                            <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                                <span className="text-sm font-medium">Data do Sistema:</span>
                                <span className="font-mono">{currentDateTime.date}</span>
                            </div>
                            <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                                <span className="text-sm font-medium">Hora do Sistema:</span>
                                <span className="font-mono">{currentDateTime.time}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmDistribute}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
