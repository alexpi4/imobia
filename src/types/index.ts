export type AppRole = 'ADMIN' | 'CORRETOR' | 'NENHUM' | 'GESTOR' | 'Agenciador' | 'Atendente';

export interface Profile {
    id: number;
    user_id: string;
    nome: string;
    email: string;
    papel: string;
    equipe?: string;
    roleta_ativa: boolean;
    ultimo_atendimento?: string;
    total_atendimentos: number;
    role?: AppRole;
    unidade_id?: number;
}

export interface UserRole {
    id: string;
    user_id: string;
    role: AppRole;
}

export interface Unidade {
    id: number;
    sigla: string;
    nome: string;
    responsavel?: string;
}

export interface Lead {
    id: number;
    data_criacao: string;
    origem: string;
    intencao: string;
    cidade?: string;
    unidade: string;
    nome: string;
    telefone: string;
    email?: string;
    urgencia: 'Normal' | 'Alta' | 'Crítica';
    imovel?: string;
    valor?: number;
    resumo?: string;
    pipeline: 'Novo' | 'Qualificação' | 'Visita' | 'Ganho' | 'Perdido';
    atribuido: boolean;
    responsavel_id?: number;
    criado_por: number;
    id_external?: string;
    rd_lead_url?: string;
    created_at: string;
    updated_at: string;
    // Joins
    responsavel?: Profile;
    criador?: Profile;
    pipeline_id?: number;
    etapa_id?: number;
    pipeline_obj?: Pipeline;
    etapa_obj?: PipelineStage;
}

export interface Pipeline {
    id: number;
    nome: string;
    descricao?: string;
    unidade_id: number;
    tipo: 'vendas' | 'locacao' | 'custom';
    ativo: boolean;
    created_by: number;
    created_at: string;
    updated_at: string;
    etapas?: PipelineStage[];
}

export interface PipelineStage {
    id: number;
    pipeline_id: number;
    nome: string;
    ordem: number;
    cor: string;
    obrigatorio: boolean;
    created_at: string;
    updated_at: string;
}

export interface PipelineAutomation {
    id: number;
    pipeline_id: number;
    nome: string;
    gatilho: 'stage_change';
    gatilho_config: {
        from?: number | 'any';
        to?: number | 'any';
    };
    acao_tipo: 'email' | 'webhook' | 'whatsapp' | 'task';
    acao_config: Record<string, any>;
    ativo: boolean;
    created_at?: string;
}

export interface PipelineAutomationLog {
    id: number;
    automacao_id: number;
    lead_id: number;
    status: string;
    details?: any;
    executed_at: string;
}

export interface Cidade {
    id: number;
    nome: string;
    estado: string;
    created_at: string;
    updated_at: string;
}

export interface TimeDeVendas {
    id: number;
    nome: string;
    responsavel?: string;
    unidade?: string;
    email?: string;
    calendar_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Integracao {
    id: number;
    nome: string;
    url: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Intencao {
    id: number;
    nome: string;
    created_at: string;
    updated_at: string;
}

export interface Origem {
    id: number;
    nome: string;
    created_at: string;
    updated_at: string;
}

export interface Webhook {
    id: number;
    nome: string;
    url: string;
    tipo: 'manual' | 'automatico';
    secret?: string;
    eventos: string[];
    ativo: boolean;
    ultima_execucao?: string;
    total_execucoes: number;
    created_at: string;
    updated_at: string;
}

export interface HistoricoWebhook {
    id: number;
    webhook_id: number;
    rodada_id?: number;
    payload: any;
    response: any;
    status_code?: number;
    sucesso: boolean;
    erro?: string;
    tempo_resposta_ms?: number;
    data_disparo: string;
}

export interface Turno {
    id: number;
    nome: string;
    hora_inicio: string;
    hora_fim: string;
    ativo: boolean;
    created_at: string;
    updated_at: string;
}
