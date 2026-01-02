import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { getWeekDays, getEventsForDay, formatTime } from '@/utils/date.utils';
import { calculateEventPosition } from '@/utils/event.utils';
import clsx from 'clsx';

export interface WeekViewProps {
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

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export const WeekView: React.FC<WeekViewProps> = ({
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
  const weekDaysList = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ date: Date; hour: number; minute: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: Date; hour: number; minute: number } | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizedEvent, setResizedEvent] = useState<CalendarEvent | null>(null);
  const [resizeStartY, setResizeStartY] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTimeSlotClick = (date: Date, hour: number) => {
    // Only handle click if not dragging
    if (!isDragging && !dragStart) {
      if (onTimeSlotClick) {
        onTimeSlotClick(date, hour, 0);
      } else {
        const slotDate = new Date(date);
        slotDate.setHours(hour, 0, 0, 0);
        onDateClick(slotDate);
      }
    }
  };

  const getTimeSlotFromPoint = useCallback((clientX: number, clientY: number): { date: Date; hour: number; minute: number } | null => {
    if (!containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Calculate which day column (skip the time label column)
    const dayColumnWidth = (rect.width - 64) / 7; // 64px for time labels
    const dayIndex = Math.floor((x - 64) / dayColumnWidth);
    
    if (dayIndex < 0 || dayIndex >= weekDaysList.length) return null;
    
    // Calculate which hour
    const hourHeight = 60; // 60px per hour
    const hour = Math.floor(y / hourHeight);
    const minute = Math.floor(((y % hourHeight) / hourHeight) * 60);
    
    if (hour < 0 || hour >= 24) return null;
    
    const date = new Date(weekDaysList[dayIndex]);
    return { date, hour, minute };
  }, [weekDaysList]);

  const handleEventDragStart = useCallback((e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    
    const timeSlot = getTimeSlotFromPoint(e.clientX, e.clientY);
    if (!timeSlot) return;
    
    setDraggedEvent(event);
    setDragStart(timeSlot);
    setDragEnd(timeSlot);
    setIsDragging(true);
  }, [getTimeSlotFromPoint]);

  const handleEventResizeStart = useCallback((e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    
    setResizedEvent(event);
    setResizeStartY(e.clientY);
    setIsResizing(true);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, date: Date, hour: number) => {
    // Only start drag if left mouse button and not clicking on an event or resize handle
    if (e.button !== 0 || (e.target as HTMLElement).closest('[data-event]') || (e.target as HTMLElement).closest('[data-resize-handle]')) {
      return;
    }
    
    // Prevent text selection during drag, but allow clicks to work via mouseup handler
    e.preventDefault();
    const minute = 0;
    setDragStart({ date, hour, minute });
    setDragEnd({ date, hour, minute });
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && resizedEvent && resizeStartY !== 0) {
      const deltaY = e.clientY - resizeStartY;
      const hourHeight = 60; // 60px per hour
      const minutesDelta = Math.round((deltaY / hourHeight) * 60);
      
      const newEndDate = new Date(resizedEvent.endDate);
      newEndDate.setMinutes(newEndDate.getMinutes() + minutesDelta);
      
      // Minimum 15 minutes duration
      if (newEndDate > resizedEvent.startDate) {
        setResizedEvent({ ...resizedEvent, endDate: newEndDate });
      }
      return;
    }
    
    if (isDragging && draggedEvent && dragStart) {
      const timeSlot = getTimeSlotFromPoint(e.clientX, e.clientY);
      if (timeSlot) {
        setDragEnd(timeSlot);
      }
      return;
    }
    
    if (isDragging && !draggedEvent && dragStart) {
      const timeSlot = getTimeSlotFromPoint(e.clientX, e.clientY);
      if (timeSlot) {
        setDragEnd(timeSlot);
      }
    }
  }, [isDragging, isResizing, dragStart, draggedEvent, resizedEvent, resizeStartY, getTimeSlotFromPoint]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isResizing && resizedEvent && onEventResize) {
      onEventResize(resizedEvent.id, resizedEvent.endDate);
      setIsResizing(false);
      setResizedEvent(null);
      setResizeStartY(0);
      return;
    }
    
