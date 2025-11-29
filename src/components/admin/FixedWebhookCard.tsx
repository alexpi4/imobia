import { useState } from 'react';
import { Pencil, Wifi } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Webhook } from '@/types';
import { toast } from 'sonner';

interface FixedWebhookCardProps {
    webhook: Webhook;
    onEdit: (webhook: Webhook) => void;
}

export function FixedWebhookCard({ webhook, onEdit }: FixedWebhookCardProps) {
    const [isTesting, setIsTesting] = useState(false);

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(webhook.secret && { 'X-Webhook-Secret': webhook.secret }),
                },
                body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
            });

            if (response.ok) {
                toast.success(`Conexão testada com sucesso! Status: ${response.status}`);
            } else {
                toast.error(`Erro na conexão. Status: ${response.status}`);
            }
        } catch (error) {
            toast.error('Erro ao testar conexão: ' + (error as Error).message);
        } finally {
            setIsTesting(false);
        }
    };

    const getStatusColor = (ativo: boolean) => {
        return ativo ? 'bg-green-500' : 'bg-gray-400';
    };

    const getStatusText = (ativo: boolean) => {
        return ativo ? 'ATIVA' : 'INATIVA';
    };

    return (
        <Card className="border border-gray-200">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header with name and status */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(webhook.ativo)}`} />
                            <h3 className="font-semibold text-sm">{webhook.nome}</h3>
                        </div>
                        <Badge
                            variant={webhook.ativo ? "default" : "secondary"}
                            className={`text-xs ${webhook.ativo ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'}`}
                        >
                            {getStatusText(webhook.ativo)}
                        </Badge>
                    </div>

                    {/* URL Input Field */}
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Endpoint URL</label>
                        <Input
                            value={webhook.url}
                            readOnly
                            className="text-xs bg-gray-50 cursor-default"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-8"
                            onClick={handleTestConnection}
                            disabled={isTesting}
                        >
                            <Wifi className="h-3 w-3 mr-1" />
                            {isTesting ? 'Testando...' : 'Test Connection'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-8 bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                            onClick={() => onEdit(webhook)}
                        >
                            <Pencil className="h-3 w-3 mr-1" />
                            Atualizar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
