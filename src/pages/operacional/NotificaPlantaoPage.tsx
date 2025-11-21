import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotificaPlantaoPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Notifica Plantão</h1>
                <p className="text-muted-foreground">Sistema de notificação de plantão</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Em Desenvolvimento</CardTitle>
                    <CardDescription>Esta página está em desenvolvimento</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        A funcionalidade de notificação de plantão será implementada em breve.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
