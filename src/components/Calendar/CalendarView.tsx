import React, { useState, useCallback, useMemo } from 'react';
import { CalendarViewProps, CalendarEvent } from './CalendarView.types';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { EventModal } from './EventModal';
import { useCalendar } from '@/hooks/useCalendar';
import { useEventManager } from '@/hooks/useEventManager';
import { formatDate } from '@/utils/date.utils';
import { expandRecurringEvents } from '@/utils/smart-calendar.utils';
import { Button } from '../primitives/Button';
import { Select } from '../primitives/Select';
import clsx from 'clsx';

export const CalendarView: React.FC<CalendarViewProps> = ({
  events: initialEvents,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  initialView = 'month',
  initialDate = new Date(),
}) => {
  const calendar = useCalendar(initialDate, initialView);
  const eventManager = useEventManager(
    initialEvents,
    onEventAdd,
    onEventUpdate,
    onEventDelete
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>();
  const [modalInitialEndDate, setModalInitialEndDate] = useState<Date | undefined>();

  const handleDateClick = useCallback((date: Date) => {
    setEditingEvent(null);
    setModalInitialDate(date);
    setModalInitialEndDate(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    // Find the original event from the manager
    // If this is a recurring event instance (ID like "baseId-0"), find the original
    let eventToEdit = eventManager.events.find((e) => e.id === event.id);
    
    // If not found, it might be a recurring instance - try to find by base ID
    if (!eventToEdit && event.id.includes('-')) {
      // Try to find the base event by matching the ID pattern
      // Recurring instances have IDs like "baseId-0", "baseId-1", etc.
      const parts = event.id.split('-');
      if (parts.length > 1) {
        // Try progressively longer base IDs
        for (let i = parts.length - 1; i > 0; i--) {
          const baseId = parts.slice(0, i).join('-');
          const found = eventManager.events.find((e) => e.id === baseId);
          if (found) {
            eventToEdit = found;
            break;
          }
        }
      }
    }
    
    // Fallback to the clicked event if we can't find the original
    if (!eventToEdit) {
      eventToEdit = event;
    }
    
    setEditingEvent(eventToEdit);
    setModalInitialDate(undefined);
    setModalInitialEndDate(undefined);
    setIsModalOpen(true);
  }, [eventManager.events]);

  const handleSaveEvent = useCallback((eventData: Partial<CalendarEvent>): boolean => {
    if (editingEvent) {
      return eventManager.updateEvent(editingEvent.id, eventData);
    } else {
      return eventManager.addEvent(eventData);
    }
  }, [editingEvent, eventManager]);

  const handleDeleteEvent = useCallback((id: string) => {
    eventManager.deleteEvent(id);
  }, [eventManager]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setModalInitialDate(undefined);
    setModalInitialEndDate(undefined);
    eventManager.clearErrors();
  }, [eventManager]);

  const handleTimeSlotClick = useCallback((date: Date, hour: number, minute: number) => {
    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);
    handleDateClick(slotDate);
  }, [handleDateClick]);

  const handleDragCreate = useCallback((startDate: Date, endDate: Date) => {
    setEditingEvent(null);
    setModalInitialDate(startDate);
    setModalInitialEndDate(endDate);
    setIsModalOpen(true);
  }, []);

  const monthYearOptions = useMemo(() => {
    const options = [];
    const currentYear = calendar.currentDate.getFullYear();
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        options.push({
          value: `${year}-${month}`,
          label: formatDate(date),
        });
      }
    }
    return options;
  }, [calendar.currentDate]);

  const currentMonthYear = useMemo(() => {
    const year = calendar.currentDate.getFullYear();
    const month = calendar.currentDate.getMonth();
    return `${year}-${month}`;
  }, [calendar.currentDate]);

  const handleMonthYearChange = useCallback((value: string) => {
    const [year, month] = value.split('-').map(Number);
    calendar.goToDate(new Date(year, month, 1));
  }, [calendar]);

  // Expand recurring events for display
  const displayedEvents = useMemo(() => {
    const viewStart = calendar.view === 'month'
      ? new Date(calendar.currentDate.getFullYear(), calendar.currentDate.getMonth(), 1)
      : (() => {
          const weekStart = new Date(calendar.currentDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          return weekStart;
        })();
    
    const viewEnd = calendar.view === 'month'
      ? new Date(calendar.currentDate.getFullYear(), calendar.currentDate.getMonth() + 1, 0)
      : (() => {
          const weekEnd = new Date(viewStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return weekEnd;
        })();
    
    return expandRecurringEvents(eventManager.events, viewStart, viewEnd);
  }, [eventManager.events, calendar.currentDate, calendar.view]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-accent-500 bg-clip-text text-transparent">
            Calendar
          </h1>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={calendar.view === 'month' ? calendar.goToPreviousMonth : calendar.goToPreviousWeek}
            aria-label={calendar.view === 'month' ? 'Previous month' : 'Previous week'}
            className="px-3 py-1.5 text-lg font-bold text-primary-400 hover:text-primary-300 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700 hover:border-primary-500/50 rounded-lg transition-all duration-200 hover:scale-110"
          >
            ←
          </button>
          <button
            onClick={calendar.goToToday}
            aria-label="Go to today"
            className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-primary-500/30"
          >
            Today
          </button>
          <button
            onClick={calendar.view === 'month' ? calendar.goToNextMonth : calendar.goToNextWeek}
            aria-label={calendar.view === 'month' ? 'Next month' : 'Next week'}
            className="px-3 py-1.5 text-lg font-bold text-primary-400 hover:text-primary-300 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700 hover:border-primary-500/50 rounded-lg transition-all duration-200 hover:scale-110"
          >
            →
          </button>

          <Select
            options={monthYearOptions}
            value={currentMonthYear}
            onChange={(e) => handleMonthYearChange(e.target.value)}
            className="min-w-[180px]"
          />

          <div className="flex border border-neutral-700 rounded-lg overflow-hidden bg-neutral-800/50 backdrop-blur-sm">
            <button
              onClick={() => calendar.setView('month')}
              className={clsx(
                'px-4 py-2 text-sm font-medium transition-all duration-200',
                calendar.view === 'month'
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50'
              )}
              aria-pressed={calendar.view === 'month'}
            >
              Month
            </button>
            <button
              onClick={() => calendar.setView('week')}
              className={clsx(
                'px-4 py-2 text-sm font-medium transition-all duration-200 border-l border-neutral-700',
                calendar.view === 'week'
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50'
              )}
              aria-pressed={calendar.view === 'week'}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-auto">
        {calendar.view === 'month' ? (
          <MonthView
            currentDate={calendar.currentDate}
            events={displayedEvents}
            selectedDate={calendar.selectedDate}
            selectedDateRange={calendar.selectedDateRange}
            onDateClick={handleDateClick}
            onDateRangeSelect={calendar.setSelectedDateRange}
            onEventClick={handleEventClick}
          />
        ) : (
          <WeekView
            currentDate={calendar.currentDate}
            events={displayedEvents}
            selectedDate={calendar.selectedDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
            onDragCreate={handleDragCreate}
          />
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={editingEvent}
        initialDate={modalInitialDate}
        initialEndDate={modalInitialEndDate}
        existingEvents={eventManager.events}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
      />
    </div>
  );
};

