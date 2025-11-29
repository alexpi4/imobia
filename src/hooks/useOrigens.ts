import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Origem } from '@/types';
import { toast } from 'sonner';

export function useOrigens() {
    const queryClient = useQueryClient();

    const { data: origens, isLoading, error } = useQuery({
        queryKey: ['origens'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('origens')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;
            return data as Origem[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (origem: Omit<Origem, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('origens')
                .insert([origem])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['origens'] });
            toast.success('Origem criada com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao criar origem: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...origem }: Partial<Origem> & { id: number }) => {
            const { data, error } = await supabase
                .from('origens')
                .update(origem)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['origens'] });
            toast.success('Origem atualizada com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar origem: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('origens')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['origens'] });
            toast.success('Origem excluída com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao excluir origem: ${error.message}`);
        },
    });

    return {
        origens,
        isLoading,
        error,
        createOrigem: createMutation.mutate,
        updateOrigem: updateMutation.mutate,
        deleteOrigem: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
