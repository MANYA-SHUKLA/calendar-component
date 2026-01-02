import React, { useCallback, useMemo } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { isToday, isCurrentMonth } from '@/utils/date.utils';
import clsx from 'clsx';

export interface CalendarCellProps {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isSelected: boolean;
  isInRange?: boolean;
  isCurrentMonth: boolean;
  onClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const CalendarCell: React.FC<CalendarCellProps> = React.memo(({
  date,
  events,
  isToday: isTodayProp,
  isSelected,
  isInRange = false,
  isCurrentMonth: isCurrentMonthProp,
  onClick,
  onEventClick,
}) => {
  const dayNumber = date.getDate();
  const isTodayCell = useMemo(() => isTodayProp || isToday(date), [date, isTodayProp]);
  // Note: isCurrentMonthProp should be passed correctly from parent
  const isCurrentMonthCell = isCurrentMonthProp;
  
  const handleClick = useCallback(() => {
    onClick(date);
  }, [date, onClick]);

  const handleEventClick = useCallback((e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    onEventClick(event);
  }, [onEventClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(date);
    }
  }, [date, onClick]);

  const eventCount = events.length;
  const visibleEvents = events.slice(0, 3);
  const remainingCount = eventCount > 3 ? eventCount - 3 : 0;

  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  const ariaLabel = `${monthName} ${dayNumber}, ${year}. ${eventCount} event${eventCount !== 1 ? 's' : ''}`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        'border border-neutral-700/50 h-32 p-2 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60',
        'hover:from-neutral-700/60 hover:to-neutral-800/60 transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900',
        !isCurrentMonthCell && 'bg-neutral-900/40 text-neutral-600 opacity-60',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2 bg-gradient-to-br from-primary-500/20 to-accent-500/20',
        isInRange && !isSelected && 'bg-gradient-to-br from-primary-500/15 to-accent-500/15 border-primary-500/30',
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <span
          className={clsx(
            'text-sm font-medium',
            isCurrentMonthCell ? 'text-neutral-200' : 'text-neutral-600',
            isTodayCell && 'font-bold text-primary-400'
          )}
        >
          {dayNumber}
        </span>
        {isTodayCell && (
          <span className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg shadow-primary-500/50 animate-pulse-glow">
            {dayNumber}
          </span>
        )}
      </div>
      <div className="space-y-1 overflow-hidden">
        {visibleEvents.map((event) => (
          <div
            key={event.id}
            onClick={(e) => handleEventClick(e, event)}
            className="text-xs px-2 py-1 rounded-md truncate cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md border border-white/10"
            style={{
              backgroundColor: event.color || '#3b82f6',
              color: '#ffffff',
            }}
            title={`${event.title} - ${event.startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
          >
            {event.title}
          </div>
        ))}
        {remainingCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(date);
            }}
            className="text-xs text-primary-400 hover:text-primary-300 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded font-medium transition-colors"
          >
            +{remainingCount} more
          </button>
        )}
      </div>
    </div>
  );
});

CalendarCell.displayName = 'CalendarCell';

