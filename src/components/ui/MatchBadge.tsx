import React from 'react';
import { cn } from '@/lib/utils';

interface MatchBadgeProps {
  percentage: number;
  showBar?: boolean;
  className?: string;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({
  percentage,
  showBar = true,
  className,
}) => {
  const getMatchColor = (pct: number) => {
    if (pct >= 80) return 'bg-success';
    if (pct >= 60) return 'bg-warning';
    return 'bg-error';
  };

  const getMatchTextColor = (pct: number) => {
    if (pct >= 80) return 'text-success';
    if (pct >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className={cn('match-badge', className)}>
      {showBar && (
        <div className="match-bar w-16">
          <div
            className={cn('match-fill', getMatchColor(percentage))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      <span className={cn('text-body-3-medium', getMatchTextColor(percentage))}>
        {percentage}%
      </span>
    </div>
  );
};
