import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { PipelineStage, PipelineAutomation } from '@/types';
import { Loader2, ArrowRight } from 'lucide-react';

const automationSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    gatilho: z.literal('stage_change'),
    gatilho_config: z.object({
        from: z.union([z.number(), z.literal('any')]),
        to: z.union([z.number(), z.literal('any')]),
    }),
    acao_tipo: z.enum(['email', 'webhook', 'whatsapp', 'task']),
    acao_config: z.record(z.string(), z.any()),
    ativo: z.boolean(),
});

type AutomationFormValues = z.infer<typeof automationSchema>;

interface AutomationBuilderProps {
    pipelineId: number;
    stages: PipelineStage[];
    initialData?: PipelineAutomation;
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
}

export function AutomationBuilder({ pipelineId, stages, initialData, onSave, onCancel }: AutomationBuilderProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AutomationFormValues>({
        resolver: zodResolver(automationSchema),
        defaultValues: initialData ? {
            nome: initialData.nome,
            gatilho: initialData.gatilho,
            gatilho_config: initialData.gatilho_config,
            acao_tipo: initialData.acao_tipo,
            acao_config: initialData.acao_config,
            ativo: initialData.ativo,
        } : {
            nome: '',
            gatilho: 'stage_change',
            gatilho_config: { from: 'any', to: 'any' },
            acao_tipo: 'email',
            acao_config: {},
            ativo: true,
        },
    });

    const actionType = form.watch('acao_tipo');

    const handleSubmit: SubmitHandler<AutomationFormValues> = async (data) => {
        setIsSubmitting(true);
        try {
            await onSave({ ...data, pipeline_id: pipelineId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid = (errors: any) => console.error("Form validation errors:", errors);

    return (
        <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="nome">Nome da Automação</Label>
                <Input id="nome" {...form.register('nome')} placeholder="Ex: Enviar email ao mover para Negociação" />
                {form.formState.errors.nome && (
                    <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trigger Section */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-lg">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">1</div>
                            Quando...
                        </div>

                        <div className="space-y-2">
                            <Label>Gatilho</Label>
                            <Select
                                value={form.watch('gatilho')}
                                onValueChange={(v: any) => form.setValue('gatilho', v)}
                                disabled
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="stage_change">Mudança de Etapa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2 items-end">
                            <div className="space-y-2">
                                <Label>De</Label>
                                <Select
                                    value={form.watch('gatilho_config.from')?.toString()}
                                    onValueChange={(v) => form.setValue('gatilho_config.from', v === 'any' ? 'any' : Number(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Qualquer etapa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Qualquer etapa</SelectItem>
                                        {stages.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-center pb-3">
                                <ArrowRight className="text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <Label>Para</Label>
                                <Select
                                    value={form.watch('gatilho_config.to')?.toString()}
                                    onValueChange={(v) => form.setValue('gatilho_config.to', v === 'any' ? 'any' : Number(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Qualquer etapa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Qualquer etapa</SelectItem>
                                        {stages.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Section */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-lg">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">2</div>
                            Então...
                        </div>

                        <div className="space-y-2">
                            <Label>Ação</Label>
                            <Select
                                value={actionType}
                                onValueChange={(v: any) => form.setValue('acao_tipo', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="email">Enviar Email</SelectItem>
                                    <SelectItem value="webhook">Disparar Webhook</SelectItem>
                                    <SelectItem value="whatsapp">Enviar WhatsApp</SelectItem>
                                    <SelectItem value="task">Criar Tarefa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dynamic Action Config */}
                        {actionType === 'email' && (
                            <div className="space-y-2">
                                <Label>Assunto</Label>
                                <Input {...form.register('acao_config.subject')} placeholder="Assunto do email" />
                                <Label>Corpo</Label>
                                <Input {...form.register('acao_config.body')} placeholder="Conteúdo do email" />
                            </div>
                        )}

                        {actionType === 'webhook' && (
                            <div className="space-y-2">
                                <Label>URL</Label>
                                <Input {...form.register('acao_config.url')} placeholder="https://api.exemplo.com/webhook" />
                            </div>
                        )}

                        {actionType === 'whatsapp' && (
                            <div className="space-y-2">
                                <Label>Mensagem</Label>
                                <Input {...form.register('acao_config.message')} placeholder="Mensagem do WhatsApp" />
                            </div>
                        )}

                        {actionType === 'task' && (
                            <div className="space-y-2">
                                <Label>Título da Tarefa</Label>
                                <Input {...form.register('acao_config.title')} placeholder="Título da tarefa" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Automação
                </Button>
            </div>
        </form>
    );
}
