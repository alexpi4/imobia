import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { usePipelines } from '@/hooks/usePipelines';
import { useUnidades } from '@/hooks/useUnidades';

export default function PipelineListPage() {
    const navigate = useNavigate();
    const { pipelines, isLoading, deletePipeline } = usePipelines();
    const { unidades } = useUnidades();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const filteredPipelines = pipelines?.filter(pipeline =>
        pipeline.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getUnidadeNome = (id: number) => {
        return unidades?.find(u => u.id === id)?.nome || 'N/A';
    };

    const handleDelete = async () => {
        if (deleteId) {
            await deletePipeline.mutateAsync(deleteId);
            setDeleteId(null);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Carregando pipelines...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Pipelines</h1>
                <Button onClick={() => navigate('/cadastros/pipelines/novo')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Pipeline
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar pipelines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Unidade</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Etapas</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPipelines?.map((pipeline) => (
                            <TableRow key={pipeline.id}>
                                <TableCell className="font-medium">{pipeline.nome}</TableCell>
                                <TableCell>{getUnidadeNome(pipeline.unidade_id)}</TableCell>
                                <TableCell className="capitalize">{pipeline.tipo}</TableCell>
                                <TableCell>
                                    <Badge variant={pipeline.ativo ? 'default' : 'secondary'}>
                                        {pipeline.ativo ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{pipeline.etapas?.length || 0}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigate(`/cadastros/pipelines/${pipeline.id}/editar`)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => setDeleteId(pipeline.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredPipelines?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum pipeline encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o pipeline
                            e todas as suas etapas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
