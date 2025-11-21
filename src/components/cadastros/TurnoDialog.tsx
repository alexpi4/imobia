import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Turno } from '@/types';

const turnoSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    hora_inicio: z.string().min(1, 'Hora de início é obrigatória'),
    hora_fim: z.string().min(1, 'Hora de fim é obrigatória'),
    ativo: z.boolean(),
}).refine((data) => data.hora_fim > data.hora_inicio, {
    message: 'Hora de fim deve ser maior que hora de início',
    path: ['hora_fim'],
});

type TurnoFormData = z.infer<typeof turnoSchema>;

interface TurnoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    turno: Turno | null;
    onSave: (data: Omit<Turno, 'id' | 'created_at' | 'updated_at'>) => void;
    isLoading?: boolean;
}

export function TurnoDialog({ open, onOpenChange, turno, onSave, isLoading }: TurnoDialogProps) {
    const form = useForm<TurnoFormData>({
        resolver: zodResolver(turnoSchema),
        defaultValues: {
            nome: '',
            hora_inicio: '',
            hora_fim: '',
            ativo: true,
        },
    });

    useEffect(() => {
        if (turno) {
            form.reset({
                nome: turno.nome,
                hora_inicio: turno.hora_inicio,
                hora_fim: turno.hora_fim,
                ativo: turno.ativo,
            });
        } else {
            form.reset({
                nome: '',
                hora_inicio: '',
                hora_fim: '',
                ativo: true,
            });
        }
    }, [turno, form]);

    const onSubmit = (data: TurnoFormData) => {
        onSave(data);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{turno ? 'Editar Turno' : 'Novo Turno'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Turno</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Manhã, Tarde, Plantão Noturno" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="hora_inicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hora Início</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hora_fim"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hora Fim</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="ativo"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center space-x-2">
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <Label>Turno Ativo</Label>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
