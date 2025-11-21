import { CalendarDays } from 'lucide-react';

export default function GoogleCalendarPage() {
    return (
        <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Google Calendar</h1>
            </div>
            <div className="bg-muted/50 rounded-lg p-8 text-center">
                <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Integração com Google Calendar</h2>
                <p className="text-muted-foreground">
                    Esta funcionalidade estará disponível em breve.
                </p>
            </div>
        </div>
    );
}
