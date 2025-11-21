import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Toaster } from 'sonner';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1 overflow-auto bg-background">
                    <div className="p-4">
                        <SidebarTrigger />
                    </div>
                    <div className="container p-6 max-w-[1800px] mx-auto">
                        {children}
                    </div>
                </main>
                <Toaster />
            </div>
        </SidebarProvider>
    );
}
