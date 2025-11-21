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
import { Intencao } from '@/types';

const intencaoSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
});

type IntencaoFormData = z.infer<typeof intencaoSchema>;

interface IntencaoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    intencao?: Intencao | null;
    onSave: (data: IntencaoFormData) => void;
    isLoading?: boolean;
}

export function IntencaoDialog({
    open,
    onOpenChange,
    intencao,
    onSave,
    isLoading,
}: IntencaoDialogProps) {
    const form = useForm<IntencaoFormData>({
        resolver: zodResolver(intencaoSchema),
        defaultValues: {
            nome: '',
        },
    });

    useEffect(() => {
        if (intencao) {
            form.reset({
                nome: intencao.nome,
            });
        } else {
            form.reset({
                nome: '',
            });
        }
    }, [intencao, form]);

    const handleSubmit = (data: IntencaoFormData) => {
        onSave(data);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{intencao ? 'Editar Intenção' : 'Nova Intenção'}</DialogTitle>
                    <DialogDescription>
                        {intencao
                            ? 'Atualize as informações da intenção.'
                            : 'Adicione uma nova intenção ao sistema.'}
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
                                        <Input placeholder="Ex: Venda" {...field} />
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
