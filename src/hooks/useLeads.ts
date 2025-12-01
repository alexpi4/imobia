import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types';
import { toast } from 'sonner';

export function useLeads() {
    const queryClient = useQueryClient();

    const { data: leads, isLoading, error } = useQuery({
        queryKey: ['leads'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('leads')
                .select(`
                    *,
                    responsavel:responsavel_id(id, nome, email),
                    criador:criado_por(id, nome, email),
                    pipeline_obj:pipelines(id, nome),
                    etapa_obj:pipeline_etapas(id, nome, cor)
                `)
                .order('data_criacao', { ascending: false });

            if (error) throw error;
            return data as Lead[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'data_criacao' | 'responsavel' | 'criador' | 'pipeline_obj' | 'etapa_obj'>) => {
            const { data, error } = await supabase
                .from('leads')
                .insert([lead])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead criado com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao criar lead: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...lead }: Partial<Lead> & { id: number }) => {
            const { data, error } = await supabase
                .from('leads')
                .update(lead)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead atualizado com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar lead: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead excluído com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao excluir lead: ${error.message}`);
        },
    });

    return {
        leads,
        isLoading,
        error,
        createLead: createMutation.mutate,
        createLeadAsync: createMutation.mutateAsync,
        updateLead: updateMutation.mutate,
        updateLeadAsync: updateMutation.mutateAsync,
        deleteLead: deleteMutation.mutate,
        deleteLeadAsync: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
