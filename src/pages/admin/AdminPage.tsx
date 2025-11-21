import { AuditLogs } from '@/components/admin/AuditLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useNavigate } from 'react-router-dom';
import { Settings, Users } from 'lucide-react';

export default function AdminPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Administração</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/configuracao')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Configurações</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Sistema</div>
                        <p className="text-xs text-muted-foreground">Integrações e Webhooks</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Gerenciar</div>
                        <p className="text-xs text-muted-foreground">Permissões e Acessos</p>
                    </CardContent>
                </Card>
            </div>

            <AuditLogs />
        </div>
    );
}
