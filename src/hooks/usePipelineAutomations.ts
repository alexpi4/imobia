import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PipelineAutomation } from '@/types';
import { toast } from 'sonner';

export function usePipelineAutomations(pipelineId?: number) {
    const queryClient = useQueryClient();

    const { data: automations, isLoading, error } = useQuery({
        queryKey: ['pipeline-automations', pipelineId],
        queryFn: async () => {
            if (!pipelineId) return [];
            const { data, error } = await supabase
                .from('pipeline_automacoes')
                .select('*')
                .eq('pipeline_id', pipelineId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as PipelineAutomation[];
        },
        enabled: !!pipelineId,
    });

    const createMutation = useMutation({
        mutationFn: async (automation: Omit<PipelineAutomation, 'id' | 'created_at'>) => {
            const { data, error } = await supabase
                .from('pipeline_automacoes')
                .insert([automation])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipeline-automations'] });
            toast.success('Automação criada com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao criar automação: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...automation }: Partial<PipelineAutomation> & { id: number }) => {
            const { data, error } = await supabase
                .from('pipeline_automacoes')
                .update(automation)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipeline-automations'] });
            toast.success('Automação atualizada com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar automação: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('pipeline_automacoes')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipeline-automations'] });
            toast.success('Automação excluída com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao excluir automação: ${error.message}`);
        },
    });

    return {
        automations,
        isLoading,
        error,
        createAutomation: createMutation.mutateAsync,
        updateAutomation: updateMutation.mutateAsync,
        deleteAutomation: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        logAutomationExecution: async (log: { automacao_id: number; lead_id: number; status: string; details?: Record<string, unknown> }) => {
            const { error } = await supabase
                .from('pipeline_automacao_logs')
                .insert([log]);
            if (error) console.error('Error logging automation:', error);
        }
    };
}
