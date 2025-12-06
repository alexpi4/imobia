import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Trash2, User, Clock } from "lucide-react";
import { PlanejamentoPlantao } from "@/types/operacional";

interface DayDialogProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    shifts: PlanejamentoPlantao[];
    onRemoveShift: (shiftId: number | string) => void; // Support temp IDs (string) or DB IDs (number)
}

export function DayDialog({ isOpen, onClose, date, shifts, onRemoveShift }: DayDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="capitalize">{format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Gerenciar plantões para este dia.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {shifts.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            Nenhum plantão agendado para este dia.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {shifts.map((shift, index) => (
                                <div
                                    key={shift.id || `temp-${index}`}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span>{shift.turno?.nome || "Turno"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="w-4 h-4" />
                                            <span>{shift.corretor?.nome || "Corretor"}</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => onRemoveShift(shift.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end sticky bottom-0 bg-background pt-2">
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
