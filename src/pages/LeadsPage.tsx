import { useState } from 'react';
import { Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/hooks/useLeads';
import { LeadDialog } from '@/components/leads/LeadDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Lead } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LeadsPage() {
    const { leads, isLoading, createLead, updateLead, deleteLead, isCreating, isUpdating } = useLeads();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

    const filteredLeads = leads?.filter((lead) =>
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.origem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedLead(null);
        setDialogOpen(true);
    };

    const handleEdit = (lead: Lead) => {
        setSelectedLead(lead);
        setDialogOpen(true);
    };

    const handleDelete = (lead: Lead) => {
        setLeadToDelete(lead);
        setDeleteDialogOpen(true);
    };

    const handleSave = (data: any) => {
        if (selectedLead) {
            updateLead({ id: selectedLead.id, ...data });
        } else {
            createLead(data);
        }
        setDialogOpen(false);
    };

    const confirmDelete = () => {
        if (leadToDelete) {
            deleteLead(leadToDelete.id);
            setDeleteDialogOpen(false);
            setLeadToDelete(null);
        }
    };

    const getPipelineBadgeVariant = (pipeline: string) => {
        switch (pipeline) {
            case 'Novo':
                return 'default';
            case 'Qualificação':
                return 'secondary';
            case 'Visita':
                return 'outline';
            case 'Ganho':
                return 'default';
            case 'Perdido':
                return 'destructive';
            default:
                return 'default';
        }
    };

    const getUrgenciaBadgeVariant = (urgencia: string) => {
        switch (urgencia) {
            case 'Crítica':
                return 'destructive';
            case 'Alta':
                return 'default';
            case 'Normal':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Leads</CardTitle>
                            <CardDescription>
                                Gerencie todos os leads do sistema
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Lead
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar por nome, telefone, email ou origem..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Carregando...
                        </div>
                    ) : filteredLeads && filteredLeads.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Contato</TableHead>
                                        <TableHead>Origem</TableHead>
                                        <TableHead>Intenção</TableHead>
                                        <TableHead>Unidade</TableHead>
                                        <TableHead>Urgência</TableHead>
                                        <TableHead>Pipeline</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeads.map((lead) => (
                                        <TableRow key={lead.id}>
                                            <TableCell className="font-medium">{lead.nome}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{lead.telefone}</span>
                                                    </div>
                                                    {lead.email && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="text-xs">{lead.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{lead.origem}</TableCell>
                                            <TableCell>{lead.intencao}</TableCell>
                                            <TableCell>{lead.unidade}</TableCell>
                                            <TableCell>
                                                <Badge variant={getUrgenciaBadgeVariant(lead.urgencia)}>
                                                    {lead.urgencia}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getPipelineBadgeVariant(lead.pipeline)}>
                                                    {lead.pipeline}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(new Date(lead.data_criacao), 'dd/MM/yyyy', { locale: ptBR })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(lead)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(lead)}
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
                            Nenhum lead encontrado
                        </div>
                    )}
                </CardContent>
            </Card>

            <LeadDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                lead={selectedLead}
                onSave={handleSave}
                isLoading={isCreating || isUpdating}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={leadToDelete?.nome}
            />
        </div>
    );
}
