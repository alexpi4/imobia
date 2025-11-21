import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types';
import { useOrigens } from '@/hooks/useOrigens';
import { useIntencoes } from '@/hooks/useIntencoes';
import { useCidades } from '@/hooks/useCidades';
import { useUnidades } from '@/hooks/useUnidades';
import { usePipelines } from '@/hooks/usePipelines';
import { useAuth } from '@/contexts/AuthContext';

const leadSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    telefone: z.string().min(1, 'Telefone é obrigatório'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    origem: z.string().min(1, 'Origem é obrigatória'),
    intencao: z.string().min(1, 'Intenção é obrigatória'),
    cidade: z.string().optional(),
    unidade: z.string().min(1, 'Unidade é obrigatória'),
    urgencia: z.enum(['Normal', 'Alta', 'Crítica']),
    pipeline_id: z.string().min(1, 'Pipeline é obrigatório'),
    etapa_id: z.string().min(1, 'Etapa é obrigatória'),
    imovel: z.string().optional(),
    valor: z.string().optional(),
    resumo: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead?: Lead | null;
    onSave: (data: any) => void;
    isLoading?: boolean;
}

export function LeadDialog({
    open,
    onOpenChange,
    lead,
    onSave,
    isLoading,
}: LeadDialogProps) {
    const { profile } = useAuth();
    const { origens } = useOrigens();
    const { intencoes } = useIntencoes();
    const { cidades } = useCidades();
    const { unidades } = useUnidades();

    // State to track selected unidade for filtering pipelines
    const [selectedUnidadeId, setSelectedUnidadeId] = useState<number | undefined>();

    // Fetch pipelines for the selected unidade
    const { pipelines } = usePipelines(selectedUnidadeId);

    // Get active pipelines
    const activePipelines = useMemo(() => {
        return pipelines?.filter(p => p.ativo) || [];
    }, [pipelines]);

    const form = useForm<LeadFormData>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            nome: lead?.nome || '',
            telefone: lead?.telefone || '',
            email: lead?.email || '',
            origem: lead?.origem || '',
            intencao: lead?.intencao || '',
            cidade: lead?.cidade || '',
            unidade: lead?.unidade || '',
            urgencia: lead?.urgencia || 'Normal',
            pipeline_id: lead?.pipeline_id?.toString() || '',
            etapa_id: lead?.etapa_id?.toString() || '',
            imovel: lead?.imovel || '',
            valor: lead?.valor?.toString() || '',
            resumo: lead?.resumo || '',
        },
    });

    // Watch for unidade changes to update selected unidade ID
    const watchedUnidade = form.watch('unidade');

    useEffect(() => {
        if (watchedUnidade) {
            const unidade = unidades?.find(u => u.sigla === watchedUnidade);
            if (unidade) {
                setSelectedUnidadeId(unidade.id);
            }
        }
    }, [watchedUnidade, unidades]);

    // Watch for pipeline changes to get stages
    const watchedPipelineId = form.watch('pipeline_id');

    const selectedPipeline = useMemo(() => {
        return activePipelines.find(p => p.id.toString() === watchedPipelineId);
    }, [activePipelines, watchedPipelineId]);

    const availableStages = useMemo(() => {
        return selectedPipeline?.etapas || [];
    }, [selectedPipeline]);

    // Auto-select first pipeline and first stage when unit changes
    useEffect(() => {
        if (activePipelines.length > 0 && !watchedPipelineId) {
            const firstPipeline = activePipelines[0];
            form.setValue('pipeline_id', firstPipeline.id.toString());

            if (firstPipeline.etapas && firstPipeline.etapas.length > 0) {
                form.setValue('etapa_id', firstPipeline.etapas[0].id.toString());
            }
        }
    }, [activePipelines, watchedPipelineId, form]);

    // Auto-select first stage when pipeline changes
    useEffect(() => {
        if (availableStages.length > 0 && watchedPipelineId) {
            const currentEtapaId = form.getValues('etapa_id');
            const isCurrentEtapaValid = availableStages.some(s => s.id.toString() === currentEtapaId);

            if (!isCurrentEtapaValid) {
                form.setValue('etapa_id', availableStages[0].id.toString());
            }
        }
    }, [availableStages, watchedPipelineId, form]);

    useEffect(() => {
        if (open && lead) {
            // Find unidade to set selectedUnidadeId
            const unidade = unidades?.find(u => u.sigla === lead.unidade);
            if (unidade) {
                setSelectedUnidadeId(unidade.id);
            }

            form.reset({
                nome: lead.nome,
                telefone: lead.telefone,
                email: lead.email || '',
                origem: lead.origem,
                intencao: lead.intencao,
                cidade: lead.cidade || '',
                unidade: lead.unidade,
                urgencia: lead.urgencia,
                pipeline_id: lead.pipeline_id?.toString() || '',
                etapa_id: lead.etapa_id?.toString() || '',
                imovel: lead.imovel || '',
                valor: lead.valor?.toString() || '',
                resumo: lead.resumo || '',
            });
        } else if (open && !lead) {
            form.reset({
                nome: '',
                telefone: '',
                email: '',
                origem: '',
                intencao: '',
                cidade: '',
                unidade: '',
                urgencia: 'Normal',
                pipeline_id: '',
                etapa_id: '',
                imovel: '',
                valor: '',
                resumo: '',
            });
            setSelectedUnidadeId(undefined);
        }
    }, [open, lead, form, unidades]);

    const handleSubmit = (data: LeadFormData) => {
        const payload = {
            ...data,
            valor: data.valor ? parseFloat(data.valor) : null,
            pipeline_id: parseInt(data.pipeline_id),
            etapa_id: parseInt(data.etapa_id),
            criado_por: profile?.id,
            atribuido: false,
            // Keep old pipeline field for backward compatibility (optional)
            pipeline: selectedPipeline?.etapas?.find(e => e.id.toString() === data.etapa_id)?.nome || 'Novo',
        };
        onSave(payload);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{lead ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
                    <DialogDescription>
                        {lead
                            ? 'Atualize as informações do lead.'
                            : 'Adicione um novo lead ao sistema.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome completo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="telefone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(00) 00000-0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="origem"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Origem *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {origens?.map((origem) => (
                                                    <SelectItem key={origem.id} value={origem.nome}>
                                                        {origem.nome}
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
                                name="intencao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Intenção *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {intencoes?.map((intencao) => (
                                                    <SelectItem key={intencao.id} value={intencao.nome}>
                                                        {intencao.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cidade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cidade</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {cidades?.map((cidade) => (
                                                    <SelectItem key={cidade.id} value={cidade.nome}>
                                                        {cidade.nome} - {cidade.estado}
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
                                name="unidade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidade *</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                // Reset pipeline and stage when unit changes
                                                form.setValue('pipeline_id', '');
                                                form.setValue('etapa_id', '');
                                            }}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {unidades?.map((unidade) => (
                                                    <SelectItem key={unidade.id} value={unidade.sigla}>
                                                        {unidade.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="urgencia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Urgência *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Normal">Normal</SelectItem>
                                                <SelectItem value="Alta">Alta</SelectItem>
                                                <SelectItem value="Crítica">Crítica</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="pipeline_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pipeline *</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                // Reset stage when pipeline changes
                                                form.setValue('etapa_id', '');
                                            }}
                                            value={field.value}
                                            disabled={!selectedUnidadeId || activePipelines.length === 0}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {activePipelines.map((pipeline) => (
                                                    <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                                                        {pipeline.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="etapa_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Etapa *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!watchedPipelineId || availableStages.length === 0}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableStages.map((stage) => (
                                                <SelectItem key={stage.id} value={stage.id.toString()}>
                                                    {stage.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="imovel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Imóvel</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tipo de imóvel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="valor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="resumo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resumo</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Observações sobre o lead..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
