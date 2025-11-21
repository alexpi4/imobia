import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Webhook, HistoricoWebhook } from '@/types';
import { toast } from 'sonner';

export function useWebhooks() {
    const queryClient = useQueryClient();

    const { data: webhooks, isLoading, error } = useQuery({
        queryKey: ['webhooks'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('webhooks')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;
            return data as Webhook[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (webhook: Omit<Webhook, 'id' | 'created_at' | 'updated_at' | 'total_execucoes' | 'ultima_execucao'>) => {
            const { data, error } = await supabase
                .from('webhooks')
                .insert([webhook])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webhooks'] });
            toast.success('Webhook criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao criar webhook: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...webhook }: Partial<Webhook> & { id: number }) => {
            const { data, error } = await supabase
                .from('webhooks')
                .update(webhook)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webhooks'] });
            toast.success('Webhook atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao atualizar webhook: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('webhooks')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webhooks'] });
            toast.success('Webhook excluído com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao excluir webhook: ${error.message}`);
        },
    });

    const { data: historico } = useQuery({
        queryKey: ['historico-webhooks'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('historico_webhooks')
                .select('*')
                .order('data_disparo', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data as HistoricoWebhook[];
        },
    });

    return {
        webhooks,
        historico,
        isLoading,
        error,
        createWebhook: createMutation.mutate,
        updateWebhook: updateMutation.mutate,
        deleteWebhook: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
