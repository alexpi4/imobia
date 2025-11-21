import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AgendarVisitaPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Agendar Visita</h1>
                <p className="text-muted-foreground">Sistema de agendamento de visitas</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Em Desenvolvimento</CardTitle>
                    <CardDescription>Esta página está em desenvolvimento</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        A funcionalidade de agendamento de visitas será implementada em breve.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
