import { useState, useCallback, useEffect } from 'react';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { validateEvent } from '@/utils/event.utils';
import { generateEventId } from '@/utils/event.utils';

const STORAGE_KEY = 'calendar-events';

/**
 * Loads events from localStorage
 */
const loadEventsFromStorage = (): CalendarEvent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((event: any) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
      }));
    }
  } catch (error) {
    console.warn('Failed to load events from localStorage:', error);
  }
  return [];
};

/**
 * Saves events to localStorage
 */
const saveEventsToStorage = (events: CalendarEvent[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.warn('Failed to save events to localStorage:', error);
  }
};

export const useEventManager = (
  initialEvents: CalendarEvent[] = [],
  onEventAdd?: (event: CalendarEvent) => void,
  onEventUpdate?: (id: string, updates: Partial<CalendarEvent>) => void,
  onEventDelete?: (id: string) => void,
  useLocalStorage: boolean = true
) => {
  // Load from localStorage on mount if enabled and no initial events provided
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (useLocalStorage && initialEvents.length === 0) {
      return loadEventsFromStorage();
    }
    return initialEvents;
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Sync with initialEvents when they change externally (but only if not using localStorage or initialEvents are provided)
  useEffect(() => {
    if (!useLocalStorage || initialEvents.length > 0) {
      setEvents(initialEvents);
    }
  }, [initialEvents, useLocalStorage]);

  // Save to localStorage whenever events change (if enabled)
  useEffect(() => {
    if (useLocalStorage) {
      saveEventsToStorage(events);
    }
  }, [events, useLocalStorage]);

  const addEvent = useCallback(
    (event: Partial<CalendarEvent>): boolean => {
      const validationErrors = validateEvent(event);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return false;
      }

      const newEvent: CalendarEvent = {
        id: generateEventId(),
        title: event.title!,
        description: event.description,
        startDate: event.startDate!,
        endDate: event.endDate!,
        color: event.color || '#3b82f6',
        category: event.category,
        recurrence: event.recurrence,
        templateId: event.templateId,
      };

      setEvents((prev) => [...prev, newEvent]);
      setErrors([]);
      onEventAdd?.(newEvent);
      return true;
    },
    [onEventAdd]
  );

  const updateEvent = useCallback(
    (id: string, updates: Partial<CalendarEvent>): boolean => {
      const existingEvent = events.find((e) => e.id === id);
      if (!existingEvent) {
        setErrors(['Event not found']);
        return false;
      }

      const updatedEvent = { ...existingEvent, ...updates };
      const validationErrors = validateEvent(updatedEvent);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return false;
      }

      setEvents((prev) =>
        prev.map((e) => (e.id === id ? updatedEvent : e))
      );
      setErrors([]);
      onEventUpdate?.(id, updates);
      return true;
    },
    [events, onEventUpdate]
  );

  const deleteEvent = useCallback(
    (id: string): boolean => {
      const event = events.find((e) => e.id === id);
      if (!event) {
        setErrors(['Event not found']);
        return false;
      }

      setEvents((prev) => prev.filter((e) => e.id !== id));
      setErrors([]);
      onEventDelete?.(id);
      return true;
    },
    [events, onEventDelete]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    events,
    errors,
    addEvent,
    updateEvent,
    deleteEvent,
    clearErrors,
  };
};

