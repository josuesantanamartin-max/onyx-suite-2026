import React from 'react';
import { HelpCircle } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import { TooltipPosition } from '../../types/tooltip';

interface HelpButtonProps {
    content: string | React.ReactNode;
    position?: TooltipPosition;
    variant?: 'inline' | 'floating';
    size?: number;
}

/**
 * Help button with contextual tooltip
 */
const HelpButton: React.FC<HelpButtonProps> = ({
    content,
    position = 'top',
    variant = 'inline',
    size = 16,
}) => {
    const buttonClass = variant === 'floating'
        ? 'fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg z-50'
        : 'inline-flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors';

    return (
        <Tooltip content={content} position={position} maxWidth={300}>
            <button
                type="button"
                className={buttonClass}
                aria-label="Ayuda"
            >
                <HelpCircle size={size} />
            </button>
        </Tooltip>
    );
};

export default HelpButton;
