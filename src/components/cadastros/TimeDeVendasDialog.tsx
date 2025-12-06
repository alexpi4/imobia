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
import { TimeDeVendas } from '@/types';

const timeSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    responsavel: z.string().optional(),
    unidade: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    calendar_id: z.string().optional(),
});

type TimeFormData = z.infer<typeof timeSchema>;

interface TimeDeVendasDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    time?: TimeDeVendas | null;
    onSave: (data: TimeFormData) => void;
    isLoading?: boolean;
}

export function TimeDeVendasDialog({
    open,
    onOpenChange,
    time,
    onSave,
    isLoading,
}: TimeDeVendasDialogProps) {
    const form = useForm<TimeFormData>({
        resolver: zodResolver(timeSchema),
        defaultValues: {
            nome: '',
            responsavel: '',
            unidade: '',
            email: '',
            calendar_id: '',
        },
    });

    useEffect(() => {
        if (time) {
            form.reset({
                nome: time.nome,
                responsavel: time.responsavel || '',
                unidade: time.unidade || '',
                email: time.email || '',
                calendar_id: time.calendar_id || '',
            });
        } else {
            form.reset({
                nome: '',
                responsavel: '',
                unidade: '',
                email: '',
                calendar_id: '',
            });
        }
    }, [time, form]);

    const handleSubmit = (data: TimeFormData) => {
        onSave(data);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{time ? 'Editar Time' : 'Novo Time'}</DialogTitle>
                    <DialogDescription>
                        {time
                            ? 'Atualize as informações do time de vendas.'
                            : 'Adicione um novo time de vendas ao sistema.'}
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
                                        <Input placeholder="Ex: Equipe Alpha" {...field} />
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
                                        <Input placeholder="Ex: João Silva" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="unidade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unidade</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Criciúma" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                        <FormField
                            control={form.control}
                            name="calendar_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID do Calendário (Google Calendar)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: c_188...calendar.google.com" {...field} />
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
