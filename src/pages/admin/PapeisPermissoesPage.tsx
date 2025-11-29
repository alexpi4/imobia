import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, Save, Shield, LayoutDashboard, BarChart3, Users, Settings, Calendar, Bell, Building2, Workflow, Link2, Webhook, MapPin, Target, Share2, Clock, GitBranch, Zap, CreditCard, MessageSquare, Bot, Megaphone, ShoppingCart, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

// Define available menus and their icons - ALL LEVELS (Granular)
const AVAILABLE_MENUS = [
    // === MENU PRINCIPAL ===
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Menu Principal' },
    { id: 'analise-cl', label: 'Análise C/L', icon: BarChart3, category: 'Menu Principal' },
    { id: 'performance', label: 'Performance', icon: BarChart3, category: 'Menu Principal' },

    // === OPERACIONAL ===
    // Gestão de Escalas (Group + Sub-items)
    { id: 'gestao-escalas', label: 'Gestão de Escalas (Grupo)', icon: Calendar, category: 'Operacional' },
    { id: 'planejar-plantao', label: '→ Planejamento', icon: Calendar, category: 'Operacional' },
    { id: 'notifica-plantao', label: '→ Notifica Plantão', icon: Bell, category: 'Operacional' },

    // Agendamento Visitas (Group + Sub-items)
    { id: 'agendamento-visitas', label: 'Agendamento Visitas (Grupo)', icon: Calendar, category: 'Operacional' },
    { id: 'agendar-visita', label: '→ Agendar Visita', icon: Calendar, category: 'Operacional' },

    // Distribuição Lead (Group + Sub-items)
    { id: 'distribuicao-lead-group', label: 'Distribuição Lead (Grupo)', icon: Users, category: 'Operacional' },
    { id: 'dashboard-roleta', label: '→ Roleta', icon: BarChart3, category: 'Operacional' },
    { id: 'distribuir-lead', label: '→ Distribuição', icon: Users, category: 'Operacional' },
    { id: 'historico-distribuicao', label: '→ Histórico', icon: Calendar, category: 'Operacional' },

    // === MÓDULOS ===
    // CRM
    { id: 'crm-group', label: 'CRM (Grupo)', icon: Users, category: 'Módulos' },
    { id: 'pipeline', label: '→ Pipeline', icon: Workflow, category: 'Módulos' },
    { id: 'leads', label: '→ Leads', icon: Users, category: 'Módulos' },
    { id: 'funil-vendas', label: '→ Funil de Vendas', icon: BarChart3, category: 'Módulos' },
    { id: 'cadastros-pipelines', label: '→ Pipelines', icon: GitBranch, category: 'Módulos' },
    { id: 'cadastros-automacoes', label: '→ Automações', icon: Zap, category: 'Módulos' },

    // Chat
    { id: 'chat-group', label: 'Chat (Grupo)', icon: MessageSquare, category: 'Módulos' },
    { id: 'chat-interno', label: '→ Chat Interno', icon: MessageSquare, category: 'Módulos' },
    { id: 'chat-corretores', label: '→ Chat Corretores', icon: Users, category: 'Módulos' },

    // Agentes IA
    { id: 'agentes-ia-group', label: 'Agentes IA (Grupo)', icon: Bot, category: 'Módulos' },
    { id: 'agente-atendimento', label: '→ Agente Atendimento', icon: Bot, category: 'Módulos' },
    { id: 'agente-campanhas', label: '→ Agente Campanhas', icon: Megaphone, category: 'Módulos' },
    { id: 'agente-vendas', label: '→ Agente Vendas', icon: ShoppingCart, category: 'Módulos' },

    // Multicanal
    { id: 'multicanal-group', label: 'Multicanal (Grupo)', icon: MessageCircle, category: 'Módulos' },
    { id: 'multicanal-chatwoot', label: '→ ChatWoot', icon: MessageCircle, category: 'Módulos' },
    { id: 'multicanal-manychat', label: '→ ManyChat', icon: Send, category: 'Módulos' },

    // === CADASTROS ===
    { id: 'cadastros-group', label: 'Cadastros (Grupo)', icon: Building2, category: 'Cadastros' },
    { id: 'cadastros-cidades', label: '→ Cidades', icon: MapPin, category: 'Cadastros' },
    { id: 'cadastros-time-vendas', label: '→ Time de Vendas', icon: Users, category: 'Cadastros' },
    { id: 'cadastros-unidades', label: '→ Unidades', icon: Building2, category: 'Cadastros' },
    { id: 'cadastros-intencoes', label: '→ Intenções', icon: Target, category: 'Cadastros' },
    { id: 'cadastros-origens', label: '→ Origens', icon: Share2, category: 'Cadastros' },
    { id: 'cadastros-turnos', label: '→ Turnos', icon: Clock, category: 'Cadastros' },

    // === ADMINISTRAÇÃO ===
    // Integrações e API (Group + Sub-items)
    { id: 'integracoes-api', label: 'Integrações e API (Grupo)', icon: Link2, category: 'Administração' },
    { id: 'admin-webhooks', label: '→ Webhooks', icon: Webhook, category: 'Administração' },
    { id: 'admin-google-calendar', label: '→ Google Calendar', icon: Calendar, category: 'Administração' },


    // Segurança e Acessos (Group + Sub-items)
    { id: 'seguranca-acessos', label: 'Segurança e Acessos (Grupo)', icon: Shield, category: 'Administração' },
    { id: 'admin-usuarios', label: '→ Gerenciamento de Usuários', icon: Users, category: 'Administração' },
    { id: 'admin-papeis-permissoes', label: '→ Papéis e Permissões', icon: Shield, category: 'Administração' },
    { id: 'admin-logs-auditoria', label: '→ Logs de Auditoria', icon: Calendar, category: 'Administração' },

    // Configurações Sistema (Group + Sub-items)
    { id: 'configuracoes-sistema', label: 'Configurações Sistema (Grupo)', icon: Settings, category: 'Administração' },
    { id: 'admin-personalizacao', label: '→ Personalização', icon: Settings, category: 'Administração' },
    { id: 'admin-white-label', label: '→ White Label', icon: Settings, category: 'Administração' },
    { id: 'admin-notificacoes', label: '→ Notificações', icon: Bell, category: 'Administração' },
    { id: 'admin-plans', label: '→ Planos', icon: Settings, category: 'Administração' },
    { id: 'admin-modules', label: '→ Módulos', icon: Settings, category: 'Administração' },
    { id: 'config-subscription', label: '→ Assinatura', icon: CreditCard, category: 'Administração' },
];

