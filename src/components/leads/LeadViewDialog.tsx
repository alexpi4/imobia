import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: Lead | null;
    onEdit: () => void;
}

export function LeadViewDialog({
    open,
    onOpenChange,
    lead,
    onEdit,
}: LeadViewDialogProps) {
    if (!lead) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalhes do Lead</DialogTitle>
                    <DialogDescription>
                        Visualização completa das informações do lead.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Nome</h4>
                            <p className="text-base font-medium">{lead.nome}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Telefone</h4>
                            <p className="text-base">{lead.telefone}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                        <p className="text-base">{lead.email || '-'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Origem</h4>
                            <p className="text-base">{lead.origem}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Intenção</h4>
                            <p className="text-base">{lead.intencao}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Cidade</h4>
                            <p className="text-base">{lead.cidade || '-'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Unidade</h4>
                            <p className="text-base">{lead.unidade}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Urgência</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${lead.urgencia === 'Crítica' ? 'bg-red-100 text-red-800' :
                                    lead.urgencia === 'Alta' ? 'bg-orange-100 text-orange-800' :
                                        'bg-blue-100 text-blue-800'}`}>
                                {lead.urgencia}
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Pipeline / Etapa</h4>
                            <p className="text-base">
                                {lead.pipeline_obj?.nome || 'Pipeline Padrão'} / {lead.etapa_obj?.nome || lead.pipeline}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Imóvel</h4>
                            <p className="text-base">{lead.imovel || '-'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Valor</h4>
                            <p className="text-base">
                                {lead.valor
                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor)
                                    : '-'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Resumo</h4>
                        <p className="text-base whitespace-pre-wrap bg-muted p-3 rounded-md text-sm">
                            {lead.resumo || 'Nenhuma observação.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                            Criado em: {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Fechar
                    </Button>
                    <Button onClick={onEdit}>
                        Editar Lead
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
