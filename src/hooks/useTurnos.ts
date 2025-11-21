import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Turno } from '@/types';
import { toast } from 'sonner';

export function useTurnos() {
    const queryClient = useQueryClient();

    const { data: turnos, isLoading, error } = useQuery({
        queryKey: ['turnos'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('turnos')
                .select('*')
                .order('hora_inicio', { ascending: true });

            if (error) throw error;
            return data as Turno[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (turno: Omit<Turno, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('turnos')
                .insert([turno])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['turnos'] });
            toast.success('Turno criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao criar turno: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...turno }: Partial<Turno> & { id: number }) => {
            const { data, error } = await supabase
                .from('turnos')
                .update(turno)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['turnos'] });
            toast.success('Turno atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao atualizar turno: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('turnos')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['turnos'] });
            toast.success('Turno excluído com sucesso!');
        },
        onError: (error: any) => {
            toast.error(`Erro ao excluir turno: ${error.message}`);
        },
    });

    return {
        turnos,
        isLoading,
        error,
        createTurno: createMutation.mutate,
        updateTurno: updateMutation.mutate,
        deleteTurno: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
