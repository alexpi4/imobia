import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WebhooksManager } from '@/components/admin/WebhooksManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ConfiguracaoPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Configurações do Sistema</h1>

            <Tabs defaultValue="webhooks" className="w-full">
                <TabsList>
                    <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                    <TabsTrigger value="google">Google Calendar</TabsTrigger>
                    <TabsTrigger value="crm">Integração CRM</TabsTrigger>
                </TabsList>

                <TabsContent value="webhooks">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gerenciamento de Webhooks</CardTitle>
                            <CardDescription>Configure webhooks para receber ou enviar dados.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <WebhooksManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="google">
                    <Card>
                        <CardHeader>
                            <CardTitle>Google Calendar</CardTitle>
                            <CardDescription>Conecte sua conta do Google para sincronizar eventos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded bg-muted/50 text-center">
                                <p className="mb-4">Integração não configurada.</p>
                                <Button variant="outline">Conectar com Google</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="crm">
                    <Card>
                        <CardHeader>
                            <CardTitle>CRM Externo</CardTitle>
                            <CardDescription>Configurações de sincronização com CRMs externos (ex: RD Station).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label>URL da API</label>
                                <Input placeholder="https://api.crm-externo.com/v1" />
                            </div>
                            <div className="space-y-2">
                                <label>Chave de API</label>
                                <Input type="password" placeholder="sk_..." />
                            </div>
                            <Button>Salvar Configurações</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
