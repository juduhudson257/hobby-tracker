'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility to merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ClayCardProps {
  pressed?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
}

export const ClayCard: React.FC<ClayCardProps> = ({
  className,
  pressed = false,
  children,
  onClick,
  style,
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={style}
      className={cn(
        'rounded-xl p-6 transition-all duration-200',
        pressed ? 'minimal-card-active text-black' : 'minimal-card text-white',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

ClayCard.displayName = 'ClayCard';
