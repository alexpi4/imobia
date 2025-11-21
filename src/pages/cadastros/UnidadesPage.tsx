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
import { useUnidades } from '@/hooks/useUnidades';
import { UnidadeDialog } from '@/components/cadastros/UnidadeDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Unidade } from '@/types';

export default function UnidadesPage() {
    const { unidades, isLoading, createUnidade, updateUnidade, deleteUnidade, isCreating, isUpdating } = useUnidades();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null);
    const [unidadeToDelete, setUnidadeToDelete] = useState<Unidade | null>(null);

    const filteredUnidades = unidades?.filter((unidade) =>
        unidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unidade.sigla.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedUnidade(null);
        setDialogOpen(true);
    };

    const handleEdit = (unidade: Unidade) => {
        setSelectedUnidade(unidade);
        setDialogOpen(true);
    };

    const handleDelete = (unidade: Unidade) => {
        setUnidadeToDelete(unidade);
        setDeleteDialogOpen(true);
    };

    const handleSave = (data: Omit<Unidade, 'id'>) => {
        if (selectedUnidade) {
            updateUnidade({ id: selectedUnidade.id, ...data });
        } else {
            createUnidade(data);
        }
        setDialogOpen(false);
    };

    const confirmDelete = () => {
        if (unidadeToDelete) {
            deleteUnidade(unidadeToDelete.id);
            setDeleteDialogOpen(false);
            setUnidadeToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Unidades</CardTitle>
                            <CardDescription>
                                Gerencie as unidades do sistema
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Unidade
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar por sigla ou nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Carregando...
                        </div>
                    ) : filteredUnidades && filteredUnidades.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sigla</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Responsável</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUnidades.map((unidade) => (
                                        <TableRow key={unidade.id}>
                                            <TableCell className="font-medium">{unidade.sigla}</TableCell>
                                            <TableCell>{unidade.nome}</TableCell>
                                            <TableCell>{unidade.responsavel || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(unidade)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(unidade)}
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
                            Nenhuma unidade encontrada
                        </div>
                    )}
                </CardContent>
            </Card>

            <UnidadeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                unidade={selectedUnidade}
                onSave={handleSave}
                isLoading={isCreating || isUpdating}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={unidadeToDelete?.nome}
            />
        </div>
    );
}
