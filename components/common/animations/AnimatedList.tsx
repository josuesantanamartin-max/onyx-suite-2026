import React from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedListProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05, // delay between each child animating in
            delayChildren: 0.1,    // initial delay before staggering starts
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        },
    },
};

/**
 * A wrapper for lists or grids that animates its children in sequentially.
 * Use <AnimatedListItem> for the individual children.
 */
export const AnimatedList: React.FC<AnimatedListProps> = ({
    children,
    className = "",
    staggerDelay,
}) => {
    const customVariants = staggerDelay
        ? {
            ...containerVariants,
            visible: {
                ...containerVariants.visible,
                transition: {
                    // @ts-ignore
                    ...containerVariants.visible?.transition,
                    staggerChildren: staggerDelay,
                },
            },
        }
        : containerVariants;

    return (
        <motion.div
            variants={customVariants}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {children}
        </motion.div>
    );
};

interface AnimatedListItemProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
    children,
    className = "",
    onClick
}) => {
    return (
        <motion.div variants={itemVariants} className={className} onClick={onClick}>
            {children}
        </motion.div>
    );
};
