import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Search, Edit, Trash2, Camera } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

import { toast } from 'sonner';

interface UserProfile {
    id: number;
    user_id: string;
    nome: string;
    email: string;
    telefone?: string;
    papel: string;
    unidade_id?: number;
    equipe_id?: number;
    ativo: boolean;
    turnos?: string[];
    ativo_roleta: boolean;
    ultimo_atendimento?: string;
    created_at: string;
    avatar_url?: string;
    creci?: string;
    pipeline_id?: number;
}


interface FormData {
    nome: string;
    email: string;
    telefone: string;
    papel: string;
    unidade_id: string;
    equipe_id: string;
    turnos: string[];
    ativo_roleta: boolean;
    creci: string;
    pipeline_id: string;
    ativo: boolean;
    avatar_url: string;
}

interface Turno {
    id: number;
    nome: string;
}

interface Unidade {
    id: number;
    nome: string;
}

interface Equipe {
    id: number;
    nome: string;
}

interface Pipeline {
    id: number;
    nome: string;
}

export default function UsuariosPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);

    // New state for avatar handling
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        nome: '',
        email: '',
        telefone: '',
        papel: 'NENHUM',
        unidade_id: '',
        equipe_id: '',
        turnos: [],
        ativo_roleta: false,
        creci: '',
        pipeline_id: '',
        ativo: true,
        avatar_url: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchTurnos();
        fetchUnidades();
        fetchEquipes();
        fetchPipelines();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('nome');

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Erro ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTurnos = async () => {
        try {
            const { data, error } = await supabase
                .from('turnos')
                .select('id, nome')
                .order('nome');

            if (error) throw error;
            setTurnos(data || []);
        } catch (error) {
            console.error('Error fetching turnos:', error);
            toast.error('Erro ao carregar turnos.');
        }
    };

    const fetchUnidades = async () => {
        try {
            const { data, error } = await supabase
                .from('unidades')
                .select('id, nome')
                .order('nome');

            if (error) throw error;
            setUnidades(data || []);
        } catch (error) {
            console.error('Error fetching unidades:', error);
            toast.error('Erro ao carregar unidades.');
        }
    };

    const fetchEquipes = async () => {
        try {
            const { data, error } = await supabase
                .from('time_de_vendas')
                .select('id, nome')
                .order('nome');

            if (error) throw error;
            setEquipes(data || []);
        } catch (error) {
            console.error('Error fetching equipes:', error);
            toast.error('Erro ao carregar equipes.');
        }
    };

    const fetchPipelines = async () => {
        try {
            const { data, error } = await supabase
                .from('pipelines')
                .select('id, nome')
                .order('nome');

            if (error) throw error;
            setPipelines(data || []);
        } catch (error) {
            console.error('Error fetching pipelines:', error);
            // Non-critical, some setups might not have pipelines yet
        }
    };

    const handleOpenDialog = (user?: UserProfile) => {
        setAvatarFile(null);
        setAvatarPreview(null);

        if (user) {
            setEditingUser(user);

            setFormData({
                nome: user.nome,
                email: user.email,
                telefone: user.telefone || '',
                papel: user.papel,
                unidade_id: user.unidade_id ? user.unidade_id.toString() : '',
                equipe_id: user.equipe_id ? user.equipe_id.toString() : '',
                turnos: user.turnos || [],
                ativo_roleta: user.ativo_roleta,
                creci: user.creci || '',
                pipeline_id: user.pipeline_id ? user.pipeline_id.toString() : '',
                ativo: user.ativo !== false, // Default to true if undefined
                avatar_url: user.avatar_url || ''
            });

            if (user.avatar_url) {
                setAvatarPreview(user.avatar_url);
            }
        } else {
            setEditingUser(null);
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                papel: 'NENHUM',
                unidade_id: '',
                equipe_id: '',
                turnos: [],
                ativo_roleta: false,
                creci: '',
                pipeline_id: '',
                ativo: true,
                avatar_url: ''
            });
        }
        setDialogOpen(true);
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const objectUrl = URL.createObjectURL(file);
            setAvatarPreview(objectUrl);
        }
    };

    const uploadAvatar = async (userId: string) => {
        if (!avatarFile) return null;

        try {
            setUploadingAvatar(true);
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${userId}.${fileExt}`;
            const filePath = `${fileName}`; // Overwrite existing if any

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error('Erro ao fazer upload da imagem.');
            return null;
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        try {


            let avatarUrl = formData.avatar_url;

            if (editingUser && avatarFile) {
                const uploadedUrl = await uploadAvatar(editingUser.user_id);
                if (uploadedUrl) {
                    avatarUrl = uploadedUrl;
                }
            } else if (!editingUser && avatarFile) {
                toast.warning("Para fazer upload de imagem, crie o usuário primeiro.");
                // We avoid uploading for new users here to simplify logic, 
                // as we can't create auth users easily from client as noted before.
            }

            const dataToSave = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone || null,
                papel: formData.papel,
                unidade_id: formData.unidade_id ? parseInt(formData.unidade_id) : null,
                equipe_id: formData.equipe_id ? parseInt(formData.equipe_id) : null,
                turnos: formData.turnos,
                ativo_roleta: formData.ativo_roleta,
                creci: formData.creci || null,
                pipeline_id: formData.pipeline_id ? parseInt(formData.pipeline_id) : null,
                ativo: formData.ativo,
                avatar_url: avatarUrl
            };

            if (editingUser) {
                const { error } = await supabase
                    .from('profiles')
                    .update(dataToSave)
                    .eq('id', editingUser.id);

                if (error) {
                    console.error('Supabase error:', error);
                    throw new Error(error.message || 'Erro desconhecido ao atualizar usuário');
                }
                toast.success('Usuário atualizado com sucesso!');
            } else {
                toast.error('Criação de novos usuários deve ser feita via signup.');
                return;
            }

            setDialogOpen(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error saving user:', error);
            toast.error(`Erro ao salvar usuário: ${error.message || 'Erro desconhecido'}`);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            toast.success('Usuário excluído com sucesso!');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Erro ao excluir usuário.');
        }
    };

    const toggleTurno = (turno: string) => {
        setFormData(prev => ({
            ...prev,
            turnos: prev.turnos.includes(turno)
                ? prev.turnos.filter(t => t !== turno)
                : [...prev.turnos, turno]
        }));
    };

    const filteredUsers = users.filter(user =>
        user.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Colaboradores</h1>
                    <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Adicionar Novo Colaborador
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-6 py-4">

                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={avatarPreview || ''} />
                                    <AvatarFallback className="text-xl">
                                        {formData.nome ? getInitials(formData.nome) : '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                                        <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80">
                                            <Camera className="h-4 w-4" />
                                            Alterar Foto
                                        </div>
                                        <Input
                                            id="avatar-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                        />
                                    </Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome</Label>
                                    <Input
                                        id="nome"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="creci">CRECI</Label>
                                    <Input
                                        id="creci"
                                        value={formData.creci}
                                        onChange={(e) => setFormData({ ...formData, creci: e.target.value })}
                                        placeholder="Ex: 12345-F"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!!editingUser}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <Input
                                        id="telefone"
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="papel">Tipo (Função)</Label>
                                    <Select value={formData.papel} onValueChange={(value) => setFormData({ ...formData, papel: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CORRETOR">Corretor</SelectItem>
                                            <SelectItem value="GESTOR">Gestor</SelectItem>
                                            <SelectItem value="Agenciador">Agenciador</SelectItem>
                                            <SelectItem value="Atendente">Atendente</SelectItem>
                                            <SelectItem value="NENHUM">Nenhum</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pipeline">Pipeline Principal</Label>
                                    <Select value={formData.pipeline_id} onValueChange={(value) => setFormData({ ...formData, pipeline_id: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nenhum</SelectItem>
                                            {pipelines.map((p) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="unidade">Unidade</Label>
                                    <Select value={formData.unidade_id} onValueChange={(value) => setFormData({ ...formData, unidade_id: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unidades.map((unidade) => (
                                                <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                                    {unidade.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="equipe">Equipe</Label>
                                    <Select value={formData.equipe_id} onValueChange={(value) => setFormData({ ...formData, equipe_id: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {equipes.map((equipe) => (
                                                <SelectItem key={equipe.id} value={equipe.id.toString()}>
                                                    {equipe.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Turnos Disponíveis</Label>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    {turnos.map((turno) => (
                                        <div key={turno.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`turno-${turno.id}`}
                                                checked={formData.turnos.includes(turno.nome)}
                                                onCheckedChange={() => toggleTurno(turno.nome)}
                                            />
                                            <label htmlFor={`turno-${turno.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {turno.nome}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t pt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ativo_roleta"
                                        checked={formData.ativo_roleta}
                                        onCheckedChange={(checked) => setFormData({ ...formData, ativo_roleta: checked as boolean })}
                                    />
                                    <label htmlFor="ativo_roleta" className="text-sm font-medium">Ativo na Roleta</label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="ativo"
                                        checked={formData.ativo}
                                        onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                                    />
                                    <Label htmlFor="ativo">Usuário Ativo</Label>
                                </div>
                            </div>

                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={uploadingAvatar}>
                                {uploadingAvatar ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Colaboradores</CardTitle>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou email..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">FOTO</TableHead>
                                <TableHead>NOME</TableHead>
                                <TableHead>EMAIL</TableHead>
                                <TableHead>TIPO</TableHead>
                                <TableHead>EQUIPE / UNIDADE</TableHead>
                                <TableHead>STATUS</TableHead>
                                <TableHead>PIPELINE</TableHead>
                                <TableHead>AÇÕES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">Carregando...</TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">Nenhum usuário encontrado.</TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className={user.ativo ? '' : 'opacity-60 bg-muted/50'}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarImage src={user.avatar_url || ''} alt={user.nome} />
                                                <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.nome}</span>
                                                {user.creci && <span className="text-xs text-muted-foreground">CRECI: {user.creci}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.papel}</TableCell>
                                        <TableCell>
                                            {
                                                user.equipe_id
                                                    ? equipes.find(e => e.id === user.equipe_id)?.nome || '-'
                                                    : ''
                                            }
                                            {(user.equipe_id && user.unidade_id) ? ' / ' : ''}
                                            {
                                                user.unidade_id
                                                    ? unidades.find(u => u.id === user.unidade_id)?.nome || '-'
                                                    : ''
                                            }
                                            {(!user.equipe_id && !user.unidade_id) ? '-' : ''}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant={user.ativo ? 'default' : 'destructive'} className="w-fit">
                                                    {user.ativo ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                                {user.ativo_roleta && (
                                                    <Badge variant="outline" className="w-fit text-xs border-green-500 text-green-600">
                                                        Roleta ON
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {
                                                user.pipeline_id
                                                    ? pipelines.find(p => p.id === user.pipeline_id)?.nome || 'ID: ' + user.pipeline_id
                                                    : '-'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog(user)}
                                                    disabled={user.papel === 'ADMIN'}
                                                    title={user.papel === 'ADMIN' ? 'Não é possível editar usuários ADMIN' : 'Editar'}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={user.papel === 'ADMIN'}
                                                    title={user.papel === 'ADMIN' ? 'Não é possível excluir usuários ADMIN' : 'Excluir'}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
