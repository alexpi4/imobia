import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pipeline, PipelineStage } from '@/types';
import { toast } from 'sonner';

export function usePipelines(unidadeId?: number) {
    const queryClient = useQueryClient();

    const { data: pipelines, isLoading } = useQuery({
        queryKey: ['pipelines', unidadeId],
        queryFn: async () => {
            let query = supabase
                .from('pipelines')
                .select('*, etapas:pipeline_etapas(*)')
                .order('created_at', { ascending: false });

            if (unidadeId) {
                query = query.eq('unidade_id', unidadeId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data.map((pipeline: Pipeline) => ({
                ...pipeline,
                etapas: pipeline.etapas?.sort((a: PipelineStage, b: PipelineStage) => a.ordem - b.ordem)
            })) as Pipeline[];
        },
    });

    const createPipeline = useMutation({
        mutationFn: async (newPipeline: Omit<Pipeline, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('pipelines')
                .insert(newPipeline)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipelines'] });
            toast.success('Pipeline criado com sucesso!');
        },
        onError: (error) => {
            toast.error('Erro ao criar pipeline: ' + error.message);
        },
    });

    const updatePipeline = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Pipeline> & { id: number }) => {
            const { data, error } = await supabase
                .from('pipelines')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipelines'] });
            toast.success('Pipeline atualizado com sucesso!');
        },
        onError: (error) => {
            toast.error('Erro ao atualizar pipeline: ' + error.message);
        },
    });

    const deletePipeline = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('pipelines')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipelines'] });
            toast.success('Pipeline excluído com sucesso!');
        },
        onError: (error) => {
            toast.error('Erro ao excluir pipeline: ' + error.message);
        },
    });

    // Stages Mutations
    const createStage = useMutation({
        mutationFn: async (newStage: Omit<PipelineStage, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('pipeline_etapas')
                .insert(newStage)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipelines'] });
        },
    });

    const updateStage = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<PipelineStage> & { id: number }) => {
            const { data, error } = await supabase
                .from('pipeline_etapas')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipelines'] });
        },
    });

    const deleteStage = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('pipeline_etapas')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipelines'] });
        },
    });

    return {
        pipelines,
        isLoading,
        createPipeline,
        updatePipeline,
        deletePipeline,
        createStage,
        updateStage,
        deleteStage
    };
}
