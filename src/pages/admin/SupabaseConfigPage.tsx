import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SupabaseConfigPage() {
    const [url, setUrl] = useState('');
    const [anonKey, setAnonKey] = useState('');
    const [isCustom, setIsCustom] = useState(false);

    useEffect(() => {
        const localUrl = localStorage.getItem('VITE_SUPABASE_URL');
        const localKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');

        if (localUrl || localKey) {
            setUrl(localUrl || '');
            setAnonKey(localKey || '');
            setIsCustom(true);
        } else {
            // Load from env if not in local storage (just for display, though we can't easily read env vars back if they are bundled, 
            // but we can try to show what's currently active if we import from client.ts or just leave empty/placeholder)
            // Actually, for security/clarity, let's leave them empty or show placeholders if using default.
            // But better yet, let's show the current active values if possible, or just empty.
            // Since we can't easily "read" the env vars in a way that distinguishes them from local storage here without re-importing logic,
            // let's just rely on the fact that if local storage is empty, we are using defaults.
            setUrl(import.meta.env.VITE_SUPABASE_URL || '');
            setAnonKey(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
            setIsCustom(false);
        }
    }, []);

    const handleSave = () => {
        if (!url || !anonKey) {
            toast.error('URL e Anon Key são obrigatórios');
            return;
        }

        localStorage.setItem('VITE_SUPABASE_URL', url);
        localStorage.setItem('VITE_SUPABASE_ANON_KEY', anonKey);
        setIsCustom(true);
        toast.success('Configurações salvas! A página será recarregada.');

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const handleReset = () => {
        localStorage.removeItem('VITE_SUPABASE_URL');
        localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
        setIsCustom(false);

        // Reset state to env defaults
        setUrl(import.meta.env.VITE_SUPABASE_URL || '');
        setAnonKey(import.meta.env.VITE_SUPABASE_ANON_KEY || '');

        toast.success('Configurações restauradas para o padrão! A página será recarregada.');

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    return (
        <div className="p-8 space-y-6 bg-background min-h-screen">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuração Supabase</h1>
                <p className="text-muted-foreground">Gerencie a conexão com o banco de dados Supabase.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Conexão</CardTitle>
                    <CardDescription>
                        Configure a URL e a Chave Anônima do seu projeto Supabase.
                        <br />
                        <span className="font-bold text-yellow-600">Atenção:</span> Alterar estas configurações afetará a conexão de toda a aplicação neste navegador.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isCustom ? (
                        <Alert variant="default" className="border-yellow-500 bg-yellow-50 text-yellow-900">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Modo Personalizado Ativo</AlertTitle>
                            <AlertDescription>
                                Você está usando configurações personalizadas salvas localmente.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert variant="default" className="border-blue-500 bg-blue-50 text-blue-900">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Modo Padrão</AlertTitle>
                            <AlertDescription>
                                Você está usando as configurações padrão do ambiente (.env).
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="url">Supabase URL</Label>
                        <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://seu-projeto.supabase.co"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="key">Supabase Anon Key</Label>
                        <Input
                            id="key"
                            value={anonKey}
                            onChange={(e) => setAnonKey(e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            type="password"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button onClick={handleSave} className="flex-1 md:flex-none">
                            <Save className="mr-2 h-4 w-4" />
                            Salvar e Reiniciar
                        </Button>

                        {isCustom && (
                            <Button variant="destructive" onClick={handleReset} className="flex-1 md:flex-none">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restaurar Padrão
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
