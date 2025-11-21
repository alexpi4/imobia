import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: boolean | string;
    activeText?: string;
    inactiveText?: string;
    variant?: 'default' | 'success' | 'error' | 'warning';
}

export function StatusBadge({
    status,
    activeText = 'Ativo',
    inactiveText = 'Inativo',
    variant = 'default'
}: StatusBadgeProps) {
    const isActive = typeof status === 'boolean' ? status : status === 'ativo' || status === 'sucesso';

    const variantStyles = {
        default: isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    return (
        <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            variantStyles[variant]
        )}>
            {isActive ? activeText : inactiveText}
        </span>
    );
}
