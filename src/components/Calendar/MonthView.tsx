import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { CalendarCell } from './CalendarCell';
import { getCalendarGrid, getEventsForDay, isCurrentMonth, isToday, isDateInRange } from '@/utils/date.utils';

export interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  selectedDateRange: { start: Date; end: Date } | null;
  onDateClick: (date: Date) => void;
  onDateRangeSelect?: (range: { start: Date; end: Date } | null) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  selectedDate,
  selectedDateRange,
  onDateClick,
  onDateRangeSelect,
  onEventClick,
}) => {
  const grid = getCalendarGrid(currentDate);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCellMouseDown = useCallback((e: React.MouseEvent, date: Date) => {
    // Only start drag if left mouse button and not clicking on an event
    if (e.button !== 0 || (e.target as HTMLElement).closest('[data-event]')) {
      return;
    }
    
    e.preventDefault();
    setDragStart(date);
    setDragEnd(date);
    setIsDragging(true);
  }, []);

  const handleCellMouseEnter = useCallback((date: Date) => {
    if (isDragging && dragStart) {
      setDragEnd(date);
    }
  }, [isDragging, dragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart || !containerRef.current) return;
    
    const cellElement = document.elementFromPoint(e.clientX, e.clientY);
    if (cellElement) {
      const cell = cellElement.closest('[data-date]');
      if (cell) {
        const dateStr = cell.getAttribute('data-date');
        if (dateStr) {
          const date = new Date(dateStr);
          setDragEnd(date);
        }
      }
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }
    
    // Create range from drag start and end
    const rangeStart = new Date(dragStart);
    rangeStart.setHours(0, 0, 0, 0);
    
    const rangeEnd = new Date(dragEnd);
    rangeEnd.setHours(0, 0, 0, 0);
    
    // Only set range if it's a multi-date selection
    if (onDateRangeSelect && (dragStart.getTime() !== dragEnd.getTime())) {
      const finalStart = rangeStart < rangeEnd ? rangeStart : rangeEnd;
      const finalEnd = rangeStart < rangeEnd ? rangeEnd : rangeStart;
      onDateRangeSelect({ start: finalStart, end: finalEnd });
    } else if (dragStart.getTime() === dragEnd.getTime()) {
      // Single date click - use normal date click handler
      onDateClick(dragStart);
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, onDateRangeSelect, onDateClick]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate current drag range
  const currentRange = isDragging && dragStart && dragEnd ? (() => {
    const rangeStart = new Date(dragStart);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(dragEnd);
    rangeEnd.setHours(0, 0, 0, 0);
    const finalStart = rangeStart < rangeEnd ? rangeStart : rangeEnd;
    const finalEnd = rangeStart < rangeEnd ? rangeEnd : rangeStart;
    return { start: finalStart, end: finalEnd };
  })() : selectedDateRange;

  return (
    <div className="w-full">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-px bg-neutral-800/50 border border-neutral-700 rounded-t-xl overflow-hidden backdrop-blur-sm shadow-lg">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-gradient-to-b from-neutral-800/80 to-neutral-900/80 px-4 py-3 text-center text-sm font-semibold text-neutral-300 border-b border-neutral-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div 
        ref={containerRef}
        className="grid grid-cols-7 gap-px bg-neutral-800/50 border border-neutral-700 border-t-0 rounded-b-xl overflow-hidden backdrop-blur-sm shadow-lg"
      >
        {grid.map((date, index) => {
          const dayEvents = getEventsForDay(events, date);
          const isSelected = selectedDate
            ? date.toDateString() === selectedDate.toDateString()
            : false;
          const isInRange = currentRange ? isDateInRange(date, currentRange) : false;
          const isCurrentMonthCell = isCurrentMonth(date, currentDate);
          const isTodayCell = isToday(date);

          return (
            <div
              key={`${date.toISOString()}-${index}`}
              data-date={date.toISOString()}
              onMouseDown={(e) => handleCellMouseDown(e, date)}
              onMouseEnter={() => handleCellMouseEnter(date)}
            >
              <CalendarCell
                date={date}
                events={dayEvents}
                isToday={isTodayCell}
                isSelected={isSelected}
                isInRange={isInRange}
                isCurrentMonth={isCurrentMonthCell}
                onClick={onDateClick}
                onEventClick={onEventClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

