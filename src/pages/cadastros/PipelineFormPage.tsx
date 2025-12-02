import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePipelines } from '@/hooks/usePipelines';
import { useUnidades } from '@/hooks/useUnidades';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const stageSchema = z.object({
    id: z.number().optional(),
    nome: z.string().min(1, 'Nome da etapa é obrigatório'),
    cor: z.string(),
    obrigatorio: z.boolean(),
});

const pipelineSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    descricao: z.string().optional(),
    unidade_id: z.string().min(1, 'Selecione uma unidade'),
    tipo: z.enum(['vendas', 'locacao', 'custom']),
    ativo: z.boolean(),
    etapas: z.array(stageSchema).min(1, 'Adicione pelo menos uma etapa'),
});

type PipelineFormData = z.infer<typeof pipelineSchema>;

// Sortable Item Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableStageItem({ id, index, register, remove, watch, setValue, fieldsLength }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 border rounded-lg bg-card mb-4">
            <div {...attributes} {...listeners} className="cursor-move text-muted-foreground outline-none">
                <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label className="text-xs">Nome da Etapa</Label>
                    <Input {...register(`etapas.${index}.nome`)} />
                </div>

                <div className="space-y-1">
                    <Label className="text-xs">Cor (Hex ou Tailwind)</Label>
                    <div className="flex gap-2">
                        <Input {...register(`etapas.${index}.cor`)} className="w-full" />
                        <div
                            className="w-10 h-10 rounded border"
                            style={{ backgroundColor: watch(`etapas.${index}.cor`) }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-6">
                    <Switch
                        checked={watch(`etapas.${index}.obrigatorio`)}
                        onCheckedChange={(checked) => setValue(`etapas.${index}.obrigatorio`, checked)}
                    />
                    <Label className="text-sm">Obrigatório</Label>
                </div>
            </div>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={() => remove(index)}
                disabled={fieldsLength <= 1}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

export default function PipelineFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { pipelines, createPipeline, updatePipeline, createStage, updateStage, deleteStage } = usePipelines();
    const { unidades } = useUnidades();
    const isEditing = !!id;

    const form = useForm<PipelineFormData>({
        resolver: zodResolver(pipelineSchema),
        defaultValues: {
            nome: '',
            descricao: '',
            unidade_id: '',
            tipo: 'vendas',
            ativo: true,
            etapas: [
                { nome: 'Novo', cor: '#dbeafe', obrigatorio: false },
                { nome: 'Qualificação', cor: '#fef9c3', obrigatorio: false },
                { nome: 'Visita', cor: '#f3e8ff', obrigatorio: false },
                { nome: 'Ganho', cor: '#dcfce7', obrigatorio: false },
                { nome: 'Perdido', cor: '#fee2e2', obrigatorio: false },
            ],
        },
    });

    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: 'etapas',
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = fields.findIndex((item) => item.id === active.id);
            const newIndex = fields.findIndex((item) => item.id === over?.id);
            move(oldIndex, newIndex);
        }
    };

    useEffect(() => {
        if (isEditing && pipelines) {
            const pipeline = pipelines.find(p => p.id === Number(id));

            if (pipeline) {
                // Sort stages by 'ordem' before setting form values
                const sortedStages = [...(pipeline.etapas || [])].sort((a, b) => a.ordem - b.ordem);

                // Ensure correct types for Select fields
                const unidadeId = pipeline.unidade_id ? String(pipeline.unidade_id) : '';
                let tipoRaw = pipeline.tipo ? String(pipeline.tipo).toLowerCase().trim() : 'vendas';

                // Handle potential data inconsistencies
                if (tipoRaw === 'locação') tipoRaw = 'locacao';

                const tipo = tipoRaw;

                const formData = {
                    nome: pipeline.nome,
                    descricao: pipeline.descricao || '',
                    unidade_id: unidadeId,
                    tipo: tipo as "vendas" | "locacao" | "custom",
                    ativo: pipeline.ativo,
                    etapas: sortedStages.map(e => ({
                        id: e.id,
                        nome: e.nome,
                        cor: e.cor,
                        obrigatorio: e.obrigatorio
                    })),
                };

                form.reset(formData);
            }
        }
    }, [isEditing, pipelines, id, form]);

    const onSubmit = async (data: PipelineFormData) => {
        try {
            let pipelineId = Number(id);

            if (isEditing) {
                await updatePipeline.mutateAsync({
                    id: pipelineId,
                    nome: data.nome,
                    descricao: data.descricao,
                    unidade_id: Number(data.unidade_id),
                    tipo: data.tipo,
                    ativo: data.ativo,
                });
            } else {
                const newPipeline = await createPipeline.mutateAsync({
                    nome: data.nome,
                    descricao: data.descricao,
                    unidade_id: Number(data.unidade_id),
                    tipo: data.tipo,
                    ativo: data.ativo,
                    created_by: profile?.id || 0,
                });
                pipelineId = newPipeline.id;
            }

            // Handle stages
            const existingStages = pipelines?.find(p => p.id === pipelineId)?.etapas || [];
            const currentStageIds = data.etapas.map(e => e.id).filter(Boolean);

            // Delete removed stages
            const stagesToDelete = existingStages.filter(s => !currentStageIds.includes(s.id));
            for (const stage of stagesToDelete) {
                await deleteStage.mutateAsync(stage.id);
            }

            // Step 1: Set all existing stages to temporary negative orders to avoid unique constraint conflicts
            // This is necessary because we have a unique constraint on (pipeline_id, ordem)
            for (const [index, stage] of data.etapas.entries()) {
                if (stage.id) {
                    await updateStage.mutateAsync({
                        id: stage.id,
                        nome: stage.nome,
                        cor: stage.cor,
                        obrigatorio: stage.obrigatorio,
                        ordem: -(index + 1), // Temporary negative order
                    });
                }
            }

            // Step 2: Update to final positive orders and create new stages
            for (const [index, stage] of data.etapas.entries()) {
                if (stage.id) {
                    await updateStage.mutateAsync({
                        id: stage.id,
                        nome: stage.nome,
                        cor: stage.cor,
                        obrigatorio: stage.obrigatorio,
                        ordem: index,
                    });
                } else {
                    await createStage.mutateAsync({
                        pipeline_id: pipelineId,
                        nome: stage.nome,
                        cor: stage.cor,
                        obrigatorio: stage.obrigatorio,
                        ordem: index,
                    });
                }
            }

            toast.success(`Pipeline ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
            navigate('/cadastros/pipelines');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar pipeline');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/cadastros/pipelines')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">{isEditing ? 'Editar Pipeline' : 'Novo Pipeline'}</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nome"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Pipeline</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Vendas Residencial" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="unidade_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unidade</FormLabel>
                                            <Select
                                                key={`unidade-${field.value}`}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione a unidade" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {unidades?.map((unidade) => (
                                                        <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                                            {unidade.nome}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tipo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo</FormLabel>
                                            <Select
                                                key={`tipo-${field.value}`}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="vendas">Vendas</SelectItem>
                                                    <SelectItem value="locacao">Locação</SelectItem>
                                                    <SelectItem value="custom">Personalizado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="ativo"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-8">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel>Pipeline Ativo</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="descricao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Descrição opcional" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Etapas do Pipeline</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ nome: 'Nova Etapa', cor: '#e5e7eb', obrigatorio: false })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Etapa
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={fields}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {fields.map((field, index) => (
                                        <SortableStageItem
                                            key={field.id}
                                            id={field.id}
                                            index={index}
                                            register={form.register}
                                            remove={remove}
                                            watch={form.watch}
                                            setValue={form.setValue}
                                            fieldsLength={fields.length}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>

                            {form.formState.errors.etapas && (
                                <p className="text-sm text-red-500">{form.formState.errors.etapas.message}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/cadastros/pipelines')}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Pipeline'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
