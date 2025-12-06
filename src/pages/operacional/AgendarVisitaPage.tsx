import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useTimeDeVendas } from '@/hooks/useTimeDeVendas';
import { cn } from '@/lib/utils';
import { Calendar, Users, Sparkles } from 'lucide-react';

export default function AgendarVisitaPage() {
    const { times, isLoading } = useTimeDeVendas();
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

    // Filter teams that have a calendar_id
    const teamsWithCalendar = useMemo(() => {
        return times?.filter(time => time.calendar_id && time.calendar_id.trim() !== '') || [];
    }, [times]);

    const selectedTeam = teamsWithCalendar.find(t => t.id === selectedTeamId);

    const getCalendarUrl = (calendarId: string) => {
        const encodedId = encodeURIComponent(calendarId);
        return `https://calendar.google.com/calendar/embed?src=${encodedId}&ctz=America%2FSao_Paulo&showTitle=0&showPrint=0&showTabs=0&showCalendars=0`;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] gap-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
            <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Agendar Visita
                </h1>
                <p className="text-slate-600 font-medium mt-1">Consulte a disponibilidade das equipes.</p>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Sidebar - Equipes */}
                <Card className="w-80 flex flex-col overflow-hidden border-2 border-white/50 bg-white/70 backdrop-blur-xl shadow-2xl">
                    <div className="p-4 border-b-2 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Equipes com Calendário
                            </span>
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {isLoading ? (
                            <div className="text-center py-8 text-slate-500 text-sm font-medium">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <div>Carregando equipes...</div>
                            </div>
                        ) : teamsWithCalendar.length === 0 ? (
                            <div className="text-center py-8 px-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-slate-500 font-medium">
                                    Nenhuma equipe com calendário configurado.
                                </p>
                            </div>
                        ) : (
                            teamsWithCalendar.map((team) => (
                                <button
                                    key={team.id}
                                    onClick={() => setSelectedTeamId(team.id)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl transition-all duration-300 border-2 text-sm group relative overflow-hidden",
                                        selectedTeamId === team.id
                                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-400 shadow-xl scale-105"
                                            : "bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50/30 border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-lg hover:scale-102"
                                    )}
                                >
                                    {selectedTeamId === team.id && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                                    )}
                                    <div className="relative z-10 font-bold flex items-center gap-2">
                                        <Sparkles className={cn(
                                            "w-4 h-4 transition-all",
                                            selectedTeamId === team.id ? "text-yellow-300" : "text-blue-500 opacity-0 group-hover:opacity-100"
                                        )} />
                                        {team.nome}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                {/* Main Content - Calendar Frame */}
                <Card className="flex-1 bg-white/80 backdrop-blur-sm shadow-2xl border-2 border-white/50 overflow-hidden relative rounded-2xl">
                    {selectedTeam && selectedTeam.calendar_id ? (
                        <div className="w-full h-full relative">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                            <iframe
                                src={getCalendarUrl(selectedTeam.calendar_id)}
                                style={{ border: 0 }}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                title={`Calendário - ${selectedTeam.nome}`}
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-purple-50/20">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                    <Calendar className="w-10 h-10 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Nenhuma equipe selecionada
                            </h3>
                            <p className="text-sm max-w-xs text-center text-slate-600 font-medium">
                                Selecione uma equipe na lista ao lado para visualizar os horários disponíveis.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
