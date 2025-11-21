import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    BarChart3,
    Kanban,
    Users,
    Settings,
    Shield,
    Calendar,
    Clock,
    Phone,
    MapPin,
    Building,
    Webhook,
    LogOut,
    Link,
    Target,
    Share2,
    CalendarCheck,
    Bell,
    CalendarPlus,
    BarChart2,
    History,
    ChevronDown,
    ChevronRight,
    Key,
    UserCog,
    FileText,
    Palette,
    Tag,
    CalendarDays,
    GitBranch,
    Zap
} from 'lucide-react';
import {
    Sidebar,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar
} from '@/components/ui/sidebar';
import { useMenuPermissions } from '@/hooks/useMenuPermissions';
import { useAuth } from '@/contexts/AuthContext';

export function AppSidebar() {
    const { hasAccess } = useMenuPermissions();
    const { collapsed } = useSidebar();
    const { signOut } = useAuth();

    // State for collapsible submenus
    const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
        'gestao-escalas': false,
        'agendamento-visitas': false,
        'distribuicao-lead': false,
        'integracoes-api': false,
        'seguranca-acessos': false,
        'configuracoes-sistema': false
    });

    const toggleSubmenu = (key: string) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const mainMenuItems = [
        { title: "Dashboard", url: "/", icon: LayoutDashboard, id: 'dashboard' },
        { title: "Análise C/L", url: "/analise-cl", icon: TrendingUp, id: 'analise-cl' },
        { title: "Performance", url: "/performance", icon: BarChart3, id: 'performance' }
    ];

    const crmMenuItems = [
        { title: "Pipeline", url: "/pipeline", icon: Kanban, id: 'pipeline' },
        { title: "Leads", url: "/leads", icon: Users, id: 'leads' },
        { title: "Funil de Vendas", url: "/funil-vendas", icon: TrendingUp, id: 'funil-vendas' }
    ];

    const operationalMenuStructure = [
        {
            key: 'gestao-escalas',
            title: "Gestão de Escalas",
            icon: CalendarCheck,
            id: 'gestao-escalas',
            items: [
                { title: "Planejamento", url: "/planejamento-plantao", icon: Calendar, id: 'planejar-plantao' },
                { title: "Notifica Plantão", url: "/operacional/notifica-plantao", icon: Bell, id: 'notifica-plantao' }
            ]
        },
        {
            key: 'agendamento-visitas',
            title: "Agendamento Visitas",
            icon: CalendarPlus,
            id: 'agendamento-visitas',
            items: [
                { title: "Agendar Visita", url: "/operacional/agendar-visita", icon: CalendarPlus, id: 'agendar-visita' }
            ]
        },
        {
            key: 'distribuicao-lead',
            title: "Distribuição Lead",
            icon: Phone,
            id: 'distribuicao-lead-group',
            items: [
                { title: "Roleta", url: "/dashboard-roleta", icon: BarChart2, id: 'dashboard-roleta' },
                { title: "Distribuição", url: "/distribuicao-lead", icon: Phone, id: 'distribuir-lead' },
                { title: "Histórico", url: "/operacional/historico-distribuicao", icon: History, id: 'historico-distribuicao' }
            ]
        }
    ];

    const cadastrosMenuItems = [
        { title: "Cidades", url: "/cadastros/cidades", icon: MapPin, id: 'cadastros-cidades' },
        { title: "Time de Vendas", url: "/cadastros/time-de-vendas", icon: Users, id: 'cadastros-time-vendas' },
        { title: "Unidades", url: "/cadastros/unidades", icon: Building, id: 'cadastros-unidades' },
        { title: "Intenções", url: "/cadastros/intencoes", icon: Target, id: 'cadastros-intencoes' },
        { title: "Origens", url: "/cadastros/origens", icon: Share2, id: 'cadastros-origens' },
        { title: "Turnos", url: "/cadastros/turnos", icon: Clock, id: 'cadastros-turnos' },
        { title: "Pipelines", url: "/cadastros/pipelines", icon: GitBranch, id: 'cadastros-pipelines' },
        { title: "Automações", url: "/cadastros/automacoes", icon: Zap, id: 'cadastros-automacoes' },
    ];


    const adminMenuStructure = [
        {
            key: 'integracoes-api',
            title: "Integrações e API",
            icon: Link,
            id: 'integracoes-api',
            items: [
                { title: "Webhooks", url: "/admin/webhooks", icon: Webhook, id: 'admin-webhooks' },
                { title: "Google Calendar", url: "/admin/google-calendar", icon: CalendarDays, id: 'admin-google-calendar' },
                { title: "Integração", url: "/admin/integracoes", icon: Link, id: 'cadastros-integracoes' }
            ]
        },
        {
            key: 'seguranca-acessos',
            title: "Segurança e Acessos",
            icon: Shield,
            id: 'seguranca-acessos',
            items: [
                { title: "Gerenciamento de Usuários", url: "/admin/usuarios", icon: UserCog, id: 'admin-usuarios' },
                { title: "Papéis e Permissões", url: "/admin/papeis-permissoes", icon: Key, id: 'admin-papeis-permissoes' },
                { title: "Logs de Auditoria", url: "/admin/logs-auditoria", icon: FileText, id: 'admin-logs-auditoria' }
            ]
        },
        {
            key: 'configuracoes-sistema',
            title: "Configurações Sistema",
            icon: Settings,
            id: 'configuracoes-sistema',
            items: [
                { title: "Personalização", url: "/admin/personalizacao", icon: Palette, id: 'admin-personalizacao' },
                { title: "White Label", url: "/admin/white-label", icon: Tag, id: 'admin-white-label' },
                { title: "Notificações", url: "/admin/notificacoes", icon: Bell, id: 'admin-notificacoes' }
            ]
        }
    ];

    return (
        <Sidebar>
            <SidebarGroup>
                <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
                <SidebarMenu>
                    {mainMenuItems.map((item) => (
                        hasAccess(item.id) && (
                            <SidebarMenuItem key={item.url}>
                                <NavLink to={item.url}>
                                    {({ isActive }) => (
                                        <SidebarMenuButton isActive={isActive}>
                                            <item.icon className="h-4 w-4" />
                                            {!collapsed && <span>{item.title}</span>}
                                        </SidebarMenuButton>
                                    )}
                                </NavLink>
                            </SidebarMenuItem>
                        )
                    ))}
                </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>CRM</SidebarGroupLabel>
                <SidebarMenu>
                    {crmMenuItems.map((item) => (
                        hasAccess(item.id) && (
                            <SidebarMenuItem key={item.url}>
                                <NavLink to={item.url}>
                                    {({ isActive }) => (
                                        <SidebarMenuButton isActive={isActive}>
                                            <item.icon className="h-4 w-4" />
                                            {!collapsed && <span>{item.title}</span>}
                                        </SidebarMenuButton>
                                    )}
                                </NavLink>
                            </SidebarMenuItem>
                        )
                    ))}
                </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>Operacional</SidebarGroupLabel>
                <SidebarMenu>
                    {operationalMenuStructure.map((group) => (
                        hasAccess(group.id) && (
                            <SidebarMenuItem key={group.key}>
                                <SidebarMenuButton
                                    onClick={() => toggleSubmenu(group.key)}
                                    className="justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <group.icon className="h-4 w-4" />
                                        {!collapsed && <span>{group.title}</span>}
                                    </div>
                                    {!collapsed && (
                                        openSubmenus[group.key] ?
                                            <ChevronDown className="h-4 w-4" /> :
                                            <ChevronRight className="h-4 w-4" />
                                    )}
                                </SidebarMenuButton>
                                {!collapsed && openSubmenus[group.key] && (
                                    <SidebarMenuSub>
                                        {group.items.map((item) => (
                                            hasAccess(item.id) && (
                                                <SidebarMenuSubItem key={item.url}>
                                                    <NavLink to={item.url}>
                                                        {({ isActive }) => (
                                                            <SidebarMenuSubButton isActive={isActive}>
                                                                <item.icon className="h-4 w-4" />
                                                                <span>{item.title}</span>
                                                            </SidebarMenuSubButton>
                                                        )}
                                                    </NavLink>
                                                </SidebarMenuSubItem>
                                            )
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>
                        )
                    ))}
                </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
                <SidebarMenu>
                    {cadastrosMenuItems.map((item) => (
                        hasAccess(item.id) && (
                            <SidebarMenuItem key={item.url}>
                                <NavLink to={item.url}>
                                    {({ isActive }) => (
                                        <SidebarMenuButton isActive={isActive}>
                                            <item.icon className="h-4 w-4" />
                                            {!collapsed && <span>{item.title}</span>}
                                        </SidebarMenuButton>
                                    )}
                                </NavLink>
                            </SidebarMenuItem>
                        )
                    ))}
                </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>Administração</SidebarGroupLabel>
                <SidebarMenu>
                    {adminMenuStructure.map((group) => (
                        hasAccess(group.id) && (
                            <SidebarMenuItem key={group.key}>
                                <SidebarMenuButton
                                    onClick={() => toggleSubmenu(group.key)}
                                    className="justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <group.icon className="h-4 w-4" />
                                        {!collapsed && <span>{group.title}</span>}
                                    </div>
                                    {!collapsed && (
                                        openSubmenus[group.key] ?
                                            <ChevronDown className="h-4 w-4" /> :
                                            <ChevronRight className="h-4 w-4" />
                                    )}
                                </SidebarMenuButton>
                                {!collapsed && openSubmenus[group.key] && (
                                    <SidebarMenuSub>
                                        {group.items.map((item) => (
                                            hasAccess(item.id) && (
                                                <SidebarMenuSubItem key={item.url}>
                                                    <NavLink to={item.url}>
                                                        {({ isActive }) => (
                                                            <SidebarMenuSubButton isActive={isActive}>
                                                                <item.icon className="h-4 w-4" />
                                                                <span>{item.title}</span>
                                                            </SidebarMenuSubButton>
                                                        )}
                                                    </NavLink>
                                                </SidebarMenuSubItem>
                                            )
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>
                        )
                    ))}
                </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={signOut} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <LogOut className="h-4 w-4" />
                            {!collapsed && <span>Sair do Sistema</span>}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </Sidebar>
    );
}
