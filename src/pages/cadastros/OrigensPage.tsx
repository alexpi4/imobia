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
import { useOrigens } from '@/hooks/useOrigens';
import { OrigemDialog } from '@/components/cadastros/OrigemDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Origem } from '@/types';

export default function OrigensPage() {
    const { origens, isLoading, createOrigem, updateOrigem, deleteOrigem, isCreating, isUpdating } = useOrigens();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedOrigem, setSelectedOrigem] = useState<Origem | null>(null);
    const [origemToDelete, setOrigemToDelete] = useState<Origem | null>(null);

    const filteredOrigens = origens?.filter((origem) =>
        origem.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedOrigem(null);
        setDialogOpen(true);
    };

    const handleEdit = (origem: Origem) => {
        setSelectedOrigem(origem);
        setDialogOpen(true);
    };

    const handleDelete = (origem: Origem) => {
        setOrigemToDelete(origem);
        setDeleteDialogOpen(true);
    };

    const handleSave = (data: Omit<Origem, 'id' | 'created_at' | 'updated_at'>) => {
        if (selectedOrigem) {
            updateOrigem({ id: selectedOrigem.id, ...data });
        } else {
            createOrigem(data);
        }
        setDialogOpen(false);
    };

    const confirmDelete = () => {
        if (origemToDelete) {
            deleteOrigem(origemToDelete.id);
            setDeleteDialogOpen(false);
            setOrigemToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Origens</CardTitle>
                            <CardDescription>
                                Gerencie as origens de lead do sistema
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Origem
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
                    ) : filteredOrigens && filteredOrigens.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrigens.map((origem) => (
                                        <TableRow key={origem.id}>
                                            <TableCell className="font-medium">{origem.nome}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(origem)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(origem)}
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
                            Nenhuma origem encontrada
                        </div>
                    )}
                </CardContent>
            </Card>

            <OrigemDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                origem={selectedOrigem}
                onSave={handleSave}
                isLoading={isCreating || isUpdating}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={origemToDelete?.nome}
            />
        </div>
    );
}
