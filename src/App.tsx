import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WhiteLabelProvider } from '@/contexts/WhiteLabelContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Toaster } from 'sonner';
import Auth from '@/pages/Auth';
import DashboardPage from '@/pages/DashboardPage';
import TurnosPage from '@/pages/cadastros/TurnosPage';
import PlanejamentoPlantaoPage from '@/pages/operacional/PlanejamentoPlantaoPage';
import DistribuicaoLeadPage from '@/pages/operacional/DistribuicaoLeadPage';
import DashboardRoletaPage from '@/pages/operacional/DashboardRoletaPage';
import NotificaPlantaoPage from '@/pages/operacional/NotificaPlantaoPage';
import AgendarVisitaPage from '@/pages/operacional/AgendarVisitaPage';
import HistoricoDistribuicaoPage from '@/pages/operacional/HistoricoDistribuicaoPage';

import AdminPage from '@/pages/admin/AdminPage';
import WebhooksPage from '@/pages/admin/WebhooksPage';
import CidadesPage from '@/pages/cadastros/CidadesPage';
import TimeDeVendasPage from '@/pages/cadastros/TimeDeVendasPage';
import UnidadesPage from '@/pages/cadastros/UnidadesPage';

import IntencoesPage from '@/pages/cadastros/IntencoesPage';
import OrigensPage from '@/pages/cadastros/OrigensPage';
import LeadsPage from '@/pages/crm/LeadsPage';
import PipelinePage from '@/pages/crm/PipelinePage';
import FunilVendasPage from '@/pages/crm/FunilVendasPage';
import AnaliseVLPage from '@/pages/crm/AnaliseVLPage';
import PerformancePage from '@/pages/crm/PerformancePage';
import PipelineListPage from '@/pages/cadastros/PipelineListPage';
import PipelineFormPage from '@/pages/cadastros/PipelineFormPage';
import PipelineAutomationsPage from '@/pages/cadastros/PipelineAutomationsPage';
import GoogleCalendarPage from '@/pages/admin/GoogleCalendarPage';
import SupabaseConfigPage from '@/pages/admin/SupabaseConfigPage';
import UsuariosPage from '@/pages/admin/UsuariosPage';
import PapeisPermissoesPage from '@/pages/admin/PapeisPermissoesPage';
import LogsAuditoriaPage from '@/pages/admin/LogsAuditoriaPage';
import PersonalizacaoPage from '@/pages/admin/PersonalizacaoPage';
import WhiteLabelPage from '@/pages/admin/WhiteLabelPage';
import NotificacoesPage from '@/pages/admin/NotificacoesPage';

import PlansManagementPage from '@/pages/admin/PlansManagementPage';
import ModulesManagementPage from '@/pages/admin/ModulesManagementPage';
import SubscriptionStatusPage from '@/pages/configuracao/SubscriptionStatusPage';

// Chat
import ChatInternoPage from '@/pages/chat/ChatInternoPage';
import ChatCorretoresPage from '@/pages/chat/ChatCorretoresPage';

// Agentes IA
import AgenteAtendimentoPage from '@/pages/agentes/AgenteAtendimentoPage';
import AgenteCampanhasPage from '@/pages/agentes/AgenteCampanhasPage';
import AgenteVendasPage from '@/pages/agentes/AgenteVendasPage';

