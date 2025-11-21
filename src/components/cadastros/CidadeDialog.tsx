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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Cidade } from '@/types';

const BRAZILIAN_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const cidadeSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    estado: z.string().min(2, 'Estado é obrigatório').max(2),
});

type CidadeFormData = z.infer<typeof cidadeSchema>;

interface CidadeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cidade?: Cidade | null;
    onSave: (data: CidadeFormData) => void;
    isLoading?: boolean;
}

export function CidadeDialog({
    open,
    onOpenChange,
    cidade,
    onSave,
    isLoading,
}: CidadeDialogProps) {
    const form = useForm<CidadeFormData>({
        resolver: zodResolver(cidadeSchema),
        defaultValues: {
            nome: '',
            estado: '',
        },
    });

    useEffect(() => {
        if (cidade) {
            form.reset({
                nome: cidade.nome,
                estado: cidade.estado,
            });
        } else {
            form.reset({
                nome: '',
                estado: '',
            });
        }
    }, [cidade, form]);

    const handleSubmit = (data: CidadeFormData) => {
        onSave(data);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{cidade ? 'Editar Cidade' : 'Nova Cidade'}</DialogTitle>
                    <DialogDescription>
                        {cidade
                            ? 'Atualize as informações da cidade.'
                            : 'Adicione uma nova cidade ao sistema.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: São Paulo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="estado"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {BRAZILIAN_STATES.map((state) => (
                                                <SelectItem key={state} value={state}>
                                                    {state}
                                                </SelectItem>
                                            ))}
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
