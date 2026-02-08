import React from 'react';
import { LucideIcon } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import { TooltipPosition } from '../../types/tooltip';

interface IconWithTooltipProps {
    icon: LucideIcon;
    tooltip: string;
    position?: TooltipPosition;
    size?: number;
    className?: string;
    onClick?: () => void;
}

/**
 * Icon wrapper with integrated tooltip
 */
const IconWithTooltip: React.FC<IconWithTooltipProps> = ({
    icon: Icon,
    tooltip,
    position = 'top',
    size = 18,
    className = 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
    onClick,
}) => {
    return (
        <Tooltip content={tooltip} position={position}>
            <button
                type="button"
                onClick={onClick}
                className={`
                    inline-flex items-center justify-center
                    transition-colors duration-200
                    ${onClick ? 'cursor-pointer' : 'cursor-help'}
                    ${className}
                `}
                aria-label={tooltip}
            >
                <Icon size={size} />
            </button>
        </Tooltip>
    );
};

export default IconWithTooltip;
