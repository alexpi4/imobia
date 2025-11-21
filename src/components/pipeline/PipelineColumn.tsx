import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Lead } from '@/types';
import { SortableLeadCard } from './SortableLeadCard';

interface PipelineColumnProps {
    stage: { id: number; nome: string };
    leads: Lead[];
    onCardClick: (lead: Lead) => void;
}

export function PipelineColumn({ stage, leads, onCardClick }: PipelineColumnProps) {
    const { setNodeRef } = useDroppable({
        id: stage.id,
    });

    return (
        <div ref={setNodeRef} className="flex-shrink-0 w-80 flex flex-col bg-muted/50 rounded-lg border">
            <div className="p-3 font-medium border-b bg-card rounded-t-lg flex justify-between items-center">
                <span>{stage.nome}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {leads.length}
                </span>
            </div>
            <div className="flex-1 p-2 overflow-y-auto min-h-0">
                <SortableContext
                    id={stage.id.toString()}
                    items={leads.map(l => l.id.toString())}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2 min-h-[100px]">
                        {leads.map((lead) => (
                            <SortableLeadCard
                                key={lead.id}
                                lead={lead}
                                onClick={() => onCardClick(lead)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
