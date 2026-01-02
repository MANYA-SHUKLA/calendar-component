import React, { useState, useCallback, useMemo } from 'react';
import { CalendarViewProps, CalendarEvent } from './CalendarView.types';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';
import { YearView } from './YearView';
import { MiniCalendar } from './MiniCalendar';
import { EventModal } from './EventModal';
import { QuickAdd } from './QuickAdd';
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
    // Clear errors before attempting save
    eventManager.clearErrors();
    
    if (editingEvent) {
      const success = eventManager.updateEvent(editingEvent.id, eventData);
      return success;
    } else {
      const success = eventManager.addEvent(eventData);
      return success;
    }
  }, [editingEvent, eventManager]);

  const handleEventMove = useCallback((eventId: string, newStartDate: Date, newEndDate: Date) => {
    const event = eventManager.events.find((e) => e.id === eventId);
    if (!event) return false;

    const duration = event.endDate.getTime() - event.startDate.getTime();
    const newEnd = newEndDate || new Date(newStartDate.getTime() + duration);
    
    return eventManager.updateEvent(eventId, {
      startDate: newStartDate,
      endDate: newEnd,
    });
  }, [eventManager]);

  const handleEventResize = useCallback((eventId: string, newEndDate: Date) => {
    const event = eventManager.events.find((e) => e.id === eventId);
    if (!event) return false;

    if (newEndDate <= event.startDate) {
      return false; // End date must be after start date
    }

    return eventManager.updateEvent(eventId, {
      endDate: newEndDate,
    });
  }, [eventManager]);

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
    let viewStart: Date;
    let viewEnd: Date;

    if (calendar.view === 'month') {
      viewStart = new Date(calendar.currentDate.getFullYear(), calendar.currentDate.getMonth(), 1);
      viewEnd = new Date(calendar.currentDate.getFullYear(), calendar.currentDate.getMonth() + 1, 0);
    } else if (calendar.view === 'week') {
      const weekStart = new Date(calendar.currentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      viewStart = weekStart;
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      viewEnd = weekEnd;
    } else if (calendar.view === 'day') {
      viewStart = new Date(calendar.currentDate);
      viewStart.setHours(0, 0, 0, 0);
      viewEnd = new Date(calendar.currentDate);
      viewEnd.setHours(23, 59, 59, 999);
    } else if (calendar.view === 'agenda') {
      // Show events for next 30 days
      viewStart = new Date();
      viewStart.setHours(0, 0, 0, 0);
      viewEnd = new Date();
      viewEnd.setDate(viewEnd.getDate() + 30);
      viewEnd.setHours(23, 59, 59, 999);
    } else {
      // Year view - show entire year
      viewStart = new Date(calendar.currentDate.getFullYear(), 0, 1);
      viewEnd = new Date(calendar.currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    }
    
    return expandRecurringEvents(eventManager.events, viewStart, viewEnd);
  }, [eventManager.events, calendar.currentDate, calendar.view]);

  const handleQuickAdd = useCallback((eventData: Partial<CalendarEvent>) => {
    eventManager.addEvent(eventData);
  }, [eventManager]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Quick Add */}
      <div className="mb-4">
        <QuickAdd onAdd={handleQuickAdd} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-primary-500 to-accent-500 bg-clip-text text-transparent">
            Calendar
          </h1>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (calendar.view === 'month') calendar.goToPreviousMonth();
              else if (calendar.view === 'week') calendar.goToPreviousWeek();
              else if (calendar.view === 'day') calendar.goToPreviousDay();
              else if (calendar.view === 'year') calendar.goToPreviousYear();
            }}
            aria-label="Previous"
            className="px-3 py-1.5 text-lg font-bold text-primary-400 hover:text-primary-300 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700 hover:border-primary-500/50 rounded-lg transition-all duration-200 hover:scale-110"
          >
            ←
          </button>
          <button
            onClick={calendar.goToToday}
            aria-label="Go to today"
            className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/30"
          >
            Today
          </button>
          <button
            onClick={() => {
              if (calendar.view === 'month') calendar.goToNextMonth();
              else if (calendar.view === 'week') calendar.goToNextWeek();
              else if (calendar.view === 'day') calendar.goToNextDay();
              else if (calendar.view === 'year') calendar.goToNextYear();
            }}
            aria-label="Next"
            className="px-3 py-1.5 text-lg font-bold text-primary-400 hover:text-primary-300 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700 hover:border-primary-500/50 rounded-lg transition-all duration-200 hover:scale-110"
          >
            →
          </button>

          {(calendar.view === 'month' || calendar.view === 'week') && (
            <Select
              options={monthYearOptions}
              value={currentMonthYear}
              onChange={(e) => handleMonthYearChange(e.target.value)}
              className="min-w-[180px]"
            />
          )}

          {/* Mini Calendar */}
          {(calendar.view === 'day' || calendar.view === 'agenda') && (
            <MiniCalendar
              selectedDate={calendar.currentDate}
              onDateSelect={(date) => {
                calendar.goToDate(date);
                if (calendar.view === 'day') {
                  calendar.setView('day');
                }
              }}
              className="hidden sm:block"
            />
          )}

          <div className="flex border border-neutral-700 rounded-lg overflow-hidden bg-neutral-800/50 backdrop-blur-sm">
            <button
              onClick={() => calendar.setView('month')}
              className={clsx(
                'px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200',
                calendar.view === 'month'
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-700/50'
              )}
              aria-pressed={calendar.view === 'month'}
            >
              Month
            </button>
            <button
              onClick={() => calendar.setView('week')}
              className={clsx(
                'px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-l border-neutral-700',
                calendar.view === 'week'
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-700/50'
              )}
              aria-pressed={calendar.view === 'week'}
            >
              Week
            </button>
            <button
              onClick={() => calendar.setView('day')}
              className={clsx(
                'px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-l border-neutral-700',
                calendar.view === 'day'
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-700/50'
              )}
              aria-pressed={calendar.view === 'day'}
            >
              Day
            </button>
            <button
              onClick={() => calendar.setView('agenda')}
              className={clsx(
                'px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-l border-neutral-700',
                calendar.view === 'agenda'
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-700/50'
              )}
              aria-pressed={calendar.view === 'agenda'}
            >
              Agenda
            </button>
            <button
              onClick={() => calendar.setView('year')}
              className={clsx(
                'px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-l border-neutral-700',
                calendar.view === 'year'
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-700/50'
              )}
              aria-pressed={calendar.view === 'year'}
            >
              Year
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
            onEventMove={handleEventMove}
            onEventUpdate={(eventId, updates) => {
              eventManager.updateEvent(eventId, updates);
            }}
          />
        ) : calendar.view === 'week' ? (
          <WeekView
            currentDate={calendar.currentDate}
            events={displayedEvents}
            selectedDate={calendar.selectedDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
            onDragCreate={handleDragCreate}
            onEventMove={handleEventMove}
            onEventResize={handleEventResize}
          />
        ) : calendar.view === 'day' ? (
          <DayView
            currentDate={calendar.currentDate}
            events={displayedEvents}
            selectedDate={calendar.selectedDate}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
            onDragCreate={handleDragCreate}
            onEventMove={handleEventMove}
            onEventResize={handleEventResize}
          />
        ) : calendar.view === 'agenda' ? (
          <AgendaView
            currentDate={calendar.currentDate}
            events={displayedEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        ) : (
          <YearView
            currentDate={calendar.currentDate}
            events={displayedEvents}
            onDateClick={(date) => {
              calendar.goToDate(date);
              calendar.setView('month');
            }}
            onEventClick={handleEventClick}
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
        validationErrors={eventManager.errors}
      />
    </div>
  );
};

