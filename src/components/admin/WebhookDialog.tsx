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
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Webhook } from '@/types';

const webhookSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    url: z.string().url('URL inválida'),
    tipo: z.enum(['manual', 'automatico']),
    secret: z.string().optional(),
    ativo: z.boolean(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

interface WebhookDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    webhook?: Webhook | null;
    onSave: (data: WebhookFormData & { eventos: string[] }) => void;
    isLoading?: boolean;
}

export function WebhookDialog({
    open,
    onOpenChange,
    webhook,
    onSave,
    isLoading,
}: WebhookDialogProps) {
    const form = useForm<WebhookFormData>({
        resolver: zodResolver(webhookSchema),
        defaultValues: {
            nome: webhook?.nome || '',
            url: webhook?.url || '',
            tipo: webhook?.tipo || 'manual',
            secret: webhook?.secret || '',
            ativo: webhook?.ativo ?? true,
        },
    });

    const handleSubmit = (data: WebhookFormData) => {
        onSave({ ...data, eventos: webhook?.eventos || [] });
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{webhook ? 'Editar Webhook' : 'Novo Webhook'}</DialogTitle>
                    <DialogDescription>
                        {webhook
                            ? 'Atualize as informações do webhook.'
                            : 'Adicione um novo webhook ao sistema.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Webhook RD Station" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://exemplo.com/webhook" {...field} />
                                    </FormControl>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="manual">Manual</SelectItem>
                                            <SelectItem value="automatico">Automático</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="secret"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Secret (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Chave secreta para autenticação
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ativo"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Ativo</FormLabel>
                                        <FormDescription>
                                            Webhook será executado quando ativo
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
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
