import React from 'react';
import { TooltipProps } from '../../types/tooltip';
import { useTooltip } from '../../hooks/useTooltip';

/**
 * Reusable Tooltip component with smart positioning and animations
 */
const Tooltip: React.FC<TooltipProps> = ({
    content,
    position = 'top',
    delay = 200,
    theme = 'auto',
    maxWidth = 250,
    children,
    disabled = false,
}) => {
    const {
        isVisible,
        showTooltip,
        hideTooltip,
        tooltipRef,
        targetRef,
        position: calculatedPosition,
    } = useTooltip(position, delay);

    if (disabled) {
        return <>{children}</>;
    }

    // Determine theme class
    const themeClass = theme === 'auto'
        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
        : theme === 'dark'
            ? 'bg-gray-900 text-white'
            : 'bg-white text-gray-900 border border-gray-200';

    return (
        <>
            <div
                ref={targetRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                className="inline-block"
            >
                {children}
            </div>

            {isVisible && (
                <div
                    ref={tooltipRef}
                    role="tooltip"
                    className={`
                        fixed z-[9999] px-3 py-2 text-sm rounded-lg shadow-lg
                        ${themeClass}
                        animate-fade-in pointer-events-none
                    `}
                    style={{
                        top: `${calculatedPosition.top}px`,
                        left: `${calculatedPosition.left}px`,
                        maxWidth: `${maxWidth}px`,
                    }}
                >
                    {/* Arrow */}
                    <div
                        className={`
                            absolute w-2 h-2 rotate-45
                            ${theme === 'auto'
                                ? 'bg-gray-900 dark:bg-gray-100'
                                : theme === 'dark'
                                    ? 'bg-gray-900'
                                    : 'bg-white border-l border-t border-gray-200'
                            }
                            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                            ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                            ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                        `}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                        {typeof content === 'string' ? (
                            <p className="leading-relaxed">{content}</p>
                        ) : (
                            content
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Tooltip;
