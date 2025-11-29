import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useWebhooks } from '@/hooks/useWebhooks';
import { WebhookDialog, WebhookFormData } from '@/components/admin/WebhookDialog';
import { FixedWebhookCard } from '@/components/admin/FixedWebhookCard';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Webhook } from '@/types';
import { format } from 'date-fns';

export default function WebhooksPage() {
    const { fixedWebhooks, customWebhooks, isLoading, createWebhook, updateWebhook, deleteWebhook, isCreating, isUpdating } = useWebhooks();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
    const [webhookToDelete, setWebhookToDelete] = useState<Webhook | null>(null);

    const filteredCustomWebhooks = customWebhooks?.filter((webhook) =>
        webhook.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        webhook.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedWebhook(null);
        setDialogOpen(true);
    };

    const handleEdit = (webhook: Webhook) => {
        setSelectedWebhook(webhook);
        setDialogOpen(true);
    };

    const handleDelete = (webhook: Webhook) => {
        setWebhookToDelete(webhook);
        setDeleteDialogOpen(true);
    };

    const handleSave = (data: WebhookFormData & { eventos: string[] }) => {
        if (selectedWebhook) {
            updateWebhook({ id: selectedWebhook.id, ...data });
        } else {
            createWebhook(data);
        }
        setDialogOpen(false);
    };

    const confirmDelete = () => {
        if (webhookToDelete) {
            deleteWebhook(webhookToDelete.id);
            setDeleteDialogOpen(false);
            setWebhookToDelete(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Fixed System Webhooks Section */}
            <div>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">WebHooks do Sistema</h2>
                    <p className="text-sm text-muted-foreground">
                        Webhooks nativos do sistema para operações internas
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Carregando...
                    </div>
                ) : fixedWebhooks && fixedWebhooks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fixedWebhooks.map((webhook) => (
                            <FixedWebhookCard
                                key={webhook.id}
                                webhook={webhook}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Nenhum webhook fixo encontrado
                    </div>
                )}
            </div>

            {/* Custom Webhooks Section */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Webhooks para Integração</h2>
                        <p className="text-sm text-muted-foreground">
                            Gerencie webhooks customizados para integrações externas
                        </p>
                    </div>
                    <Button onClick={handleCreate} className="bg-red-500 hover:bg-red-600">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Webhook
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="mb-4">
                            <Input
                                placeholder="Buscar por nome ou URL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>

                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Carregando...
                            </div>
                        ) : filteredCustomWebhooks && filteredCustomWebhooks.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>URL</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Execuções</TableHead>
                                            <TableHead>Última Execução</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCustomWebhooks.map((webhook) => (
                                            <TableRow key={webhook.id}>
                                                <TableCell className="font-medium">{webhook.nome}</TableCell>
                                                <TableCell className="max-w-xs truncate">{webhook.url}</TableCell>
                                                <TableCell className="capitalize">{webhook.tipo}</TableCell>
                                                <TableCell>
                                                    <StatusBadge status={webhook.ativo} />
                                                </TableCell>
                                                <TableCell>{webhook.total_execucoes}</TableCell>
                                                <TableCell>
                                                    {webhook.ultima_execucao
                                                        ? format(new Date(webhook.ultima_execucao), 'dd/MM/yyyy HH:mm')
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(webhook)}
                                                            title="Editar"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(webhook)}
                                                            title="Excluir"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum webhook encontrado
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <WebhookDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                webhook={selectedWebhook}
                onSave={handleSave}
                isLoading={isCreating || isUpdating}
                isFixed={selectedWebhook?.fix === true}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={webhookToDelete?.nome}
            />
        </div>
    );
}
