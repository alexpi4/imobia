import { Profile, Turno } from '@/types';



export interface PlanejamentoPlantao {
    id: number | string;
    nome: string;
    mes: string; // YYYY-MM-DD
    equipe_id: number;
    corretor_id: number;
    dia: string; // YYYY-MM-DD
    turno_id: number;
    observacoes?: string;
    // Joins
    equipe?: { id: number; nome: string };
    corretor?: Profile;
    turno?: Turno;
}

export interface RodadaDistribuicao {
    id: number;
    numero_rodada: number;
    equipe_id?: number;
    unidade_id?: number;
    corretor_id: number;
    cliente_atribuido: string;
    telefone_cliente?: string;
    email_cliente?: string;
    origem_lead?: string;
    status: 'sucesso' | 'erro' | 'pendente';
    origem_disparo: 'manual' | 'automatico' | 'webhook';
    lead_id?: number;
    observacoes?: string;
    data_execucao: string;
    // Joins
    corretor?: Profile;
    equipe?: { id: number; nome: string };
    unidade?: { id: number; nome: string };
}



export interface LogAuditoria {
    id: number;
    usuario_id?: number;
    acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'DISTRIBUICAO' | 'ROLETA' | 'WEBHOOK';
    entidade: string;
    entidade_id?: string;
    dados_anteriores?: Record<string, unknown>;
    dados_novos?: Record<string, unknown>;
    timestamp: string;
    usuario?: Profile;
}
