import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Lead } from '@/types';
import { SortableLeadCard } from './SortableLeadCard';
import { Zap } from 'lucide-react';
import { PipelineStage } from '@/types';

interface PipelineColumnProps {
    stage: PipelineStage;
    leads: Lead[];
    onCardClick: (lead: Lead) => void;
    hasAutomation?: boolean;
}

export function PipelineColumn({ stage, leads, onCardClick, hasAutomation }: PipelineColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.id,
    });

    return (
        <div ref={setNodeRef} className="flex-shrink-0 w-80 flex flex-col bg-muted/50 rounded-lg border">
            <div
                className={`p-3 font-medium border-b rounded-t-lg flex justify-between items-center transition-all duration-200 ${isOver ? 'ring-4 ring-primary ring-inset shadow-md z-10 scale-[1.02]' : ''
                    }`}
                style={{ backgroundColor: stage.cor || '#f3f4f6' }}
            >
                <div className="flex items-center gap-2">
                    <span>{stage.nome}</span>
                    {hasAutomation && (
                        <div title="Possui automações ativas">
                            <Zap className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                        </div>
                    )}
                </div>
                <span className="text-xs text-muted-foreground bg-white/50 px-2 py-0.5 rounded-full">
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
