import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FlujoPasoProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export default function FlujoPaso({ children, className, active }: FlujoPasoProps) {
  if (!active) return null;

  return (
    <div className={cn(
      "w-full max-w-md mx-auto px-6 py-8 animate-in fade-in slide-in-from-right-8 duration-500",
      className
    )}>
      {children}
    </div>
  );
}
