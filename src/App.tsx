import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Toaster } from 'sonner';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import TurnosPage from '@/pages/cadastros/TurnosPage';
import PlanejamentoPlantaoPage from '@/pages/operacional/PlanejamentoPlantaoPage';
import DistribuicaoLeadPage from '@/pages/operacional/DistribuicaoLeadPage';
import DashboardRoletaPage from '@/pages/operacional/DashboardRoletaPage';
import NotificaPlantaoPage from '@/pages/operacional/NotificaPlantaoPage';
import AgendarVisitaPage from '@/pages/operacional/AgendarVisitaPage';
import HistoricoDistribuicaoPage from '@/pages/operacional/HistoricoDistribuicaoPage';
import ConfiguracaoPage from '@/pages/admin/ConfiguracaoPage';
import AdminPage from '@/pages/admin/AdminPage';
import WebhooksPage from '@/pages/admin/WebhooksPage';
import CidadesPage from '@/pages/cadastros/CidadesPage';
import TimeDeVendasPage from '@/pages/cadastros/TimeDeVendasPage';
import UnidadesPage from '@/pages/cadastros/UnidadesPage';
import IntegracaoPage from '@/pages/admin/IntegracaoPage';
import IntencoesPage from '@/pages/cadastros/IntencoesPage';
import OrigensPage from '@/pages/cadastros/OrigensPage';
import LeadsPage from '@/pages/LeadsPage';
import PipelinePage from '@/pages/PipelinePage';
import FunilVendasPage from '@/pages/FunilVendasPage';
import AnaliseCLPage from '@/pages/AnaliseCLPage';
import PerformancePage from '@/pages/PerformancePage';
import PipelineListPage from '@/pages/cadastros/PipelineListPage';
import PipelineFormPage from '@/pages/cadastros/PipelineFormPage';
import PipelineAutomationsPage from '@/pages/cadastros/PipelineAutomationsPage';
import GoogleCalendarPage from '@/pages/admin/GoogleCalendarPage';
import UsuariosPage from '@/pages/admin/UsuariosPage';
import PapeisPermissoesPage from '@/pages/admin/PapeisPermissoesPage';
import LogsAuditoriaPage from '@/pages/admin/LogsAuditoriaPage';
import PersonalizacaoPage from '@/pages/admin/PersonalizacaoPage';
import WhiteLabelPage from '@/pages/admin/WhiteLabelPage';
import NotificacoesPage from '@/pages/admin/NotificacoesPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route path="/auth" element={<Auth />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout><Dashboard /></Layout>} path="/" />
              <Route element={<Layout><AnaliseCLPage /></Layout>} path="/analise-cl" />
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
              <Route element={<Layout><ConfiguracaoPage /></Layout>} path="/configuracao" />
              <Route element={<Layout><IntegracaoPage /></Layout>} path="/admin/integracoes" />
              <Route element={<Layout><WebhooksPage /></Layout>} path="/admin/webhooks" />
              <Route element={<Layout><GoogleCalendarPage /></Layout>} path="/admin/google-calendar" />
              <Route element={<Layout><UsuariosPage /></Layout>} path="/admin/usuarios" />
              <Route element={<Layout><PapeisPermissoesPage /></Layout>} path="/admin/papeis-permissoes" />
              <Route element={<Layout><LogsAuditoriaPage /></Layout>} path="/admin/logs-auditoria" />
              <Route element={<Layout><PersonalizacaoPage /></Layout>} path="/admin/personalizacao" />
              <Route element={<Layout><WhiteLabelPage /></Layout>} path="/admin/white-label" />
              <Route element={<Layout><NotificacoesPage /></Layout>} path="/admin/notificacoes" />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
