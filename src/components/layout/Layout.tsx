import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { Toaster } from 'sonner';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-auto bg-background">
                        <div className="container p-6 max-w-full mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
                <Toaster />
            </div>
        </SidebarProvider>
    );
}
