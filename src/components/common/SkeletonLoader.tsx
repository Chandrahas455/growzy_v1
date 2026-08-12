import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonLoaderProps {
  type?: 'table' | 'cards' | 'kpis';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'table', count = 5, className }) => {
  if (type === 'kpis') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-dark-800 border border-dark-700 rounded-md p-4 animate-pulse">
            <div className="h-3 w-20 bg-dark-700 rounded mb-3"></div>
            <div className="h-7 w-28 bg-dark-600 rounded mb-1"></div>
            <div className="h-2 w-16 bg-dark-750 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-dark-800 border border-dark-700 rounded-md p-5 animate-pulse space-y-3">
            <div className="h-4 w-3/4 bg-dark-600 rounded"></div>
            <div className="h-3 w-1/2 bg-dark-700 rounded"></div>
            <div className="h-10 w-full bg-dark-750 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("bg-dark-800 border border-dark-700 rounded-md overflow-hidden animate-pulse", className)}>
      <div className="h-10 bg-dark-750 border-b border-dark-700 flex items-center px-4 space-x-4">
        <div className="h-4 w-1/4 bg-dark-600 rounded"></div>
        <div className="h-4 w-1/4 bg-dark-600 rounded"></div>
        <div className="h-4 w-1/4 bg-dark-600 rounded"></div>
        <div className="h-4 w-1/4 bg-dark-600 rounded"></div>
      </div>
      <div className="divide-y divide-dark-750">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 flex items-center px-4 space-x-4">
            <div className="h-3 w-1/3 bg-dark-700 rounded"></div>
            <div className="h-3 w-1/4 bg-dark-700 rounded"></div>
            <div className="h-3 w-1/6 bg-dark-700 rounded"></div>
            <div className="h-3 w-1/5 bg-dark-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
