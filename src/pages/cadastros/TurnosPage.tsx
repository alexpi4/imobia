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
import { useTurnos } from '@/hooks/useTurnos';
import { TurnoDialog } from '@/components/cadastros/TurnoDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Turno } from '@/types';

export default function TurnosPage() {
    const { turnos, isLoading, createTurno, updateTurno, deleteTurno, isCreating, isUpdating } = useTurnos();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
    const [turnoToDelete, setTurnoToDelete] = useState<Turno | null>(null);

    const filteredTurnos = turnos?.filter((turno) =>
        turno.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedTurno(null);
        setDialogOpen(true);
    };

    const handleEdit = (turno: Turno) => {
        setSelectedTurno(turno);
        setDialogOpen(true);
    };

    const handleDelete = (turno: Turno) => {
        setTurnoToDelete(turno);
        setDeleteDialogOpen(true);
    };

    const handleSave = (data: Omit<Turno, 'id' | 'created_at' | 'updated_at'>) => {
        if (selectedTurno) {
            updateTurno({ id: selectedTurno.id, ...data });
        } else {
            createTurno(data);
        }
        setDialogOpen(false);
    };

    const confirmDelete = () => {
        if (turnoToDelete) {
            deleteTurno(turnoToDelete.id);
            setDeleteDialogOpen(false);
            setTurnoToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Turnos</CardTitle>
                            <CardDescription>
                                Gerencie os turnos de trabalho do sistema
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Turno
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
                    ) : filteredTurnos && filteredTurnos.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Início</TableHead>
                                        <TableHead>Fim</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTurnos.map((turno) => (
                                        <TableRow key={turno.id}>
                                            <TableCell className="font-medium">{turno.nome}</TableCell>
                                            <TableCell>{turno.hora_inicio}</TableCell>
                                            <TableCell>{turno.hora_fim}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${turno.ativo
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {turno.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(turno)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(turno)}
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
                            Nenhum turno encontrado
                        </div>
                    )}
                </CardContent>
            </Card>

            <TurnoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                turno={selectedTurno}
                onSave={handleSave}
                isLoading={isCreating || isUpdating}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={turnoToDelete?.nome}
            />
        </div>
    );
}
