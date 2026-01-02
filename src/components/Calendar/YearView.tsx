import React, { useMemo } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { getEventsForDay, isToday } from '@/utils/date.utils';
import clsx from 'clsx';

export interface YearViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const YearView: React.FC<YearViewProps> = ({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}) => {
  const year = currentDate.getFullYear();
  const today = new Date();

  // Get all months for the year
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDay = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
      
      // Create calendar grid
      const grid: (Date | null)[] = [];
      // Add empty cells for days before month starts
      for (let i = 0; i < startDay; i++) {
        grid.push(null);
      }
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        grid.push(new Date(year, month, day));
      }
      
      return {
        month,
        name: monthNames[month],
        grid,
        firstDay,
        lastDay,
      };
    });
  }, [year]);

  // Get event count for a specific date
  const getEventCount = (date: Date | null): number => {
    if (!date) return 0;
    return getEventsForDay(events, date).length;
  };

  // Get heatmap intensity (0-4) based on event count
  const getIntensity = (count: number): number => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  return (
    <div className="w-full h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">{year}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map((monthData) => (
            <div
              key={monthData.month}
              className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-3 text-center">
                {monthData.name}
              </h3>
              
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-xs text-neutral-400 text-center font-medium"
                  >
                    {day[0]}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthData.grid.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }
                  
                  const eventCount = getEventCount(date);
                  const intensity = getIntensity(eventCount);
                  const isTodayCell = isToday(date);
                  const isCurrentMonth = date.getMonth() === monthData.month;
                  
                  const intensityColors = [
                    'bg-neutral-800/30', // 0 events
                    'bg-primary-900/40', // 1-2 events
                    'bg-primary-700/50', // 3-5 events
                    'bg-primary-500/60', // 6-10 events
                    'bg-primary-400/70', // 10+ events
                  ];
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => onDateClick(date)}
                      className={clsx(
                        'aspect-square rounded text-xs transition-all duration-200',
                        'hover:scale-110 hover:z-10 relative',
                        intensityColors[intensity],
                        isTodayCell && 'ring-2 ring-primary-400 ring-offset-1 ring-offset-neutral-900',
                        !isCurrentMonth && 'opacity-30',
                        eventCount > 0 && 'cursor-pointer hover:shadow-lg'
                      )}
                      title={`${date.toLocaleDateString()} - ${eventCount} event${eventCount !== 1 ? 's' : ''}`}
                    >
                      <div className={clsx(
                        'text-center',
                        isTodayCell ? 'text-primary-300 font-bold' : 'text-neutral-300'
                      )}>
                        {date.getDate()}
                      </div>
                      {eventCount > 0 && (
                        <div className="absolute bottom-0.5 left-0 right-0 text-[8px] text-center text-white/80 font-medium">
                          {eventCount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="text-sm text-neutral-400">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((intensity) => {
              const colors = [
                'bg-neutral-800/30',
                'bg-primary-900/40',
                'bg-primary-700/50',
                'bg-primary-500/60',
                'bg-primary-400/70',
              ];
              return (
                <div
                  key={intensity}
                  className={clsx('w-4 h-4 rounded', colors[intensity])}
                />
              );
            })}
          </div>
          <span className="text-sm text-neutral-400">More</span>
        </div>
      </div>
    </div>
  );
};

