import { useState, useEffect, useRef } from 'react';
import { usePipelines } from '@/hooks/usePipelines';
import { useUnidades } from '@/hooks/useUnidades';
import { usePipelineAutomations } from '@/hooks/usePipelineAutomations';
import { AutomationBuilder } from '@/components/automations/AutomationBuilder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Zap, Trash2, Edit, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PipelineAutomation } from '@/types';

export default function PipelineAutomationsPage() {
    const { unidades } = useUnidades();
    const [selectedUnidadeId, setSelectedUnidadeId] = useState<number | undefined>();

    const { pipelines } = usePipelines(selectedUnidadeId);
    const [selectedPipelineId, setSelectedPipelineId] = useState<number | undefined>();

    const { automations, isLoading, createAutomation, updateAutomation, deleteAutomation } = usePipelineAutomations(selectedPipelineId);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState<PipelineAutomation | undefined>();

    const hasAutoSelectedUnit = useRef(false);
    const hasAutoSelectedPipeline = useRef(false);

    // Auto-select logic (same as PipelinePage)
    useEffect(() => {
        if (unidades && unidades.length > 0 && !hasAutoSelectedUnit.current && selectedUnidadeId === undefined) {
            const criciuma = unidades.find(u => u.nome === 'Criciúma');
            if (criciuma) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedUnidadeId(criciuma.id);
                hasAutoSelectedUnit.current = true;
            }
        }
    }, [unidades, selectedUnidadeId]);

    useEffect(() => {
        if (pipelines && pipelines.length > 0 && !hasAutoSelectedPipeline.current && selectedPipelineId === undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedPipelineId(pipelines[0].id);
            hasAutoSelectedPipeline.current = true;
        }
    }, [pipelines, selectedPipelineId]);

    const selectedPipeline = pipelines?.find(p => p.id === selectedPipelineId);
    const stages = selectedPipeline?.etapas || [];

    const handleSave = async (data: any) => {
        try {
            if (editingAutomation) {
                await updateAutomation({ id: editingAutomation.id, ...data });
            } else {
                await createAutomation(data);
            }
            // Use setTimeout to ensure dialog closes after state updates and event propagation
            setTimeout(() => {
                setIsDialogOpen(false);
                setEditingAutomation(undefined);
            }, 0);
        } catch (error) {
            console.error("Failed to save automation:", error);
            // Toast is handled by the hook
        }
    };

    const handleEdit = (automation: PipelineAutomation) => {
        setEditingAutomation(automation);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta automação?')) {
            await deleteAutomation(id);
        }
    };

    const getStageName = (id: number | 'any') => {
        if (id === 'any') return 'Qualquer etapa';
        return stages.find(s => s.id === id)?.nome || 'Desconhecida';
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        Automações do Pipeline
                    </h1>
                    <p className="text-muted-foreground">Configure ações automáticas baseadas em eventos do pipeline.</p>
                </div>
                <Button onClick={() => { setEditingAutomation(undefined); setIsDialogOpen(true); }} disabled={!selectedPipelineId}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Automação
                </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card border rounded-lg">
                <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select value={selectedUnidadeId?.toString()} onValueChange={(v) => setSelectedUnidadeId(Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {unidades?.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.nome}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Pipeline</Label>
                    <Select value={selectedPipelineId?.toString()} onValueChange={(v) => setSelectedPipelineId(Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {pipelines?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nome}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="text-center py-8">Carregando automações...</div>
                ) : automations?.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        Nenhuma automação configurada para este pipeline.
                    </div>
                ) : (
                    automations?.map(automation => (
                        <Card key={automation.id}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{automation.nome}</h3>
                                        <Badge variant={automation.ativo ? 'default' : 'secondary'}>
                                            {automation.ativo ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>Quando mudar de: <strong>{getStageName(automation.gatilho_config.from || 'any')}</strong></span>
                                        <ArrowRight className="h-3 w-3" />
                                        <span>Para: <strong>{getStageName(automation.gatilho_config.to || 'any')}</strong></span>
                                    </div>
                                    <div className="text-sm">
                                        Ação: <Badge variant="outline" className="uppercase">{automation.acao_tipo}</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(automation)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(automation.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingAutomation ? 'Editar Automação' : 'Nova Automação'}</DialogTitle>
                    </DialogHeader>
                    {selectedPipelineId && (
                        <AutomationBuilder
                            pipelineId={selectedPipelineId}
                            stages={stages}
                            initialData={editingAutomation}
                            onSave={handleSave}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
