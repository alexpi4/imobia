import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@/types';
import { LeadCard } from './LeadCard';

interface SortableLeadCardProps {
    lead: Lead;
    onClick?: () => void;
}

export function SortableLeadCard({ lead, onClick }: SortableLeadCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id.toString(),
        data: {
            type: 'lead',
            lead,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <LeadCard lead={lead} onClick={onClick} />
        </div>
    );
}
