import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { isSameDay } from './date.utils';

/**
 * Sorts events by start date
 */
export const sortEventsByDate = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};

/**
 * Groups events by day
 */
export const groupEventsByDay = (
  events: CalendarEvent[]
): Map<string, CalendarEvent[]> => {
  const grouped = new Map<string, CalendarEvent[]>();
  
  events.forEach((event) => {
    const dateKey = event.startDate.toISOString().split('T')[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(event);
  });
  
  return grouped;
};

/**
 * Checks if two events overlap
 */
export const eventsOverlap = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
  return (
    event1.startDate < event2.endDate &&
    event2.startDate < event1.endDate
  );
};

/**
 * Calculates the position and width for overlapping events
 */
export const calculateEventPosition = (
  event: CalendarEvent,
  allEvents: CalendarEvent[],
  dayStart: Date
): { left: number; width: number; zIndex: number } => {
  const overlappingEvents = allEvents.filter((e) => 
    e.id !== event.id && eventsOverlap(event, e)
  );
  
  const sortedOverlapping = [event, ...overlappingEvents].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );
  
  const index = sortedOverlapping.findIndex((e) => e.id === event.id);
  const totalOverlapping = sortedOverlapping.length;
  
  const width = 100 / totalOverlapping;
  const left = (index * width);
  
  return {
    left,
    width,
    zIndex: totalOverlapping - index,
  };
};

/**
 * Generates a unique event ID
 */
export const generateEventId = (): string => {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validates event data
 */
export const validateEvent = (event: Partial<CalendarEvent>): string[] => {
  const errors: string[] = [];
  
  if (!event.title || event.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (event.title && event.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }
  
  if (event.description && event.description.length > 500) {
    errors.push('Description must be 500 characters or less');
  }
  
  if (!event.startDate) {
    errors.push('Start date is required');
  }
  
  if (!event.endDate) {
    errors.push('End date is required');
  }
  
  if (event.startDate && event.endDate && event.endDate < event.startDate) {
    errors.push('End date must be after start date');
  }
  
  return errors;
};

