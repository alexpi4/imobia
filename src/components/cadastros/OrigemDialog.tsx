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
import { Origem } from '@/types';

const origemSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
});

type OrigemFormData = z.infer<typeof origemSchema>;

interface OrigemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    origem?: Origem | null;
    onSave: (data: OrigemFormData) => void;
    isLoading?: boolean;
}

export function OrigemDialog({
    open,
    onOpenChange,
    origem,
    onSave,
    isLoading,
}: OrigemDialogProps) {
    const form = useForm<OrigemFormData>({
        resolver: zodResolver(origemSchema),
        defaultValues: {
            nome: '',
        },
    });

    useEffect(() => {
        if (origem) {
            form.reset({
                nome: origem.nome,
            });
        } else {
            form.reset({
                nome: '',
            });
        }
    }, [origem, form]);

    const handleSubmit = (data: OrigemFormData) => {
        onSave(data);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{origem ? 'Editar Origem' : 'Nova Origem'}</DialogTitle>
                    <DialogDescription>
                        {origem
                            ? 'Atualize as informações da origem.'
                            : 'Adicione uma nova origem ao sistema.'}
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
                                        <Input placeholder="Ex: Site" {...field} />
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