const ROLES = ['ADMIN', 'CORRETOR', 'GESTOR', 'Agenciador', 'Atendente', 'NENHUM'];

interface UserProfile {
    id: number;
    user_id: string;
    nome: string;
    email: string;
    role: string;
    avatar_url?: string;
}

export default function PapeisPermissoesPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuSearchQuery, setMenuSearchQuery] = useState('');
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchPermissions(selectedUser.id);
        } else {
            setUserPermissions([]);
        }
    }, [selectedUser]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('nome');

            if (profilesError) throw profilesError;

            const { data: roles, error: rolesError } = await supabase
                .from('user_roles')
                .select('user_id, role');

            if (rolesError) throw rolesError;

            const mergedUsers = profiles.map(profile => {
                const userRole = roles.find(r => r.user_id === profile.user_id);
                return {
                    ...profile,
                    role: userRole ? userRole.role : (profile.papel || 'NENHUM')
                };
            });

            setUsers(mergedUsers);
            if (mergedUsers.length > 0 && !selectedUser) {
                setSelectedUser(mergedUsers[0]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Erro ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async (profileId: number) => {
        try {
            const { data, error } = await supabase
                .from('liberacao')
                .select('menu')
                .eq('usuario_id', profileId);

            if (error) {
                console.error('Error fetching permissions:', error);
                throw error;
            }

            const permissions = data?.map(item => item.menu) || [];
            setUserPermissions(permissions);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            toast.error('Erro ao carregar permissões.');
        }
    };

    const handleRoleChange = (newRole: string) => {
        if (!selectedUser) return;
        setSelectedUser({ ...selectedUser, role: newRole });
    };

    const togglePermission = (menuId: string) => {
        setUserPermissions(prev =>
            prev.includes(menuId)
                ? prev.filter(id => id !== menuId)
                : [...prev, menuId]
        );
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        setSaving(true);
        try {
            const { data: existingRole } = await supabase
                .from('user_roles')
                .select('id')
                .eq('user_id', selectedUser.user_id)
                .maybeSingle();

            if (existingRole) {
                await supabase
                    .from('user_roles')
                    .update({ role: selectedUser.role })
                    .eq('user_id', selectedUser.user_id);
            } else {
                await supabase
                    .from('user_roles')
                    .insert({ user_id: selectedUser.user_id, role: selectedUser.role });
            }

            await supabase
                .from('profiles')
                .update({ papel: selectedUser.role })
                .eq('id', selectedUser.id);

            await supabase
                .from('liberacao')
                .delete()
                .eq('usuario_id', selectedUser.id);

            if (userPermissions.length > 0) {
                const permissionsToInsert = userPermissions.map(menu => ({
                    usuario_id: selectedUser.id,
                    menu: menu
                }));
                await supabase.from('liberacao').insert(permissionsToInsert);
            }

            toast.success('Alterações salvas com sucesso!');
            fetchUsers();
        } catch (error) {
            console.error('Error saving changes:', error);
            toast.error('Erro ao salvar alterações.');
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMenus = AVAILABLE_MENUS.filter(menu =>
        menu.label.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        menu.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
    );

    // Group menus by category
    const menusByCategory = filteredMenus.reduce((acc, menu) => {
        if (!acc[menu.category]) {
            acc[menu.category] = [];
        }
        acc[menu.category].push(menu);
        return acc;
    }, {} as Record<string, typeof AVAILABLE_MENUS>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Controle de Acesso</h1>
                    <p className="text-muted-foreground">Gerencie usuários, papéis e permissões do sistema (granular).</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12 h-[calc(100vh-200px)]">
                {/* Left Column: Users List */}
                <Card className="md:col-span-4 flex flex-col h-full">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Usuários & Papéis</CardTitle>
                            <Button size="sm" variant="outline">
                                <UserPlus className="h-4 w-4 mr-2" /> Adicionar
                            </Button>
                        </div>
                        <div className="relative mt-2">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou email..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-0">
                        <div className="divide-y">
                            {loading ? (
                                <div className="p-4 text-center text-muted-foreground">Carregando...</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
                            ) : (
                                filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center p-4 cursor-pointer hover:bg-accent transition-colors ${selectedUser?.id === user.id ? 'bg-accent' : ''}`}
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <Avatar className="h-10 w-10 mr-4">
                                            <AvatarImage src={user.avatar_url} />
                                            <AvatarFallback>{user.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-none truncate">{user.nome}</p>
                                            <p className="text-xs text-muted-foreground truncate mt-1">{user.email}</p>
                                        </div>
                                        <div className="ml-2">
                                            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Permissions */}
                <Card className="md:col-span-8 flex flex-col h-full">
                    {selectedUser ? (
                        <>
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Permissões de Menu para <span className="text-primary">{selectedUser.nome}</span></CardTitle>
                                        <CardDescription>Configure o acesso granular (1º, 2º e 3º níveis).</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <Select value={selectedUser.role} onValueChange={handleRoleChange}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Selecione um papel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROLES.map(role => (
                                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Filtrar menus..."
                                            className="pl-8"
                                            value={menuSearchQuery}
                                            onChange={(e) => setMenuSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {Object.entries(menusByCategory).map(([category, menus]) => (
                                        <div key={category} className="space-y-2">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{category}</h3>
                                            <div className="grid gap-2">
                                                {menus.map(menu => {
                                                    const Icon = menu.icon;
                                                    return (
                                                        <div
                                                            key={menu.id}
                                                            className={`flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors ${menu.label.includes('(Grupo)') ? 'bg-primary/5 border-primary/20' : ''
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-md border ${menu.label.includes('(Grupo)') ? 'bg-primary/10 border-primary/30' : 'bg-background'
                                                                    }`}>
                                                                    <Icon className={`h-4 w-4 ${menu.label.includes('(Grupo)') ? 'text-primary' : 'text-muted-foreground'
                                                                        }`} />
                                                                </div>
                                                                <div>
                                                                    <p className={`text-sm font-medium ${menu.label.includes('(Grupo)') ? 'text-primary font-semibold' : ''
                                                                        }`}>{menu.label}</p>
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                checked={userPermissions.includes(menu.id)}
                                                                onCheckedChange={() => togglePermission(menu.id)}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <div className="p-6 border-t bg-muted/20 flex justify-end gap-4">
                                <Button variant="outline" onClick={() => fetchUsers()}>Cancelar</Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? (
                                        <>Salvando...</>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Users className="h-12 w-12 mb-4 opacity-20" />
                            <p>Selecione um usuário para gerenciar permissões.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
