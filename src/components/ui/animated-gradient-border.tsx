'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnimatedGradientBorderProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}

export function AnimatedGradientBorder({
  children,
  className,
  containerClassName,
  animate = true,
}: AnimatedGradientBorderProps) {
  return (
    <div className={cn('relative rounded-xl p-[1px] overflow-hidden', containerClassName)}>
      <div
        className={cn(
          'absolute inset-0 rounded-xl z-[1]',
          animate ? 'animate-gradient-xy' : '',
          'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
        )}
      />
      <div
        className={cn(
          'relative bg-black rounded-xl z-[2]',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
} 