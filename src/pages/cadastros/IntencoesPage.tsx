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
import { useIntencoes } from '@/hooks/useIntencoes';
import { IntencaoDialog } from '@/components/cadastros/IntencaoDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Intencao } from '@/types';

export default function IntencoesPage() {
    const { intencoes, isLoading, createIntencao, updateIntencao, deleteIntencao, isCreating, isUpdating } = useIntencoes();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedIntencao, setSelectedIntencao] = useState<Intencao | null>(null);
    const [intencaoToDelete, setIntencaoToDelete] = useState<Intencao | null>(null);

    const filteredIntencoes = intencoes?.filter((intencao) =>
        intencao.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedIntencao(null);
        setDialogOpen(true);
    };

    const handleEdit = (intencao: Intencao) => {
        setSelectedIntencao(intencao);
        setDialogOpen(true);
    };

    const handleDelete = (intencao: Intencao) => {
        setIntencaoToDelete(intencao);
        setDeleteDialogOpen(true);
    };

    const handleSave = (data: Omit<Intencao, 'id' | 'created_at' | 'updated_at'>) => {
        if (selectedIntencao) {
            updateIntencao({ id: selectedIntencao.id, ...data });
        } else {
            createIntencao(data);
        }
        setDialogOpen(false);
    };

    const confirmDelete = () => {
        if (intencaoToDelete) {
            deleteIntencao(intencaoToDelete.id);
            setDeleteDialogOpen(false);
            setIntencaoToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Intenções</CardTitle>
                            <CardDescription>
                                Gerencie as intenções de lead do sistema
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Intenção
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Carregando...
                        </div>
                    ) : filteredIntencoes && filteredIntencoes.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredIntencoes.map((intencao) => (
                                        <TableRow key={intencao.id}>
                                            <TableCell className="font-medium">{intencao.nome}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(intencao)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(intencao)}
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
                            Nenhuma intenção encontrada
                        </div>
                    )}
                </CardContent>
            </Card>

            <IntencaoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                intencao={selectedIntencao}
                onSave={handleSave}
                isLoading={isCreating || isUpdating}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={intencaoToDelete?.nome}
            />
        </div>
    );
}
