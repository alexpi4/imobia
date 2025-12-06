import { useState, useEffect, useCallback } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCadastro } from '@/hooks/useCadastros';
import { supabase } from '@/integrations/supabase/client';
import { PlanejamentoPlantao } from '@/types/operacional';
import { Profile, Turno, TimeDeVendas } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Save, AlertCircle, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';
import { DayDialog } from './components/DayDialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Draggable Turno Card
function DraggableTurno({ turno }: { turno: Turno }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `turno-${turno.id}`,
        data: { type: 'turno', turno },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-4 mb-2 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-xl cursor-grab active:cursor-grabbing shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
                <div className="font-bold text-white text-base mb-1 tracking-wide">{turno.nome}</div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/25 backdrop-blur-sm rounded-full">
                    <span className="text-xs font-medium text-white">{turno.hora_inicio}</span>
                    <span className="text-white/80">→</span>
                    <span className="text-xs font-medium text-white">{turno.hora_fim}</span>
                </div>
            </div>
        </div>
    );
}

// Droppable Day Cell
function DroppableDay({ date, children, onClick, isCurrentMonth }: { date: Date, children: React.ReactNode, onClick: () => void, isCurrentMonth: boolean }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `day-${date.toISOString()}`,
        data: { date },
    });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={cn(
                "min-h-[120px] border-r border-b p-2 transition-all duration-300 cursor-pointer relative group",
                !isCurrentMonth && "bg-gray-50/50 text-gray-400",
                isOver ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ring-2 ring-inset ring-blue-400 shadow-inner" : "hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50/30",
                "print:min-h-[100px] print:border-gray-300"
            )}
        >
            <div className={cn(
                "text-right text-sm font-semibold mb-2 w-7 h-7 flex items-center justify-center rounded-full ml-auto transition-all duration-300",
                isSameDay(date, new Date())
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg ring-2 ring-blue-300 ring-offset-2"
                    : "text-muted-foreground group-hover:bg-white group-hover:shadow-md group-hover:scale-110"
            )}>
                {format(date, 'd')}
            </div>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
}