    if (isDragging && draggedEvent && dragStart && dragEnd && onEventMove) {
      // Event was being dragged
      const newStartDate = new Date(dragEnd.date);
      newStartDate.setHours(dragEnd.hour, dragEnd.minute, 0, 0);
      
      const duration = draggedEvent.endDate.getTime() - draggedEvent.startDate.getTime();
      const newEndDate = new Date(newStartDate.getTime() + duration);
      
      onEventMove(draggedEvent.id, newStartDate, newEndDate);
      setIsDragging(false);
      setDraggedEvent(null);
      setDragStart(null);
      setDragEnd(null);
      return;
    }
    
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setDraggedEvent(null);
      return;
    }
    
    // Create dates from drag start and end
    const startDate = new Date(dragStart.date);
    startDate.setHours(dragStart.hour, dragStart.minute, 0, 0);
    
    const endDate = new Date(dragEnd.date);
    endDate.setHours(dragEnd.hour, dragEnd.minute, 0, 0);
    
    // Check if it was just a click (start and end are the same)
    const wasClick = dragStart.date.getTime() === dragEnd.date.getTime() && 
                     dragStart.hour === dragEnd.hour && 
                     dragStart.minute === dragEnd.minute;
    
    if (!wasClick) {
      // It was a drag - create event
      // Ensure start is before end
      const finalStart = startDate < endDate ? startDate : endDate;
      let finalEnd = startDate < endDate ? endDate : startDate;
      
      // Minimum duration of 15 minutes
      if (finalEnd.getTime() - finalStart.getTime() < 15 * 60 * 1000) {
        finalEnd = new Date(finalStart);
        finalEnd.setMinutes(finalEnd.getMinutes() + 15);
      }
      
      if (onDragCreate) {
        onDragCreate(finalStart, finalEnd);
      }
    } else {
      // It was just a click - trigger the click handler
      // Store the values before resetting state
      const clickDate = dragStart.date;
      const clickHour = dragStart.hour;
      // Use setTimeout to ensure state is reset before calling the handler
      setTimeout(() => {
        handleTimeSlotClick(clickDate, clickHour);
      }, 0);
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDraggedEvent(null);
  }, [isDragging, isResizing, dragStart, dragEnd, draggedEvent, resizedEvent, onDragCreate, onEventMove, onEventResize, handleTimeSlotClick]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Calculate drag preview
  const dragPreview = useMemo(() => {
    if (!isDragging || !dragStart || !dragEnd) return null;
    
    const startDate = new Date(dragStart.date);
    startDate.setHours(dragStart.hour, dragStart.minute, 0, 0);
    
    const endDate = new Date(dragEnd.date);
    endDate.setHours(dragEnd.hour, dragEnd.minute, 0, 0);
    
    const finalStart = startDate < endDate ? startDate : endDate;
    const finalEnd = startDate < endDate ? endDate : startDate;
    
    // Ensure minimum duration
    if (finalEnd.getTime() - finalStart.getTime() < 15 * 60 * 1000) {
      finalEnd.setTime(finalStart.getTime() + 15 * 60 * 1000);
    }
    
    return { start: finalStart, end: finalEnd };
  }, [isDragging, dragStart, dragEnd]);

  const getEventStyle = (event: CalendarEvent, dayDate: Date) => {
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEvents = getEventsForDay(events, dayDate);
    const position = calculateEventPosition(event, dayEvents, dayStart);
    
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    // Check if event is on this day
    const eventDay = new Date(eventStart);
    eventDay.setHours(0, 0, 0, 0);
    const dayDateStart = new Date(dayDate);
    dayDateStart.setHours(0, 0, 0, 0);
    
    if (eventDay.getTime() !== dayDateStart.getTime()) {
      // Event spans multiple days, adjust start time
      eventStart.setHours(0, 0, 0, 0);
    }
    
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
    <div className="w-full overflow-x-auto" ref={containerRef}>
      <div className="min-w-[800px]">
        {/* Header with day names */}
        <div className="grid grid-cols-8 border-b border-neutral-700 bg-gradient-to-b from-neutral-800/80 to-neutral-900/80 backdrop-blur-sm">
          <div className="p-2 border-r border-neutral-700 bg-neutral-900/50"></div>
          {weekDaysList.map((date, index) => {
            const isSelected = selectedDate
              ? date.toDateString() === selectedDate.toDateString()
              : false;
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={date.toISOString()}
                className={clsx(
                  'p-2 text-center border-r border-neutral-700 transition-all duration-200',
                  isSelected && 'bg-gradient-to-br from-primary-500/30 to-accent-500/30',
                  isToday && 'bg-gradient-to-br from-primary-500/40 to-accent-500/40'
                )}
              >
                <div className="text-xs text-neutral-400">{weekDays[index]}</div>
                <div
                  className={clsx(
                    'text-lg font-semibold',
                    isToday ? 'text-primary-400' : 'text-neutral-200'
                  )}
                >
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="relative">
          {/* Hour labels */}
          <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-neutral-700 bg-gradient-to-b from-neutral-900/80 to-neutral-800/80 backdrop-blur-sm">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-neutral-700/50 px-2 text-xs text-neutral-400 flex items-start pt-1"
              >
                {formatTime(new Date(2000, 0, 1, hour, 0))}
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="ml-16 grid grid-cols-7 relative">
            {weekDaysList.map((dayDate) => {
              const dayEvents = getEventsForDay(events, dayDate);
              
              return (
                <div
                  key={dayDate.toISOString()}
                  className="border-r border-neutral-700/50 relative bg-neutral-900/20"
                >
                  {/* Time slot grid */}
                  {hours.map((hour) => {
                    const isInDragRange = dragPreview && (() => {
                      const slotDate = new Date(dayDate);
                      slotDate.setHours(hour, 0, 0, 0);
                      const slotEnd = new Date(slotDate);
                      slotEnd.setMinutes(60);
                      
                      const dragStartTime = dragPreview.start.getTime();
                      const dragEndTime = dragPreview.end.getTime();
                      const slotStartTime = slotDate.getTime();
                      const slotEndTime = slotEnd.getTime();
                      
                      // Check if slot overlaps with drag range
                      return slotStartTime < dragEndTime && slotEndTime > dragStartTime &&
                        dragPreview.start.toDateString() === dayDate.toDateString();
                    })();
                    
                    return (
                      <div
                        key={`${dayDate.toISOString()}-${hour}`}
                        className={clsx(
                          "h-[60px] border-b border-neutral-700/30 hover:bg-neutral-800/50 cursor-pointer transition-all duration-200 relative",
                          isInDragRange && "bg-primary-500/20 border-primary-500/50"
                        )}
                        onMouseDown={(e) => handleMouseDown(e, dayDate, hour)}
                        onClick={() => handleTimeSlotClick(dayDate, hour)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${dayDate.toLocaleDateString()} at ${formatTime(new Date(2000, 0, 1, hour, 0))}`}
                      />
                    );
                  })}
                  
                  {/* Drag preview */}
                  {dragPreview && dragPreview.start.toDateString() === dayDate.toDateString() && (() => {
                    const startMinutes = dragPreview.start.getHours() * 60 + dragPreview.start.getMinutes();
                    const endMinutes = dragPreview.end.getHours() * 60 + dragPreview.end.getMinutes();
                    const duration = Math.max(endMinutes - startMinutes, 15);
                    const top = (startMinutes / 60) * 60;
                    const height = (duration / 60) * 60;
                    
                    return (
                      <div
                        className="absolute left-0 right-0 px-2 py-1 rounded-md text-xs text-white pointer-events-none opacity-60 border-2 border-dashed border-primary-400 bg-primary-500/30"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                      >
                        <div className="font-semibold">New Event</div>
                        <div className="text-[10px] opacity-90">
                          {formatTime(dragPreview.start)} - {formatTime(dragPreview.end)}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Events */}
                  {dayEvents.map((event) => {
                    const isDragged = draggedEvent?.id === event.id;
                    const isResized = resizedEvent?.id === event.id;
                    const displayEvent = isResized ? resizedEvent : (isDragged && dragEnd ? (() => {
                      const newStart = new Date(dragEnd.date);
                      newStart.setHours(dragEnd.hour, dragEnd.minute, 0, 0);
                      const duration = event.endDate.getTime() - event.startDate.getTime();
                      const newEnd = new Date(newStart.getTime() + duration);
                      return { ...event, startDate: newStart, endDate: newEnd };
                    })() : event);
                    
                    const style = getEventStyle(displayEvent, dayDate);
                    return (
                      <div
                        key={event.id}
                        data-event
                        onMouseDown={(e) => handleEventDragStart(e, event)}
                        onClick={(e) => {
                          if (!isDragging && !isResizing) {
                            e.stopPropagation();
                            onEventClick(event);
                          }
                        }}
                        className={clsx(
                          "absolute left-0 right-0 px-2 py-1 rounded-md text-xs text-white cursor-move hover:opacity-95 hover:scale-[1.02] transition-all duration-200 overflow-hidden shadow-lg border border-white/10",
                          isDragged && "opacity-80 z-50",
                          isResized && "opacity-80 z-50"
                        )}
                        style={{
                          ...style,
                          backgroundColor: event.color || '#3b82f6',
                        }}
                        title={`${event.title} - ${formatTime(event.startDate)} - ${formatTime(event.endDate)}`}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="text-[10px] opacity-90 truncate">
                          {formatTime(displayEvent.startDate)} - {formatTime(displayEvent.endDate)}
                        </div>
                        {/* Resize handle */}
                        <div
                          data-resize-handle
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleEventResizeStart(e, event);
                          }}
                          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/20 transition-colors"
                          style={{ borderBottomLeftRadius: '0.375rem', borderBottomRightRadius: '0.375rem' }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

