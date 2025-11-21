import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Unidade } from '@/types';
import { toast } from 'sonner';

export function useUnidades() {
    const queryClient = useQueryClient();

    const { data: unidades, isLoading, error } = useQuery({
        queryKey: ['unidades'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('unidades')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;
            return data as Unidade[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (unidade: Omit<Unidade, 'id'>) => {
            const { data, error } = await supabase
                .from('unidades')
                .insert([unidade])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unidades'] });
            toast.success('Unidade criada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao criar unidade: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...unidade }: Partial<Unidade> & { id: number }) => {
            const { data, error } = await supabase
                .from('unidades')
                .update(unidade)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unidades'] });
            toast.success('Unidade atualizada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao atualizar unidade: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('unidades')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unidades'] });
            toast.success('Unidade excluída com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao excluir unidade: ${error.message}`);
        },
    });

    return {
        unidades,
        isLoading,
        error,
        createUnidade: createMutation.mutate,
        updateUnidade: updateMutation.mutate,
        deleteUnidade: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
