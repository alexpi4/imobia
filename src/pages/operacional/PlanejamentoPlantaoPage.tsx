import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCadastro } from '@/hooks/useCadastros';
import { supabase } from '@/integrations/supabase/client';
import { PlanejamentoPlantao } from '@/types/operacional';
import { Profile, Turno } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Draggable Turno Card
function DraggableTurno({ turno }: { turno: Turno }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `turno-${turno.id}`,
        data: { type: 'turno', turno },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-2 mb-2 bg-green-100 border border-green-300 rounded cursor-move text-sm"
        >
            <div className="font-bold">{turno.nome}</div>
            <div className="text-xs">{turno.hora_inicio} - {turno.hora_fim}</div>
        </div>
    );
}

// Droppable Day Cell
function DroppableDay({ date, children }: { date: Date, children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `day-${date.toISOString()}`,
        data: { date },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "min-h-[100px] border p-1 transition-colors",
                isOver ? "bg-blue-50 border-blue-300" : "bg-background"
            )}
        >
            <div className="text-right text-sm text-muted-foreground mb-1">
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

    const { data: turnos } = useCadastro<Turno>('turnos');
    const { data: equipes } = useCadastro<any>('time_de_vendas');
    const [corretores, setCorretores] = useState<Profile[]>([]);

    // Fetch corretores when equipe changes
    useEffect(() => {
        if (selectedEquipe) {
            // In a real app, we would filter profiles by equipe. 
            // For now, fetching all profiles or mock filtering.

            // Since we don't have strict relation yet, let's just fetch all profiles for demo
            const fetchAll = async () => {
                const { data } = await supabase.from('profiles').select('*');
                if (data) setCorretores(data as any);
            }
            fetchAll();
        }
    }, [selectedEquipe]);

    // Fetch planejamentos for the month
    useEffect(() => {
        const fetchPlanejamentos = async () => {
            const start = startOfMonth(selectedMonth).toISOString();
            const end = endOfMonth(selectedMonth).toISOString();

            const { data } = await supabase
                .from('planejamento_plantao')
                .select('*, turno:turnos(*), corretor:profiles(*)')
                .gte('dia', start)
                .lte('dia', end);

            if (data) setPlanejamentos(data as any);
        };
        fetchPlanejamentos();
    }, [selectedMonth]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.data.current?.type === 'turno') {
            const turno = active.data.current.turno as Turno;
            const date = over.data.current?.date as Date;

            if (!selectedCorretor || !selectedEquipe) {
                toast.error('Selecione uma equipe e um corretor primeiro');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('planejamento_plantao')
                    .insert({
                        nome: `Plantão ${format(date, 'dd/MM')}`,
                        mes: startOfMonth(date).toISOString(),
                        equipe_id: parseInt(selectedEquipe),
                        corretor_id: parseInt(selectedCorretor),
                        dia: date.toISOString(),
                        turno_id: turno.id,
                    })
                    .select('*, turno:turnos(*), corretor:profiles(*)')
                    .single();

                if (error) throw error;

                setPlanejamentos([...planejamentos, data as any]);
                toast.success('Plantão agendado!');
            } catch (error: any) {
                toast.error('Erro ao agendar: ' + error.message);
            }
        }
    };

    const days = eachDayOfInterval({
        start: startOfMonth(selectedMonth),
        end: endOfMonth(selectedMonth),
    });

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex h-[calc(100vh-100px)] gap-4">
                {/* Sidebar */}
                <div className="w-80 flex flex-col gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuração</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Equipe</label>
                                <Select onValueChange={setSelectedEquipe}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a equipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {equipes.map(e => (
                                            <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Corretor</label>
                                <Select onValueChange={setSelectedCorretor} disabled={!selectedEquipe}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o corretor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {corretores.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Turnos Disponíveis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {turnos.filter(t => t.ativo).map(turno => (
                                <DraggableTurno key={turno.id} turno={turno} />
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Calendar */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold capitalize">
                            {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                        </h2>
                        <div className="space-x-2">
                            <Button variant="outline" onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))}>Anterior</Button>
                            <Button variant="outline" onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))}>Próximo</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-muted border rounded-lg overflow-hidden flex-1">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="bg-muted p-2 text-center font-medium text-sm">
                                {day}
                            </div>
                        ))}
                        {days.map(day => (
                            <DroppableDay key={day.toISOString()} date={day}>
                                {planejamentos
                                    .filter(p => isSameDay(parseISO(p.dia), day))
                                    .map(p => (
                                        <div key={p.id} className="text-xs bg-primary/10 p-1 rounded border border-primary/20 truncate" title={`${p.turno?.nome} - ${p.corretor?.nome}`}>
                                            <span className="font-bold">{p.turno?.nome}</span>
                                            <br />
                                            {p.corretor?.nome}
                                        </div>
                                    ))}
                            </DroppableDay>
                        ))}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}
