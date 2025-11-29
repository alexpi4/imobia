import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TimeDeVendas } from '@/types';
import { toast } from 'sonner';

export function useTimeDeVendas() {
    const queryClient = useQueryClient();

    const { data: times, isLoading, error } = useQuery({
        queryKey: ['time-de-vendas'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('time_de_vendas')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;
            return data as TimeDeVendas[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (time: Omit<TimeDeVendas, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('time_de_vendas')
                .insert([time])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-de-vendas'] });
            toast.success('Time criado com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao criar time: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...time }: Partial<TimeDeVendas> & { id: number }) => {
            const { data, error } = await supabase
                .from('time_de_vendas')
                .update(time)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-de-vendas'] });
            toast.success('Time atualizado com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar time: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('time_de_vendas')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['time-de-vendas'] });
            toast.success('Time excluído com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao excluir time: ${error.message}`);
        },
    });

    return {
        times,
        isLoading,
        error,
        createTime: createMutation.mutate,
        updateTime: updateMutation.mutate,
        deleteTime: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
