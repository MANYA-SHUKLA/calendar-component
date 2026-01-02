import React, { useMemo } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { getEventsForDay, formatTime } from '@/utils/date.utils';
import { calculateEventPosition } from '@/utils/event.utils';
import clsx from 'clsx';

export interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number, minute: number) => void;
  onDragCreate?: (startDate: Date, endDate: Date) => void;
  onEventMove?: (eventId: string, newStartDate: Date, newEndDate: Date) => void;
  onEventResize?: (eventId: string, newEndDate: Date) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  selectedDate,
  onDateClick,
  onEventClick,
  onTimeSlotClick,
  onDragCreate,
  onEventMove,
  onEventResize,
}) => {
  const dayEvents = useMemo(() => {
    return getEventsForDay(events, currentDate);
  }, [events, currentDate]);

  const isToday = useMemo(() => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  }, [currentDate]);

  const getEventStyle = (event: CalendarEvent) => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const position = calculateEventPosition(event, dayEvents, dayStart);
    
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
    const endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes();
    const duration = endMinutes - startMinutes;
    
    const top = (startMinutes / 60) * 60; // 60px per hour
    const height = Math.max((duration / 60) * 60, 20);
    
    return {
      top: `${top}px`,
      height: `${height}px`,
      left: `${position.left}%`,
      width: `${position.width}%`,
      zIndex: position.zIndex,
    };
  };

  return (
    <div className="w-full h-full overflow-auto">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </h2>
              <p className="text-neutral-400">
                {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {isToday && (
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium border border-primary-500/30">
                Today
              </span>
            )}
          </div>
        </div>

        {/* Time slots */}
        <div className="relative">
          {/* Hour labels */}
          <div className="absolute left-0 top-0 bottom-0 w-20 border-r border-neutral-700 bg-gradient-to-b from-neutral-900/80 to-neutral-800/80 backdrop-blur-sm">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-neutral-700/50 px-3 text-xs text-neutral-400 flex items-start pt-1"
              >
                {formatTime(new Date(2000, 0, 1, hour, 0))}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="ml-20 relative">
            {/* Time slot grid */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-neutral-700/30 hover:bg-neutral-800/50 cursor-pointer transition-colors relative"
                onClick={() => {
                  if (onTimeSlotClick) {
                    onTimeSlotClick(currentDate, hour, 0);
                  } else {
                    const slotDate = new Date(currentDate);
                    slotDate.setHours(hour, 0, 0, 0);
                    onDateClick(slotDate);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${currentDate.toLocaleDateString()} at ${formatTime(new Date(2000, 0, 1, hour, 0))}`}
              />
            ))}
            
            {/* Events */}
            {dayEvents.map((event) => {
              const style = getEventStyle(event);
              return (
                <div
                  key={event.id}
                  data-event
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className="absolute left-0 right-0 px-2 py-1 rounded-md text-xs text-white cursor-pointer hover:opacity-95 hover:scale-[1.02] transition-all duration-200 overflow-hidden shadow-lg border border-white/10"
                  style={{
                    ...style,
                    backgroundColor: event.color || '#3b82f6',
                  }}
                  title={`${event.title} - ${formatTime(event.startDate)} - ${formatTime(event.endDate)}`}
                >
                  <div className="font-semibold truncate">{event.title}</div>
                  <div className="text-[10px] opacity-90 truncate">
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

