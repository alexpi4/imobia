import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCadastro<T extends { id: number }>(
    tableName: string,
    selectQuery: string = '*'
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: result, error } = await supabase
                .from(tableName)
                .select(selectQuery)
                .order('id', { ascending: true });

            if (error) throw error;
            setData(result as unknown as T[]);
        } catch (error) {
            console.error(`Error processing ${tableName}:`, error);
            toast.error(`Erro: ${(error as Error).message}`);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel(`${tableName}-changes`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: tableName },
                () => fetchData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tableName]);

    const create = async (values: Partial<T>) => {
        try {
            const { data: newItem, error } = await supabase
                .from(tableName)
                .insert(values)
                .select()
                .single();

            if (error) throw error;
            toast.success('Registro criado com sucesso!');
            return newItem;
        } catch (error) {
            console.error(`Error creating in ${tableName}:`, error);
            toast.error(`Erro ao criar: ${(error as Error).message}`);
            throw error;
        }
    };

    const update = async (id: number, values: Partial<T>) => {
        try {
            const { error } = await supabase
                .from(tableName)
                .update(values)
                .eq('id', id);

            if (error) throw error;
            toast.success('Registro atualizado com sucesso!');
        } catch (error) {
            console.error(`Error updating in ${tableName}:`, error);
            toast.error(`Erro ao atualizar: ${(error as Error).message}`);
            throw error;
        }
    };

    const remove = async (id: number) => {
        try {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Registro excluído com sucesso!');
        } catch (error) {
            console.error(`Error deleting from ${tableName}:`, error);
            toast.error(`Erro ao excluir: ${(error as Error).message}`);
            throw error;
        }
    };

    return { data, loading, create, update, remove, refetch: fetchData };
}
