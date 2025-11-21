import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Integracao } from '@/types';
import { toast } from 'sonner';

export function useIntegracoes() {
    const queryClient = useQueryClient();

    const { data: integracoes, isLoading, error } = useQuery({
        queryKey: ['integracoes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('integracoes')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;
            return data as Integracao[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (integracao: Omit<Integracao, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('integracoes')
                .insert([integracao])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integracoes'] });
            toast.success('Integração criada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao criar integração: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...integracao }: Partial<Integracao> & { id: number }) => {
            const { data, error } = await supabase
                .from('integracoes')
                .update(integracao)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integracoes'] });
            toast.success('Integração atualizada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao atualizar integração: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('integracoes')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integracoes'] });
            toast.success('Integração excluída com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao excluir integração: ${error.message}`);
        },
    });

    return {
        integracoes,
        isLoading,
        error,
        createIntegracao: createMutation.mutate,
        updateIntegracao: updateMutation.mutate,
        deleteIntegracao: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
