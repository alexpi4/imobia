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
import { Unidade } from '@/types';

const unidadeSchema = z.object({
    sigla: z.string().min(1, 'Sigla é obrigatória').max(3, 'Sigla deve ter no máximo 3 caracteres'),
    nome: z.string().min(1, 'Nome é obrigatório'),
    responsavel: z.string().optional(),
});

type UnidadeFormData = z.infer<typeof unidadeSchema>;

interface UnidadeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unidade?: Unidade | null;
    onSave: (data: UnidadeFormData) => void;
    isLoading?: boolean;
}

export function UnidadeDialog({
    open,
    onOpenChange,
    unidade,
    onSave,
    isLoading,
}: UnidadeDialogProps) {
    const form = useForm<UnidadeFormData>({
        resolver: zodResolver(unidadeSchema),
        defaultValues: {
            sigla: '',
            nome: '',
            responsavel: '',
        },
    });

    useEffect(() => {
        if (unidade) {
            form.reset({
                sigla: unidade.sigla,
                nome: unidade.nome,
                responsavel: unidade.responsavel || '',
            });
        } else {
            form.reset({
                sigla: '',
                nome: '',
                responsavel: '',
            });
        }
    }, [unidade, form]);

    const handleSubmit = (data: UnidadeFormData) => {
        onSave(data);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{unidade ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
                    <DialogDescription>
                        {unidade
                            ? 'Atualize as informações da unidade.'
                            : 'Adicione uma nova unidade ao sistema.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="sigla"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sigla *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: CR"
                                            maxLength={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Criciúma" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="responsavel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Responsável</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Maria Silva" {...field} />
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
