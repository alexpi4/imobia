import { useState } from 'react';
import { useCadastro } from '@/hooks/useCadastros';
import { Webhook } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';

export function WebhooksManager() {
    const { data: webhooks, loading, create, remove } = useCadastro<Webhook>('webhooks');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newWebhook, setNewWebhook] = useState<Partial<Webhook>>({
        nome: '',
        url: '',
        tipo: 'manual',
        ativo: true,
        eventos: []
    });

    const handleCreate = async () => {
        await create(newWebhook);
        setIsDialogOpen(false);
        setNewWebhook({ nome: '', url: '', tipo: 'manual', ativo: true, eventos: [] });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Webhooks Configurados</h3>
                <Button onClick={() => setIsDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={5}>Carregando...</TableCell></TableRow>
                    ) : webhooks.map(webhook => (
                        <TableRow key={webhook.id}>
                            <TableCell>{webhook.nome}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{webhook.url}</TableCell>
                            <TableCell>{webhook.tipo}</TableCell>
                            <TableCell>{webhook.ativo ? 'Ativo' : 'Inativo'}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => remove(webhook.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Webhook</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label>Nome</label>
                            <Input
                                value={newWebhook.nome}
                                onChange={e => setNewWebhook({ ...newWebhook, nome: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label>URL</label>
                            <Input
                                value={newWebhook.url}
                                onChange={e => setNewWebhook({ ...newWebhook, url: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={newWebhook.ativo}
                                onCheckedChange={c => setNewWebhook({ ...newWebhook, ativo: c })}
                            />
                            <label>Ativo</label>
                        </div>
                        <Button onClick={handleCreate} className="w-full">Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
