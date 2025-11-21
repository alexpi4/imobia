import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Intencao } from '@/types';
import { toast } from 'sonner';

export function useIntencoes() {
    const queryClient = useQueryClient();

    const { data: intencoes, isLoading, error } = useQuery({
        queryKey: ['intencoes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('intencoes')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;
            return data as Intencao[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (intencao: Omit<Intencao, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('intencoes')
                .insert([intencao])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intencoes'] });
            toast.success('Intenção criada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao criar intenção: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...intencao }: Partial<Intencao> & { id: number }) => {
            const { data, error } = await supabase
                .from('intencoes')
                .update(intencao)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intencoes'] });
            toast.success('Intenção atualizada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao atualizar intenção: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('intencoes')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intencoes'] });
            toast.success('Intenção excluída com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao excluir intenção: ${error.message}`);
        },
    });

    return {
        intencoes,
        isLoading,
        error,
        createIntencao: createMutation.mutate,
        updateIntencao: updateMutation.mutate,
        deleteIntencao: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
