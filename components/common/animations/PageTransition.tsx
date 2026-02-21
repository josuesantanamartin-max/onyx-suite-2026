import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
    mode?: "wait" | "sync" | "popLayout";
}

/**
 * Wraps page content in a smooth fade-in and slide-up animation.
 * Ideal for main route changes (e.g., Dashboard -> Finance).
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
    children,
    className = "",
    mode = "wait"
}) => {
    return (
        <AnimatePresence mode={mode}>
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    mass: 0.5,
                }}
                className={`w-full h-full ${className}`}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};
