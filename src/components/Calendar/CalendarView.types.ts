export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval?: number; // e.g., every 2 weeks
  endDate?: Date; // End date for recurrence
  count?: number; // Number of occurrences
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc. (for weekly)
  dayOfMonth?: number; // For monthly (1-31)
  weekOfMonth?: number; // For monthly (1-5, -1 for last)
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  color?: string;
  category?: string;
  recurrence?: RecurrenceRule;
  templateId?: string; // Reference to template if created from one
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  onEventAdd: (event: CalendarEvent) => void;
  onEventUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  onEventDelete: (id: string) => void;
  initialView?: 'month' | 'week';
  initialDate?: Date;
}

export type CalendarView = 'month' | 'week';

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedDate: Date | null;
  selectedDateRange: { start: Date; end: Date } | null;
  focusedDate: Date | null;
}

