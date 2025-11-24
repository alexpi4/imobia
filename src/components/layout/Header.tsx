import { useWhiteLabelContext } from '@/contexts/WhiteLabelContext';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
    const { settings } = useWhiteLabelContext();
    const { user } = useAuth();

    const currentDate = format(new Date(), "MMMM dd, yyyy", { locale: ptBR });

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-6">
                {/* Left side - Menu Toggle, Logo and Company Name */}
                <div className="flex items-center gap-3">
                    <SidebarTrigger />
                    {settings?.logo_url && (
                        <img
                            src={settings.logo_url}
                            alt={settings.company_name || 'Logo'}
                            className="h-10 w-auto object-contain"
                        />
                    )}
                    <h1 className="text-xl font-semibold">
                        {settings?.company_name || 'iMóbia CRM'}
                    </h1>
                </div>

                {/* Right side - User and Date */}
                <div className="flex items-center gap-6">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="capitalize">{currentDate}</span>
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                            {user?.email || 'Usuário'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
