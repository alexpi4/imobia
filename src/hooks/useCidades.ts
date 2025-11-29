import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cidade } from '@/types';
import { toast } from 'sonner';

export function useCidades() {
    const queryClient = useQueryClient();

    const { data: cidades, isLoading, error } = useQuery({
        queryKey: ['cidades'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cidades')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;
            return data as Cidade[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (cidade: Omit<Cidade, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('cidades')
                .insert([cidade])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cidades'] });
            toast.success('Cidade criada com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao criar cidade: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...cidade }: Partial<Cidade> & { id: number }) => {
            const { data, error } = await supabase
                .from('cidades')
                .update(cidade)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cidades'] });
            toast.success('Cidade atualizada com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar cidade: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('cidades')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cidades'] });
            toast.success('Cidade excluída com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao excluir cidade: ${error.message}`);
        },
    });

    return {
        cidades,
        isLoading,
        error,
        createCidade: createMutation.mutate,
        updateCidade: updateMutation.mutate,
        deleteCidade: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
