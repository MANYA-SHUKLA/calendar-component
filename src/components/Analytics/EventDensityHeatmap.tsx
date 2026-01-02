'use client';

import React, { useMemo } from 'react';
import { calculateEventDensity, EventDensity } from '@/utils/analytics.utils';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { isToday } from '@/utils/date.utils';
import clsx from 'clsx';

export interface EventDensityHeatmapProps {
  events: CalendarEvent[];
  startDate: Date;
  endDate: Date;
  onDateClick?: (date: Date) => void;
}

export const EventDensityHeatmap: React.FC<EventDensityHeatmapProps> = ({
  events,
  startDate,
  endDate,
  onDateClick,
}) => {
  const densityData = useMemo(() => {
    return calculateEventDensity(events, startDate, endDate);
  }, [events, startDate, endDate]);

  const intensityColors = [
    'bg-neutral-800/30', // 0 - no events
    'bg-primary-900/40', // 1 - light
    'bg-primary-700/50', // 2 - medium
    'bg-primary-500/60', // 3 - busy
    'bg-primary-400/70', // 4 - very busy
  ];

  const getIntensityColor = (intensity: number): string => {
    return intensityColors[Math.min(intensity, 4)] || intensityColors[0];
  };

  // Group by month for better display
  const groupedByMonth = useMemo(() => {
    const groups = new Map<string, EventDensity[]>();
    densityData.forEach((item) => {
      const monthKey = `${item.date.getFullYear()}-${item.date.getMonth()}`;
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(item);
    });
    return groups;
  }, [densityData]);

  if (densityData.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-white mb-4">Event Density</h3>
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
          <p className="text-neutral-400 text-sm">No events in this period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-white mb-4">Event Density Heatmap</h3>
      <div className="space-y-6">
        {Array.from(groupedByMonth.entries()).map(([monthKey, items]) => {
          const firstDate = items[0].date;
          const monthName = firstDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          
          return (
            <div key={monthKey} className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
              <h4 className="text-sm font-semibold text-neutral-300 mb-3">{monthName}</h4>
              <div className="grid grid-cols-7 gap-1">
                {items.map((item) => {
                  const isTodayCell = isToday(item.date);
                  return (
                    <button
                      key={item.date.toISOString()}
                      onClick={() => onDateClick?.(item.date)}
                      className={clsx(
                        'aspect-square rounded text-xs transition-all duration-200',
                        'hover:scale-110 hover:z-10 relative',
                        getIntensityColor(item.intensity),
                        isTodayCell && 'ring-2 ring-primary-400 ring-offset-1 ring-offset-neutral-800'
                      )}
                      title={`${item.date.toLocaleDateString()} - ${item.eventCount} events, ${item.hours.toFixed(1)} hours`}
                    >
                      <div className={clsx(
                        'text-center',
                        isTodayCell ? 'text-primary-300 font-bold' : 'text-neutral-300'
                      )}>
                        {item.date.getDate()}
                      </div>
                      {item.eventCount > 0 && (
                        <div className="absolute bottom-0.5 left-0 right-0 text-[8px] text-center text-white/80 font-medium">
                          {item.eventCount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="text-sm text-neutral-400">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div
              key={intensity}
              className={clsx('w-4 h-4 rounded', intensityColors[intensity])}
              title={`Intensity ${intensity}`}
            />
          ))}
        </div>
        <span className="text-sm text-neutral-400">More</span>
      </div>
    </div>
  );
};