export default function PlanejamentoPlantaoPage() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [selectedEquipe, setSelectedEquipe] = useState<string>('');
    const [selectedCorretor, setSelectedCorretor] = useState<string>('');
    const [planejamentos, setPlanejamentos] = useState<PlanejamentoPlantao[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    // Modal state
    const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
    const [selectedDayForDialog, setSelectedDayForDialog] = useState<Date | null>(null);

    const { data: turnos } = useCadastro<Turno>('turnos');
    const { data: equipes } = useCadastro<TimeDeVendas>('time_de_vendas');
    const [corretores, setCorretores] = useState<Profile[]>([]);
    const [filteredCorretores, setFilteredCorretores] = useState<Profile[]>([]);

    // Unified fetch logic
    const fetchPlanejamentos = useCallback(async () => {
        if (!selectedEquipe) return;

        const start = startOfMonth(selectedMonth).toISOString();
        const end = endOfMonth(selectedMonth).toISOString();

        const { data } = await supabase
            .from('planejamento_plantao')
            .select('*, turno:turnos(*), corretor:profiles(*)')
            .eq('equipe_id', selectedEquipe)
            .gte('dia', start)
            .lte('dia', end);

        if (data) {
            setPlanejamentos(data as unknown as PlanejamentoPlantao[]);
            setHasChanges(false);
        }
    }, [selectedEquipe, selectedMonth]);

    // Fetch all profiles initially
    useEffect(() => {
        const fetchProfiles = async () => {
            const { data } = await supabase.from('profiles').select('*');
            if (data) setCorretores(data as unknown as Profile[]);
        };
        fetchProfiles();
    }, []);

    // Filter corretores when equipe changes
    useEffect(() => {
        if (selectedEquipe && corretores.length > 0 && equipes) {
            const equipe = equipes.find(e => String(e.id) === selectedEquipe);

            if (equipe) {
                const equipeNome = equipe.nome.toLowerCase();
                const filtered = corretores.filter(c => {
                    // 1. Try Strict ID Match first (most reliable)
                    if (c.equipe_id && c.equipe_id === Number(selectedEquipe)) {
                        return true;
                    }

                    // 2. Fallback to string match
                    if (!c.equipe) return false;
                    const corretorEquipe = c.equipe.toLowerCase();
                    return corretorEquipe.includes(equipeNome) || corretorEquipe === String(equipe.id);
                });
                setFilteredCorretores(filtered);
            } else {
                setFilteredCorretores(corretores);
            }
        } else {
            setFilteredCorretores([]);
        }
    }, [selectedEquipe, corretores, equipes]);

    // Check if a shift is available for the selected corretor
    const isTurnoAvailableForCorretor = (turno: Turno) => {
        if (!selectedCorretor || !filteredCorretores) return true;
        const corretor = filteredCorretores.find(c => String(c.id) === selectedCorretor);

        // If corretor has specific shifts assigned
        if (corretor?.turnos) {
            let userShifts: string[] = [];

            if (Array.isArray(corretor.turnos)) {
                userShifts = corretor.turnos;
            } else if (typeof corretor.turnos === 'string') {
                // Handle comma separated string if that's how it's stored
                userShifts = (corretor.turnos as string).split(',').map(t => t.trim());
            }

            if (userShifts.length > 0) {
                return userShifts.some((t: string) =>
                    t.toLowerCase() === turno.nome.toLowerCase() ||
                    t === String(turno.id)
                );
            }
        }

        // If no specific shifts assigned (or empty), show all active (default behavior)
        return true;
    };

    // Fetch initial data (only once/on mount or month change)
    useEffect(() => {
        fetchPlanejamentos();
    }, [fetchPlanejamentos]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.data.current?.type === 'turno') {
            const turno = active.data.current.turno as Turno;
            const date = over.data.current?.date as Date;

            if (!selectedCorretor || !selectedEquipe) {
                toast.error('Selecione uma equipe e um corretor para agendar!');
                return;
            }

            const corretor = corretores.find(c => String(c.id) === selectedCorretor);

            // Add to local state
            const newPlantao: PlanejamentoPlantao = {
                id: `temp-${Date.now()}`,
                dia: date.toISOString(),
                turno_id: turno.id,
                corretor_id: parseInt(selectedCorretor),
                equipe_id: parseInt(selectedEquipe),
                mes: format(startOfMonth(date), 'yyyy-MM-dd'),
                nome: `Plantão ${format(date, 'dd/MM')}`,
                turno: turno,
                corretor: corretor
            };

            setPlanejamentos(prev => [...prev, newPlantao]);
            setHasChanges(true);
            toast.success(`Turno adicionado para ${format(date, 'dd/MM')}`);
        }
    };

    const handleRemoveShift = (shiftId: number | string) => {
        // Handle both DB IDs (number) and Temp IDs (string)
        setPlanejamentos(prev => prev.filter(p => p.id !== shiftId));
        setHasChanges(true);
    };

    const handleSaveEscala = async () => {
        if (!selectedEquipe) return;

        try {
            const start = startOfMonth(selectedMonth).toISOString();
            const end = endOfMonth(selectedMonth).toISOString();
            const mesRef = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');

            // 0. Get Team Name and Format Scale Name
            const equipe = equipes?.find(e => String(e.id) === selectedEquipe);
            const teamName = equipe ? equipe.nome : 'Equipe';
            const monthName = format(selectedMonth, 'MMMM yyyy', { locale: ptBR });
            const escalaName = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} - ${teamName}`;

            // 1. Upsert Escala Header
            const { data: escalaData, error: escalaError } = await supabase
                .from('escalas_planejamento')
                .upsert({
                    equipe_id: parseInt(selectedEquipe),
                    mes: mesRef,
                    nome: escalaName,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'equipe_id,mes' })
                .select()
                .single();

            if (escalaError) throw new Error('Erro ao salvar cabeçalho da escala: ' + escalaError.message);
            const escalaId = escalaData.id;

            // 2. Delete existing shifts for this month/team to ensure clean state
            const { error: deleteError } = await supabase
                .from('planejamento_plantao')
                .delete()
                .eq('equipe_id', selectedEquipe)
                .gte('dia', start)
                .lte('dia', end);

            if (deleteError) throw deleteError;

            // 3. Prepare data for insert with Escala ID
            const recordsToInsert = planejamentos.map(p => ({
                dia: p.dia,
                turno_id: p.turno_id,
                corretor_id: p.corretor_id,
                equipe_id: p.equipe_id,
                escala_id: escalaId,
                mes: mesRef,
                nome: `Plantão ${format(parseISO(p.dia), 'dd/MM')}`
            }));

            if (recordsToInsert.length > 0) {
                const { error: insertError } = await supabase
                    .from('planejamento_plantao')
                    .insert(recordsToInsert);

                if (insertError) throw insertError;
            }

            toast.success(`Escala "${escalaName}" salva com sucesso!`);

            // 4. Refetch to get real IDs and clean state
            await fetchPlanejamentos();

        } catch (error: any) {
            console.error(error);
            toast.error('Erro ao salvar escala: ' + (error.message || 'Erro desconhecido'));
        }
    };

    const handleExportCSV = () => {
        try {
            if (!planejamentos.length || !selectedEquipe) {
                toast.error('Não há dados para exportar ou nenhuma equipe selecionada.');
                return;
            }

            const equipe = equipes?.find(e => String(e.id) === selectedEquipe);
            const teamName = equipe ? equipe.nome : 'Unknown Team';

            // Prepare Month Name (e.g. "Dezembro")
            const rawMonth = format(selectedMonth, 'MMMM', { locale: ptBR });
            const monthName = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

            // equipe, mes, dia do mes, Turno , Nome do Corretor
            const headers = ['Equipe', 'Mes', 'Dia do Mes', 'Turno', 'Nome do Corretor'];

            const rows = planejamentos.map(p => {
                const dateObj = typeof p.dia === 'string' ? parseISO(p.dia) : p.dia; // Handle possible ISO string or Date object
                const dayStr = format(dateObj, 'dd/MM/yyyy');

                return [
                    teamName,
                    monthName,
                    dayStr,
                    p.turno?.nome || 'Turno Indefinido',
                    p.corretor?.nome || 'Corretor Indefinido'
                ];
            });

            // Add BOM for Excel compatibility
            const BOM = '\uFEFF';
            const csvContent = BOM + [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Correct MIME type syntax (remove trailing semicolon)
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);

            // Sanitize filename safe for all file systems
            const safeTeamName = teamName.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "");
            const fileName = `${monthName} ${safeTeamName}.csv`;

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName; // Property
            link.setAttribute('download', fileName); // Attribute
            link.target = "_blank"; // Force new context
            document.body.appendChild(link);

            // Trigger click
            link.click();

            // Cleanup with longer timeout to ensure browser captures it
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 500);

            toast.success(`Arquivo "${fileName}" gerado com sucesso!`);
        } catch (error) {
            console.error('Erro no download:', error);
            toast.error('Erro ao gerar o arquivo CSV. Verifique o console.');
        }
    };

    const handleDayClick = (date: Date) => {
        setSelectedDayForDialog(date);
        setIsDayDialogOpen(true);
    };

    // Calendar generation
    const days = eachDayOfInterval({
        start: startOfMonth(selectedMonth),
        end: endOfMonth(selectedMonth),
    });

    // Fill start empty days
    const startDay = startOfMonth(selectedMonth).getDay();
    const prefixDays = Array.from({ length: startDay }).map((_, i) => i);

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-screen md:h-[calc(100vh-60px)] gap-4 p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">

                {/* Header Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Planejamento de Escala</h1>
                        <p className="text-slate-600 font-medium mt-1">Gerencie os turnos e plantões da equipe.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleExportCSV}
                            disabled={!planejamentos.length}
                            title="Exportar para CSV"
                            className="border-2 border-blue-200 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar CSV
                        </Button>
                        <Button
                            onClick={handleSaveEscala}
                            disabled={!hasChanges}
                            className={hasChanges ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl animate-pulse" : "bg-gradient-to-r from-gray-400 to-gray-500"}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {hasChanges ? 'Salvar Alterações' : 'Salvo'}
                        </Button>
                    </div>
                </div>


                {hasChanges && (
                    <Alert variant="default" className="print:hidden border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 backdrop-blur-sm shadow-lg">
                        <AlertCircle className="h-5 w-5 text-amber-600 drop-shadow-sm" />
                        <AlertTitle className="text-amber-900 font-bold">Alterações não salvas</AlertTitle>
                        <AlertDescription className="text-amber-800 font-medium">
                            Você tem alterações locais. Lembre-se de clicar em "Salvar Alterações" para persistir a escala.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col lg:flex-row h-full gap-6">
                    {/* Sidebar Configuration */}
                    <div className="w-full lg:w-80 flex flex-col gap-6 print:hidden">
                        <Card className="shadow-xl border-2 border-white/50 bg-white/70 backdrop-blur-xl">
                            <CardHeader className="pb-3 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-blue-600" />
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Filtros</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Equipe</label>
                                    <Select onValueChange={setSelectedEquipe} value={selectedEquipe}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a equipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {equipes?.map(e => (
                                                <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Corretor</label>
                                    <Select onValueChange={setSelectedCorretor} disabled={!selectedEquipe} value={selectedCorretor}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={selectedEquipe ? "Selecione o corretor" : "Selecione a equipe primeiro"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCorretores.map(c => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="flex-1 shadow-xl border-2 border-white/50 bg-white/70 backdrop-blur-xl">
                            <CardHeader className="pb-3 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                                <CardTitle className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Turnos Disponíveis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {selectedEquipe && selectedCorretor ? (
                                    turnos?.filter(t => t.ativo).filter(isTurnoAvailableForCorretor).map(turno => (
                                        <DraggableTurno key={turno.id} turno={turno} />
                                    ))
                                ) : (
                                    <div className="text-sm text-center text-slate-500 font-medium py-8 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border-2 border-dashed border-gray-300">
                                        Selecione uma equipe e um corretor para visualizar os turnos disponíveis.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Print-only Title */}
                    <div className="hidden print:block mb-4">
                        <h1 className="text-3xl font-bold text-center capitalize">
                            {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                            {selectedEquipe && equipes && (
                                <span className="block text-2xl font-normal mt-2">
                                    {equipes.find(e => String(e.id) === selectedEquipe)?.nome}
                                </span>
                            )}
                        </h1>
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-white/50 overflow-hidden print:shadow-none print:border-0">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between p-4 border-b-2 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 print:hidden">
                            <h2 className="text-2xl font-bold capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                                {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                                {selectedEquipe && equipes && (
                                    <span className="text-sm font-semibold text-slate-600 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border-2 border-blue-200 shadow-sm">
                                        {equipes.find(e => String(e.id) === selectedEquipe)?.nome}
                                    </span>
                                )}
                            </h2>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))}>
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(new Date())}>
                                    Hoje
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))}>
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Body */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Days Header */}
                            <div className="grid grid-cols-7 border-b-2 bg-gradient-to-r from-slate-100 to-blue-100">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                    <div key={day} className="py-2 text-center font-bold text-sm text-slate-700 uppercase tracking-wider">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 flex-1 divide-x divide-gray-100 auto-rows-fr">
                                {/* Prefix Empty Days */}
                                {prefixDays.map(i => (
                                    <div key={`prefix-${i}`} className="bg-gray-50/30"></div>
                                ))}

                                {days.map(day => {
                                    const dayShifts = planejamentos.filter(p => isSameDay(parseISO(p.dia), day));

                                    return (
                                        <DroppableDay
                                            key={day.toISOString()}
                                            date={day}
                                            onClick={() => handleDayClick(day)}
                                            isCurrentMonth={isSameMonth(day, selectedMonth)}
                                        >
                                            <div className="flex flex-col gap-1">
                                                {dayShifts.map((p, idx) => (
                                                    <div
                                                        key={p.id || idx}
                                                        className={cn(
                                                            "text-xs p-2 rounded-lg border-l-4 truncate shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer",
                                                            "bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-sm border-blue-500 border border-blue-200/50"
                                                        )}
                                                        title={`${p.turno?.nome} - ${p.corretor?.nome}`}
                                                    >
                                                        <div className="font-bold text-slate-800">{p.turno?.nome}</div>
                                                        <div className="text-slate-600 font-medium">{p.corretor?.nome?.split(' ')[0]}</div>
                                                    </div>
                                                ))}
                                                {dayShifts.length > 2 && (
                                                    <div className="text-[10px] text-center text-slate-500 font-bold pt-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-2 py-0.5">
                                                        + {dayShifts.length - 2} mais...
                                                    </div>
                                                )}
                                            </div>
                                        </DroppableDay>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Day Details Dialog */}
                {selectedDayForDialog && (
                    <DayDialog
                        isOpen={isDayDialogOpen}
                        onClose={() => setIsDayDialogOpen(false)}
                        date={selectedDayForDialog}
                        shifts={planejamentos.filter(p => isSameDay(parseISO(p.dia), selectedDayForDialog))}
                        onRemoveShift={handleRemoveShift}
                    />
                )}
            </div>
        </DndContext>
    );
}
