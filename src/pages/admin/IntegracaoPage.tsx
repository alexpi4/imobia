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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIntegracoes } from '@/hooks/useIntegracoes';
import { IntegracaoDialog } from '@/components/cadastros/IntegracaoDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Integracao } from '@/types';

export default function IntegracaoPage() {
    const { integracoes, isLoading, createIntegracao, updateIntegracao, deleteIntegracao, isCreating, isUpdating } = useIntegracoes();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedIntegracao, setSelectedIntegracao] = useState<Integracao | null>(null);
    const [integracaoToDelete, setIntegracaoToDelete] = useState<Integracao | null>(null);

    const filteredIntegracoes = integracoes?.filter((integracao) =>
        integracao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integracao.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedIntegracao(null);
        setDialogOpen(true);
    };

    const handleEdit = (integracao: Integracao) => {
        setSelectedIntegracao(integracao);
        setDialogOpen(true);
    };

    const handleDelete = (integracao: Integracao) => {
        setIntegracaoToDelete(integracao);
        setDeleteDialogOpen(true);
    };

    const handleSave = (data: Omit<Integracao, 'id' | 'created_at' | 'updated_at'>) => {
        if (selectedIntegracao) {
            updateIntegracao({ id: selectedIntegracao.id, ...data });
        } else {
            createIntegracao(data);
        }
        setDialogOpen(false);
    };

    const confirmDelete = () => {
        if (integracaoToDelete) {
            deleteIntegracao(integracaoToDelete.id);
            setDeleteDialogOpen(false);
            setIntegracaoToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Integrações</CardTitle>
                            <CardDescription>
                                Gerencie as integrações do sistema
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Integração
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
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
                    ) : filteredIntegracoes && filteredIntegracoes.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredIntegracoes.map((integracao) => (
                                        <TableRow key={integracao.id}>
                                            <TableCell className="font-medium">{integracao.nome}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{integracao.url}</TableCell>
                                            <TableCell>
                                                <Badge variant={integracao.status === 'ativo' ? 'default' : 'secondary'}>
                                                    {integracao.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(integracao)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(integracao)}
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
                            Nenhuma integração encontrada
                        </div>
                    )}
                </CardContent>
            </Card>

            <IntegracaoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                integracao={selectedIntegracao}
                onSave={handleSave}
                isLoading={isCreating || isUpdating}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={integracaoToDelete?.nome}
            />
        </div>
    );
}
