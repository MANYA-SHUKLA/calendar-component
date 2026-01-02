import { CalendarEvent, RecurrenceRule } from '@/components/Calendar/CalendarView.types';
import { eventsOverlap } from './event.utils';

/**
 * Detects conflicts with existing events
 */
export const detectConflicts = (
  event: Partial<CalendarEvent>,
  existingEvents: CalendarEvent[],
  excludeEventId?: string
): CalendarEvent[] => {
  if (!event.startDate || !event.endDate) {
    return [];
  }

  const tempEvent: CalendarEvent = {
    id: excludeEventId || 'temp',
    title: event.title || '',
    startDate: event.startDate,
    endDate: event.endDate,
    color: event.color,
    category: event.category,
  };

  return existingEvents.filter((existing) => {
    if (existing.id === excludeEventId) {
      return false;
    }
    return eventsOverlap(tempEvent, existing);
  });
};

/**
 * Suggests duration in minutes based on event title
 */
export const suggestDuration = (title: string): number | null => {
  if (!title) return null;

  const lowerTitle = title.toLowerCase();

  // Meeting patterns
  if (lowerTitle.includes('meeting') || lowerTitle.includes('sync')) {
    if (lowerTitle.includes('standup') || lowerTitle.includes('daily')) {
      return 15;
    }
    if (lowerTitle.includes('quick') || lowerTitle.includes('brief')) {
      return 15;
    }
    if (lowerTitle.includes('1:1') || lowerTitle.includes('one-on-one')) {
      return 30;
    }
    return 60; // Default meeting
  }

  // Work sessions
  if (lowerTitle.includes('focus') || lowerTitle.includes('deep work')) {
    return 90;
  }
  if (lowerTitle.includes('work session') || lowerTitle.includes('coding')) {
    return 120;
  }

  // Breaks
  if (lowerTitle.includes('break') || lowerTitle.includes('lunch')) {
    return 30;
  }
  if (lowerTitle.includes('coffee')) {
    return 15;
  }

  // Calls
  if (lowerTitle.includes('call') || lowerTitle.includes('phone')) {
    return 30;
  }

  // Reviews
  if (lowerTitle.includes('review') || lowerTitle.includes('retro')) {
    return 60;
  }

  // Interviews
  if (lowerTitle.includes('interview')) {
    return 60;
  }

  // Default suggestion
  return 30;
};

/**
 * Generates recurring event instances based on a recurrence rule
 */
export const generateRecurringInstances = (
  baseEvent: CalendarEvent,
  rule: RecurrenceRule,
  maxDate?: Date
): CalendarEvent[] => {
  if (!baseEvent.recurrence) {
    return [baseEvent];
  }

  const instances: CalendarEvent[] = [];
  const max = maxDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year default
  let currentDate = new Date(baseEvent.startDate);
  let currentEndDate = new Date(baseEvent.endDate);
  let count = 0;
  const maxCount = rule.count || 1000; // Default max occurrences

  const duration = currentEndDate.getTime() - currentDate.getTime();

  while (currentDate <= max && count < maxCount) {
    // Check end date constraint
    if (rule.endDate && currentDate > rule.endDate) {
      break;
    }

    // Create instance
    const instance: CalendarEvent = {
      ...baseEvent,
      id: `${baseEvent.id}-${count}`,
      startDate: new Date(currentDate),
      endDate: new Date(currentEndDate),
    };
    instances.push(instance);

    // Calculate next occurrence
    switch (rule.frequency) {
      case 'daily': {
        const interval = rule.interval || 1;
        currentDate.setDate(currentDate.getDate() + interval);
        currentEndDate = new Date(currentDate.getTime() + duration);
        break;
      }
      case 'weekly': {
        const interval = rule.interval || 1;
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          // Find next matching day of week
          let daysToAdd = interval * 7;
          const currentDay = currentDate.getDay();
          const nextDay = rule.daysOfWeek.find((d) => d > currentDay) || rule.daysOfWeek[0];
          if (nextDay > currentDay) {
            daysToAdd = nextDay - currentDay;
          } else {
            daysToAdd = 7 - currentDay + nextDay;
          }
          currentDate.setDate(currentDate.getDate() + daysToAdd);
        } else {
          currentDate.setDate(currentDate.getDate() + interval * 7);
        }
        currentEndDate = new Date(currentDate.getTime() + duration);
        break;
      }
      case 'monthly': {
        const interval = rule.interval || 1;
        if (rule.dayOfMonth) {
          currentDate.setMonth(currentDate.getMonth() + interval);
          currentDate.setDate(rule.dayOfMonth);
        } else {
          currentDate.setMonth(currentDate.getMonth() + interval);
        }
        currentEndDate = new Date(currentDate.getTime() + duration);
        break;
      }
      case 'yearly': {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        currentEndDate = new Date(currentDate.getTime() + duration);
        break;
      }
      default:
        break;
    }

    count++;
  }

  return instances;
};

/**
 * Expands recurring events into individual instances for display
 */
export const expandRecurringEvents = (
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] => {
  const expanded: CalendarEvent[] = [];

  events.forEach((event) => {
    if (event.recurrence) {
      const instances = generateRecurringInstances(event, event.recurrence, endDate);
      // Filter instances that fall within the date range
      const filtered = instances.filter((instance) => {
        return instance.startDate >= startDate && instance.startDate <= endDate;
      });
      expanded.push(...filtered);
    } else {
      expanded.push(event);
    }
  });

  return expanded;
};

/**
 * Event template interface
 */
export interface EventTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  color?: string;
  category?: string;
  recurrence?: RecurrenceRule;
}

/**
 * Loads templates from localStorage
 */
export const loadTemplates = (): EventTemplate[] => {
  if (typeof window === 'undefined') {
    return getDefaultTemplates();
  }
  try {
    const stored = localStorage.getItem('calendar-templates');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load templates from localStorage:', error);
  }
  return getDefaultTemplates();
};

/**
 * Saves templates to localStorage
 */
export const saveTemplates = (templates: EventTemplate[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem('calendar-templates', JSON.stringify(templates));
  } catch (error) {
    console.warn('Failed to save templates to localStorage:', error);
  }
};

/**
 * Gets default templates
 */
export const getDefaultTemplates = (): EventTemplate[] => {
  return [
    {
      id: 'template-meeting',
      name: 'Team Meeting',
      title: 'Team Meeting',
      duration: 60,
      color: '#3b82f6',
      category: 'Meeting',
    },
    {
      id: 'template-standup',
      name: 'Daily Standup',
      title: 'Daily Standup',
      duration: 15,
      color: '#10b981',
      category: 'Meeting',
      recurrence: {
        frequency: 'daily',
        interval: 1,
      },
    },
    {
      id: 'template-1on1',
      name: '1:1 Meeting',
      title: '1:1 Meeting',
      duration: 30,
      color: '#8b5cf6',
      category: 'Meeting',
    },
    {
      id: 'template-focus',
      name: 'Focus Time',
      title: 'Focus Time',
      duration: 90,
      color: '#f59e0b',
      category: 'Work',
    },
    {
      id: 'template-lunch',
      name: 'Lunch Break',
      title: 'Lunch Break',
      duration: 30,
      color: '#ec4899',
      category: 'Personal',
    },
  ];
};

/**
 * Applies a template to create an event
 */
export const applyTemplate = (
  template: EventTemplate,
  startDate: Date
): Partial<CalendarEvent> => {
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + template.duration);

  return {
    title: template.title,
    description: template.description,
    startDate,
    endDate,
    color: template.color,
    category: template.category,
    recurrence: template.recurrence,
    templateId: template.id,
  };
};

