import React, { useState, useMemo } from 'react';
import { getCalendarGrid, isCurrentMonth, isToday } from '@/utils/date.utils';
import clsx from 'clsx';

export interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onDateSelect,
  className,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const grid = useMemo(() => {
    return getCalendarGrid(currentMonth);
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  return (
    <div className={clsx('bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-neutral-700/50 rounded transition-colors text-neutral-400 hover:text-white"
          aria-label="Previous month"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded transition-colors"
          >
            Today
          </button>
          <h3 className="text-sm font-semibold text-white min-w-[120px] text-center">
            {monthName}
          </h3>
        </div>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-neutral-700/50 rounded transition-colors text-neutral-400 hover:text-white"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-xs text-neutral-400 text-center font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((date, index) => {
          const isTodayCell = isToday(date);
          const isCurrentMonthCell = isCurrentMonth(date, currentMonth);
          const isSelected =
            date.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={`${date.toISOString()}-${index}`}
              onClick={() => onDateSelect(date)}
              className={clsx(
                'aspect-square text-xs rounded transition-all duration-200',
                'hover:scale-110 hover:z-10 relative',
                isCurrentMonthCell
                  ? 'text-neutral-200 hover:bg-neutral-700/50'
                  : 'text-neutral-600 hover:bg-neutral-800/50',
                isTodayCell &&
                  'bg-primary-500/20 text-primary-300 font-bold border border-primary-500/50',
                isSelected &&
                  !isTodayCell &&
                  'bg-primary-500/30 text-white font-semibold ring-1 ring-primary-400'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