// Multicanal
import ChatWootPage from '@/pages/multicanal/ChatWootPage';
import ManyChatPage from '@/pages/multicanal/ManyChatPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WhiteLabelProvider>
            <BrowserRouter>
              <Toaster />
              <Routes>
                <Route path="/auth" element={<Auth />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout><DashboardPage /></Layout>} path="/" />
                  <Route element={<Layout><AnaliseVLPage /></Layout>} path="/analise-vl" />
                  <Route element={<Layout><PerformancePage /></Layout>} path="/performance" />

                  {/* CRM */}
                  <Route element={<Layout><PipelinePage /></Layout>} path="/pipeline" />
                  <Route element={<Layout><LeadsPage /></Layout>} path="/leads" />
                  <Route element={<Layout><FunilVendasPage /></Layout>} path="/funil-vendas" />

                  {/* Operacional */}
                  <Route element={<Layout><PlanejamentoPlantaoPage /></Layout>} path="/planejamento-plantao" />
                  <Route element={<Layout><NotificaPlantaoPage /></Layout>} path="/operacional/notifica-plantao" />
                  <Route element={<Layout><AgendarVisitaPage /></Layout>} path="/operacional/agendar-visita" />
                  <Route element={<Layout><DistribuicaoLeadPage /></Layout>} path="/distribuicao-lead" />
                  <Route element={<Layout><DashboardRoletaPage /></Layout>} path="/dashboard-roleta" />
                  <Route element={<Layout><HistoricoDistribuicaoPage /></Layout>} path="/operacional/historico-distribuicao" />

                  {/* Cadastros */}
                  <Route element={<Layout><CidadesPage /></Layout>} path="/cadastros/cidades" />
                  <Route element={<Layout><TimeDeVendasPage /></Layout>} path="/cadastros/time-de-vendas" />
                  <Route element={<Layout><UnidadesPage /></Layout>} path="/cadastros/unidades" />
                  <Route element={<Layout><IntencoesPage /></Layout>} path="/cadastros/intencoes" />
                  <Route element={<Layout><OrigensPage /></Layout>} path="/cadastros/origens" />

                  <Route element={<Layout><TurnosPage /></Layout>} path="/cadastros/turnos" />
                  <Route element={<Layout><PipelineListPage /></Layout>} path="/cadastros/pipelines" />
                  <Route element={<Layout><PipelineFormPage /></Layout>} path="/cadastros/pipelines/novo" />
                  <Route element={<Layout><PipelineFormPage /></Layout>} path="/cadastros/pipelines/:id/editar" />
                  <Route element={<Layout><PipelineAutomationsPage /></Layout>} path="/cadastros/automacoes" />

                  {/* Admin */}
                  <Route element={<Layout><AdminPage /></Layout>} path="/admin" />


                  <Route element={<Layout><WebhooksPage /></Layout>} path="/admin/webhooks" />
                  <Route element={<Layout><GoogleCalendarPage /></Layout>} path="/admin/google-calendar" />
                  <Route element={<Layout><SupabaseConfigPage /></Layout>} path="/admin/supabase" />
                  <Route element={<Layout><UsuariosPage /></Layout>} path="/admin/usuarios" />
                  <Route element={<Layout><PapeisPermissoesPage /></Layout>} path="/admin/papeis-permissoes" />
                  <Route element={<Layout><LogsAuditoriaPage /></Layout>} path="/admin/logs-auditoria" />
                  <Route element={<Layout><PersonalizacaoPage /></Layout>} path="/admin/personalizacao" />
                  <Route element={<Layout><WhiteLabelPage /></Layout>} path="/admin/white-label" />
                  <Route element={<Layout><NotificacoesPage /></Layout>} path="/admin/notificacoes" />

                  {/* SaaS Admin */}
                  <Route element={<Layout><PlansManagementPage /></Layout>} path="/admin/plans" />
                  <Route element={<Layout><ModulesManagementPage /></Layout>} path="/admin/modules" />

                  {/* SaaS Tenant */}
                  <Route element={<Layout><SubscriptionStatusPage /></Layout>} path="/configuracao/assinatura" />

                  {/* Chat */}
                  <Route element={<Layout><ChatInternoPage /></Layout>} path="/chat/interno" />
                  <Route element={<Layout><ChatCorretoresPage /></Layout>} path="/chat/corretores" />

                  {/* Agentes IA */}
                  <Route element={<Layout><AgenteAtendimentoPage /></Layout>} path="/agentes/atendimento" />
                  <Route element={<Layout><AgenteCampanhasPage /></Layout>} path="/agentes/campanhas" />
                  <Route element={<Layout><AgenteVendasPage /></Layout>} path="/agentes/vendas" />

                  {/* Multicanal */}
                  <Route element={<Layout><ChatWootPage /></Layout>} path="/multicanal/chatwoot" />
                  <Route element={<Layout><ManyChatPage /></Layout>} path="/multicanal/manychat" />
                </Route>
              </Routes>
            </BrowserRouter>
          </WhiteLabelProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
