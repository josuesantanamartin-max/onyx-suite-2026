export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTheme = 'light' | 'dark' | 'auto';

export interface TooltipProps {
    content: string | React.ReactNode;
    position?: TooltipPosition;
    delay?: number;
    theme?: TooltipTheme;
    maxWidth?: number;
    children: React.ReactNode;
    disabled?: boolean;
}
