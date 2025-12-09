import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWhiteLabelContext } from '@/contexts/WhiteLabelContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Mail, Lock, Loader2 } from 'lucide-react';

export default function Auth() {
    const navigate = useNavigate();
    const { settings, isLoading: whiteLabelLoading } = useWhiteLabelContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Verifique seu email para confirmar o cadastro!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const companyName = settings?.company_name || 'iMóbia CRM';
    const logoUrl = settings?.logo_url;

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
                {/* Animated background elements */}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    <div className="max-w-md text-center space-y-6">
                        {logoUrl ? (
                            <div className="flex justify-center mb-8">
                                <img
                                    src={logoUrl}
                                    alt={companyName}
                                    className="h-24 w-auto object-contain drop-shadow-2xl"
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center mb-8">
                                <Building2 className="h-24 w-24 drop-shadow-2xl" />
                            </div>
                        )}
                        <h1 className="text-5xl font-bold tracking-tight drop-shadow-lg">
                            {companyName}
                        </h1>
                        <p className="text-xl text-white/90 drop-shadow-md">
                            Gerencie seus leads e vendas com eficiência
                        </p>
                        <div className="pt-8 space-y-4">
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span>Pipeline de vendas inteligente</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span>Automação de processos</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span>Análises em tempo real</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={companyName}
                                className="h-16 w-auto object-contain mb-4"
                            />
                        ) : (
                            <Building2 className="h-16 w-16 text-primary mb-4" />
                        )}
                        <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
                    </div>

                    {/* Auth Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                                {isSignUp ? 'Criar Conta' : 'Bem-vindo'}
                            </h2>
                            <p className="text-gray-600">
                                {isSignUp
                                    ? 'Preencha os dados para criar sua conta'
                                    : 'Entre com suas credenciais para continuar'}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Senha
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary transition-all"
                                    />
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                type="submit"
                                disabled={loading || whiteLabelLoading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Carregando...
                                    </>
                                ) : (
                                    isSignUp ? 'Cadastrar' : 'Entrar'
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">ou</span>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                type="button"
                                className="w-full h-12 text-base font-medium hover:bg-gray-100 transition-all"
                                onClick={() => setIsSignUp(!isSignUp)}
                            >
                                {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem conta? Cadastre-se'}
                            </Button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-600 mt-8">
                        © 2024 {companyName}. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
