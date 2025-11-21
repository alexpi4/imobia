import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types';
import { Phone, Mail, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadCardProps {
    lead: Lead;
    isDragging?: boolean;
    onClick?: () => void;
}

export function LeadCard({ lead, isDragging = false, onClick }: LeadCardProps) {
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
        <Card
            className={`cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-lg' : ''} hover:border-primary transition-colors`}
            onClick={onClick}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold line-clamp-1">
                        {lead.nome}
                    </CardTitle>
                    <Badge variant={getUrgenciaBadgeVariant(lead.urgencia)} className="text-xs">
                        {lead.urgencia}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span className="truncate">{lead.telefone}</span>
                </div>

                {lead.email && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{lead.email}</span>
                    </div>
                )}

                {lead.valor && (
                    <div className="flex items-center gap-1 font-semibold text-green-600">
                        <DollarSign className="h-3 w-3" />
                        <span>
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            }).format(lead.valor)}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-1 text-muted-foreground pt-1 border-t">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(lead.data_criacao), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                    <Badge variant="outline" className="text-xs">
                        {lead.origem}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {lead.intencao}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
