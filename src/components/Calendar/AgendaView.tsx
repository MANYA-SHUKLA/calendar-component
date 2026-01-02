import React, { useMemo } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { formatDate, formatTime, isSameDay } from '@/utils/date.utils';
import { sortEventsByDate } from '@/utils/event.utils';
import clsx from 'clsx';

export interface AgendaViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  events,
  currentDate,
  onEventClick,
  onDateClick,
}) => {
  // Group events by date and sort chronologically
  const groupedEvents = useMemo(() => {
    const sorted = sortEventsByDate(events);
    const grouped = new Map<string, CalendarEvent[]>();
    
    sorted.forEach((event) => {
      const dateKey = event.startDate.toISOString().split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });
    
    return grouped;
  }, [events]);

  const eventDates = useMemo(() => {
    return Array.from(groupedEvents.keys()).sort();
  }, [groupedEvents]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="w-full h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {eventDates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400 text-lg">No events scheduled</p>
            <button
              onClick={() => onDateClick(new Date())}
              className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Create Event
            </button>
          </div>
        ) : (
          eventDates.map((dateKey) => {
            const date = new Date(dateKey);
            const dayEvents = groupedEvents.get(dateKey) || [];
            const isToday = isSameDay(date, today);
            const isPast = date < today;

            return (
              <div
                key={dateKey}
                className={clsx(
                  'border-l-4 rounded-lg p-4 transition-all duration-200',
                  isToday
                    ? 'border-primary-500 bg-primary-500/10'
                    : isPast
                    ? 'border-neutral-600 bg-neutral-800/30'
                    : 'border-primary-400 bg-neutral-800/50'
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onDateClick(date)}
                      className={clsx(
                        'text-left transition-colors hover:opacity-80',
                        isToday && 'font-bold'
                      )}
                    >
                      <div className="text-sm text-neutral-400 uppercase tracking-wide">
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                      </div>
                      <div
                        className={clsx(
                          'text-2xl font-semibold',
                          isToday ? 'text-primary-400' : 'text-neutral-200'
                        )}
                      >
                        {date.getDate()}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </button>
                  </div>
                  <div className="text-sm text-neutral-400">
                    {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={clsx(
                        'p-3 rounded-lg cursor-pointer transition-all duration-200',
                        'hover:scale-[1.02] hover:shadow-lg',
                        'border border-white/10'
                      )}
                      style={{
                        backgroundColor: `${event.color || '#3b82f6'}20`,
                        borderColor: `${event.color || '#3b82f6'}40`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: event.color || '#3b82f6' }}
                            />
                            <h3 className="font-semibold text-white truncate">{event.title}</h3>
                          </div>
                          {event.description && (
                            <p className="text-sm text-neutral-300 line-clamp-2 mt-1">
                              {event.description}
                            </p>
                          )}
                          {event.category && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-neutral-700/50 text-neutral-300 rounded">
                              {event.category}
                            </span>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-medium text-white">
                            {formatTime(event.startDate)}
                          </div>
                          {event.endDate && (
                            <div className="text-xs text-neutral-400">
                              - {formatTime(event.endDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

