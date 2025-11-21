import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HistoricoDistribuicaoPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Histórico de Distribuição</h1>
                <p className="text-muted-foreground">Histórico de distribuição de leads</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Em Desenvolvimento</CardTitle>
                    <CardDescription>Esta página está em desenvolvimento</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        O histórico de distribuição de leads será implementado em breve.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
