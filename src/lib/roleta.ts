import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function distributeLead(leadId: number) {
    try {
        // 1. Find active shift (Turno) for now
        const now = new Date();
        const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const { data: activeTurno, error: turnoError } = await supabase
            .from('turnos')
            .select('id')
            .lte('hora_inicio', currentTime)
            .gte('hora_fim', currentTime)
            .eq('ativo', true)
            .single();

        // Note: This simple time check might fail for overnight shifts (e.g. 22:00 - 06:00). 
        // For MVP, assuming day shifts.

        if (turnoError || !activeTurno) {
            console.warn('No active shift found, falling back to round robin without shift constraint or manual.');
            // Proceed or return error? Let's proceed with just active brokers.
        }

        // 2. Get active brokers (Corretores)
        // If shift exists, check planejamento_plantao. If not, check profiles.roleta_ativa
        let candidateIds: number[] = [];

        if (activeTurno) {
            const today = now.toISOString().split('T')[0];
            const { data: plantao } = await supabase
                .from('planejamento_plantao')
                .select('corretor_id')
                .eq('dia', today)
                .eq('turno_id', activeTurno.id);

            if (plantao) candidateIds = plantao.map(p => p.corretor_id);
        }

        if (candidateIds.length === 0) {
            // Fallback: all active brokers in roleta
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id')
                .eq('roleta_ativa', true);

            if (profiles) candidateIds = profiles.map(p => p.id);
        }

        if (candidateIds.length === 0) {
            throw new Error('Nenhum corretor disponível para distribuição.');
        }

        // 3. Find who received the last lead to determine next
        const { data: lastDistribution } = await supabase
            .from('rodadas_distribuicao')
            .select('corretor_id')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        let nextCorretorId = candidateIds[0];

        if (lastDistribution) {
            const lastIndex = candidateIds.indexOf(lastDistribution.corretor_id);
            if (lastIndex !== -1 && lastIndex < candidateIds.length - 1) {
                nextCorretorId = candidateIds[lastIndex + 1];
            } else {
                nextCorretorId = candidateIds[0]; // Loop back to start
            }
        }

        // 4. Assign Lead
        const { error: updateError } = await supabase
            .from('leads')
            .update({
                responsavel_id: nextCorretorId,
                atribuido: true,
                pipeline: 'Novo' // Ensure it's in New
            })
            .eq('id', leadId);

        if (updateError) throw updateError;

        // 5. Log Distribution
        await supabase.from('rodadas_distribuicao').insert({
            corretor_id: nextCorretorId,
            lead_id: leadId,
            cliente_atribuido: 'Lead ID ' + leadId, // Should fetch lead name
            status: 'sucesso',
            origem_disparo: 'manual'
        });

        toast.success('Lead distribuído com sucesso!');
        return nextCorretorId;

    } catch (error: any) {
        console.error('Error distributing lead:', error);
        toast.error('Erro na distribuição: ' + error.message);
        throw error;
    }
}
