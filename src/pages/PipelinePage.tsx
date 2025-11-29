import { useState, useMemo, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLeads } from '@/hooks/useLeads';
import { usePipelines } from '@/hooks/usePipelines';
import { useUnidades } from '@/hooks/useUnidades';
import { Lead } from '@/types';
import { PipelineColumn } from '@/components/pipeline/PipelineColumn';
import { LeadCard } from '@/components/pipeline/LeadCard';
import { LeadDialog } from '@/components/leads/LeadDialog';
import { LeadViewDialog } from '@/components/leads/LeadViewDialog';
import { toast } from 'sonner';

export default function PipelinePage() {
    const { leads, isLoading: leadsLoading, updateLeadAsync, createLeadAsync, isUpdating, isCreating } = useLeads();
    const { unidades } = useUnidades();
    const [selectedUnidadeId, setSelectedUnidadeId] = useState<number | undefined>();
    const { pipelines, isLoading: pipelinesLoading } = usePipelines(selectedUnidadeId);
    const [selectedPipelineId, setSelectedPipelineId] = useState<number | undefined>();
    const [activeId, setActiveId] = useState<string | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const hasAutoSelectedUnit = useRef(false);
    const hasAutoSelectedPipeline = useRef(false);

    // Auto-select "Criciúma" unit on load (only once)
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

    // Get active pipelines for selected unit
    const activePipelines = useMemo(() => {
        return pipelines?.filter(p => p.ativo) || [];
    }, [pipelines]);

    // Auto-select first pipeline when pipelines load (only once)
    useEffect(() => {
        if (activePipelines.length > 0 && !hasAutoSelectedPipeline.current && selectedPipelineId === undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedPipelineId(activePipelines[0].id);
            hasAutoSelectedPipeline.current = true;
        }
    }, [activePipelines, selectedPipelineId]);

    // Get selected pipeline
    const selectedPipeline = useMemo(() => {
        return pipelines?.find(p => p.id === selectedPipelineId);
    }, [pipelines, selectedPipelineId]);

    // Get stages from selected pipeline
    const stages = useMemo(() => {
        return selectedPipeline?.etapas || [];
    }, [selectedPipeline]);

    // Group leads by stage
    const leadsByStage = useMemo(() => {
        if (!leads || !selectedPipeline) return {};

        return stages.reduce((acc, stage) => {
            acc[stage.id] = leads.filter(lead =>
                lead.pipeline_id === selectedPipelineId &&
                lead.etapa_id === stage.id
            );
            return acc;
        }, {} as Record<number, Lead[]>);
    }, [leads, stages, selectedPipeline, selectedPipelineId]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeLeadId = active.id as string;
        let overStageId = Number(over.id);

        // Check if dropped on a lead (over.id is a lead ID)
        // We check if over.id exists in leads. If so, get its stage.
        const overLead = leads?.find(l => l.id.toString() === over.id.toString());
        if (overLead) {
            overStageId = overLead.etapa_id ?? overStageId;
        }

        // Find the lead being dragged
        const activeLead = leads?.find(lead => lead.id.toString() === activeLeadId);

        if (activeLead && activeLead.etapa_id !== overStageId && stages.some(s => s.id === overStageId)) {
            // Update the lead's pipeline stage
            try {
                await updateLeadAsync({
                    id: activeLead.id,
                    etapa_id: overStageId,
                    pipeline_id: selectedPipelineId,
                });
            } catch (error) {
                console.error('Erro ao mover lead:', error);
                toast.error(`Erro ao mover lead: ${(error as Error).message || error}`);
            }
        }

        setActiveId(null);
    };

    const handleCardClick = (lead: Lead) => {
        setSelectedLead(lead);
        setIsViewDialogOpen(true);
    };

    const handleEditClick = () => {
        setIsViewDialogOpen(false);
        setIsDialogOpen(true);
    };

    const handleSaveLead = async (data: Partial<Lead>) => {
        try {
            if (selectedLead) {
                await updateLeadAsync({ id: selectedLead.id, ...data });
                toast.success('Lead atualizado com sucesso!');
            } else {
                await createLeadAsync(data as any);
                toast.success('Lead criado com sucesso!');
            }
            setIsDialogOpen(false);
            setSelectedLead(null);
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            toast.error('Erro ao salvar lead');
        }
    };

    const activeLead = leads?.find(lead => lead.id.toString() === activeId);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (leadsLoading || pipelinesLoading) {
        return <div className="p-8 text-center">Carregando...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    {selectedPipeline ? selectedPipeline.nome : 'Pipeline de Vendas'}
                </h1>
            </div>

            {/* Unit and Pipeline Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card border rounded-lg">
                <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select
                        value={selectedUnidadeId?.toString()}
                        onValueChange={(value) => {
                            setSelectedUnidadeId(Number(value));
                            setSelectedPipelineId(undefined);
                        }}
                    >
                        <SelectTrigger id="unidade">
                            <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                        <SelectContent>
                            {unidades?.map((unidade) => (
                                <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                    {unidade.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pipeline">Pipeline</Label>
                    <Select
                        value={selectedPipelineId?.toString()}
                        onValueChange={(value) => setSelectedPipelineId(Number(value))}
                        disabled={!selectedUnidadeId || activePipelines.length === 0}
                    >
                        <SelectTrigger id="pipeline">
                            <SelectValue placeholder="Selecione um pipeline" />
                        </SelectTrigger>
                        <SelectContent>
                            {activePipelines.map((pipeline) => (
                                <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                                    {pipeline.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!selectedUnidadeId && (
                <div className="text-center py-12 text-muted-foreground">
                    Selecione uma unidade para visualizar os pipelines
                </div>
            )}

            {selectedUnidadeId && activePipelines.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    Nenhum pipeline ativo encontrado para esta unidade
                </div>
            )}

            {selectedUnidadeId && selectedPipelineId && stages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    Este pipeline não possui etapas configuradas
                </div>
            )}

            {selectedUnidadeId && selectedPipelineId && stages.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
                        {stages.map((stage) => (
                            <PipelineColumn
                                key={stage.id}
                                stage={stage}
                                leads={leadsByStage[stage.id] || []}
                                onCardClick={handleCardClick}
                            />
                        ))}
                    </div>
                    <DragOverlay>
                        {activeLead ? <LeadCard lead={activeLead} /> : null}
                    </DragOverlay>
                </DndContext>
            )}

            <LeadDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                lead={selectedLead}
                onSave={handleSaveLead}
                isLoading={isUpdating || isCreating}
            />

            <LeadViewDialog
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                lead={selectedLead}
                onEdit={handleEditClick}
            />
        </div>
    );
}
