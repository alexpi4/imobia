import { useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Integracao } from '@/types';

const integracaoSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    url: z.string().url('URL inválida').min(1, 'URL é obrigatória'),
    status: z.string().min(1, 'Status é obrigatório'),
});

type IntegracaoFormData = z.infer<typeof integracaoSchema>;

interface IntegracaoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    integracao?: Integracao | null;
    onSave: (data: IntegracaoFormData) => void;
    isLoading?: boolean;
}

export function IntegracaoDialog({
    open,
    onOpenChange,
    integracao,
    onSave,
    isLoading,
}: IntegracaoDialogProps) {
    const form = useForm<IntegracaoFormData>({
        resolver: zodResolver(integracaoSchema),
        defaultValues: {
            nome: '',
            url: '',
            status: 'ativo',
        },
    });

    useEffect(() => {
        if (integracao) {
            form.reset({
                nome: integracao.nome,
                url: integracao.url,
                status: integracao.status,
            });
        } else {
            form.reset({
                nome: '',
                url: '',
                status: 'ativo',
            });
        }
    }, [integracao, form]);

    const handleSubmit = (data: IntegracaoFormData) => {
        onSave(data);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{integracao ? 'Editar Integração' : 'Nova Integração'}</DialogTitle>
                    <DialogDescription>
                        {integracao
                            ? 'Atualize as informações da integração.'
                            : 'Adicione uma nova integração ao sistema.'}
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
                                        <Input placeholder="Ex: RD Station" {...field} />
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
                                        <Input placeholder="https://api.example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                        </SelectContent>
                                    </Select>
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
