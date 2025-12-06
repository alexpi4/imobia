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
import { useTimeDeVendas } from '@/hooks/useTimeDeVendas';
import { TimeDeVendasDialog } from '@/components/cadastros/TimeDeVendasDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { TimeDeVendas } from '@/types';

export default function TimeDeVendasPage() {
    const { times, isLoading, createTime, updateTime, deleteTime, isCreating, isUpdating } = useTimeDeVendas();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState<TimeDeVendas | null>(null);
    const [timeToDelete, setTimeToDelete] = useState<TimeDeVendas | null>(null);

    const filteredTimes = times?.filter((time) =>
        time.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        time.responsavel?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedTime(null);
        setDialogOpen(true);
    };

    const handleEdit = (time: TimeDeVendas) => {
        setSelectedTime(time);
        setDialogOpen(true);
    };

    const handleDelete = (time: TimeDeVendas) => {
        setTimeToDelete(time);
        setDeleteDialogOpen(true);
    };

    const handleSave = (data: Omit<TimeDeVendas, 'id' | 'created_at' | 'updated_at'>) => {
        if (selectedTime) {
            updateTime({ id: selectedTime.id, ...data });
        } else {
            createTime(data);
        }
        setDialogOpen(false);
    };

    const confirmDelete = () => {
        if (timeToDelete) {
            deleteTime(timeToDelete.id);
            setDeleteDialogOpen(false);
            setTimeToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Time de Vendas</CardTitle>
                            <CardDescription>
                                Gerencie os times de vendas do sistema
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Time
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar por nome ou responsável..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Carregando...
                        </div>
                    ) : filteredTimes && filteredTimes.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Responsável</TableHead>
                                        <TableHead>Unidade</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTimes.map((time) => (
                                        <TableRow key={time.id}>
                                            <TableCell className="font-medium">{time.nome}</TableCell>
                                            <TableCell>{time.responsavel || '-'}</TableCell>
                                            <TableCell>{time.unidade || '-'}</TableCell>
                                            <TableCell>{time.email || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(time)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(time)}
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
                            Nenhum time encontrado
                        </div>
                    )}
                </CardContent>
            </Card>

            <TimeDeVendasDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                time={selectedTime}
                onSave={handleSave}
                isLoading={isCreating || isUpdating}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={timeToDelete?.nome}
            />
        </div>
    );
}
