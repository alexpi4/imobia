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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePipelines } from '@/hooks/usePipelines';
import { useUnidades } from '@/hooks/useUnidades';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

export default function PipelineFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
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

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'etapas',
    });

    useEffect(() => {
        if (isEditing && pipelines) {
            const pipeline = pipelines.find(p => p.id === Number(id));
            if (pipeline) {
                form.reset({
                    nome: pipeline.nome,
                    descricao: pipeline.descricao || '',
                    unidade_id: pipeline.unidade_id.toString(),
                    tipo: pipeline.tipo,
                    ativo: pipeline.ativo,
                    etapas: pipeline.etapas?.map(e => ({
                        id: e.id,
                        nome: e.nome,
                        cor: e.cor,
                        obrigatorio: e.obrigatorio
                    })) || [],
                });
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
                    created_by: user?.id ? Number(user.id) : 0,
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

            // Create or Update stages
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

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Pipeline</Label>
                                <Input id="nome" {...form.register('nome')} placeholder="Ex: Vendas Residencial" />
                                {form.formState.errors.nome && (
                                    <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unidade">Unidade</Label>
                                <Select
                                    onValueChange={(value) => form.setValue('unidade_id', value)}
                                    value={form.watch('unidade_id')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a unidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unidades?.map((unidade) => (
                                            <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                                {unidade.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.unidade_id && (
                                    <p className="text-sm text-red-500">{form.formState.errors.unidade_id.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo</Label>
                                <Select
                                    onValueChange={(value: any) => form.setValue('tipo', value)}
                                    value={form.watch('tipo')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vendas">Vendas</SelectItem>
                                        <SelectItem value="locacao">Locação</SelectItem>
                                        <SelectItem value="custom">Personalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2 pt-8">
                                <Switch
                                    checked={form.watch('ativo')}
                                    onCheckedChange={(checked) => form.setValue('ativo', checked)}
                                />
                                <Label>Pipeline Ativo</Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Input id="descricao" {...form.register('descricao')} placeholder="Descrição opcional" />
                        </div>
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
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                                <div className="cursor-move text-muted-foreground">
                                    <GripVertical className="h-5 w-5" />
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Nome da Etapa</Label>
                                        <Input {...form.register(`etapas.${index}.nome`)} />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">Cor (Hex ou Tailwind)</Label>
                                        <div className="flex gap-2">
                                            <Input {...form.register(`etapas.${index}.cor`)} className="w-full" />
                                            <div
                                                className="w-10 h-10 rounded border"
                                                style={{ backgroundColor: form.watch(`etapas.${index}.cor`) }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-6">
                                        <Switch
                                            checked={form.watch(`etapas.${index}.obrigatorio`)}
                                            onCheckedChange={(checked) => form.setValue(`etapas.${index}.obrigatorio`, checked)}
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
                                    disabled={fields.length <= 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
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
        </div>
    );
}
