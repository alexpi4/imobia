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
import { useCidades } from '@/hooks/useCidades';
import { CidadeDialog } from '@/components/cadastros/CidadeDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Cidade } from '@/types';
import { format } from 'date-fns';

export default function CidadesPage() {
    const { cidades, isLoading, createCidade, updateCidade, deleteCidade, isCreating, isUpdating } = useCidades();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null);
    const [cidadeToDelete, setCidadeToDelete] = useState<Cidade | null>(null);

    const filteredCidades = cidades?.filter((cidade) =>
        cidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cidade.estado.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedCidade(null);
        setDialogOpen(true);
    };

    const handleEdit = (cidade: Cidade) => {
        setSelectedCidade(cidade);
        setDialogOpen(true);
    };

    const handleDelete = (cidade: Cidade) => {
        setCidadeToDelete(cidade);
        setDeleteDialogOpen(true);
    };

    const handleSave = (data: Omit<Cidade, 'id' | 'created_at' | 'updated_at'>) => {
        if (selectedCidade) {
            updateCidade({ id: selectedCidade.id, ...data });
        } else {
            createCidade(data);
        }
        setDialogOpen(false);
    };

    const confirmDelete = () => {
        if (cidadeToDelete) {
            deleteCidade(cidadeToDelete.id);
            setDeleteDialogOpen(false);
            setCidadeToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Cidades</CardTitle>
                            <CardDescription>
                                Gerencie as cidades disponíveis no sistema
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Cidade
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar por nome ou estado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Carregando...
                        </div>
                    ) : filteredCidades && filteredCidades.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Criado em</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCidades.map((cidade) => (
                                        <TableRow key={cidade.id}>
                                            <TableCell className="font-medium">{cidade.nome}</TableCell>
                                            <TableCell>{cidade.estado}</TableCell>
                                            <TableCell>
                                                {format(new Date(cidade.created_at), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(cidade)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(cidade)}
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
                            Nenhuma cidade encontrada
                        </div>
                    )}
                </CardContent>
            </Card>

            <CidadeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                cidade={selectedCidade}
                onSave={handleSave}
                isLoading={isCreating || isUpdating}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={cidadeToDelete?.nome}
            />
        </div>
    );
}
