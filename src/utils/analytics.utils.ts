import { CalendarEvent } from '@/components/Calendar/CalendarView.types';

/**
 * Calculates time spent per category
 */
export interface CategoryTime {
  category: string;
  minutes: number;
  hours: number;
  percentage: number;
  color?: string;
}

export const calculateTimeByCategory = (
  events: CalendarEvent[],
  startDate?: Date,
  endDate?: Date
): CategoryTime[] => {
  const categoryMap = new Map<string, { minutes: number; color?: string }>();

  events.forEach((event) => {
    // Filter by date range if provided
    if (startDate && event.endDate < startDate) return;
    if (endDate && event.startDate > endDate) return;

    const duration = (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60); // minutes
    const category = event.category || 'Uncategorized';

    const existing = categoryMap.get(category) || { minutes: 0, color: event.color };
    categoryMap.set(category, {
      minutes: existing.minutes + duration,
      color: existing.color || event.color,
    });
  });

  const totalMinutes = Array.from(categoryMap.values()).reduce(
    (sum, item) => sum + item.minutes,
    0
  );

  const result: CategoryTime[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      minutes: Math.round(data.minutes),
      hours: Math.round((data.minutes / 60) * 10) / 10,
      percentage: totalMinutes > 0 ? (data.minutes / totalMinutes) * 100 : 0,
      color: data.color,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  return result;
};

/**
 * Calculates weekly load (hours per day)
 */
export interface WeeklyLoad {
  date: Date;
  hours: number;
  eventCount: number;
  isOverbooked: boolean;
}

export const calculateWeeklyLoad = (
  events: CalendarEvent[],
  weekStart: Date
): WeeklyLoad[] => {
  const weekDays: WeeklyLoad[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEvents = events.filter((event) => {
      return (
        event.startDate >= date &&
        event.startDate <= dayEnd &&
        event.endDate >= date &&
        event.endDate <= dayEnd
      );
    });

    let totalMinutes = 0;
    dayEvents.forEach((event) => {
      const start = Math.max(event.startDate.getTime(), date.getTime());
      const end = Math.min(event.endDate.getTime(), dayEnd.getTime());
      totalMinutes += (end - start) / (1000 * 60);
    });

    const hours = totalMinutes / 60;
    const isOverbooked = hours > 8; // More than 8 hours is considered overbooked

    weekDays.push({
      date,
      hours: Math.round((hours * 10) / 10),
      eventCount: dayEvents.length,
      isOverbooked,
    });
  }

  return weekDays;
};

/**
 * Finds focus time slots (long uninterrupted free periods)
 */
export interface FocusTimeSlot {
  start: Date;
  end: Date;
  duration: number; // in minutes
  hours: number;
}

export const findFocusTimeSlots = (
  events: CalendarEvent[],
  date: Date,
  minDuration: number = 90 // minimum 90 minutes for focus time
): FocusTimeSlot[] => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Get all events for the day, sorted by start time
  const dayEvents = events
    .filter((event) => {
      return (
        (event.startDate >= dayStart && event.startDate <= dayEnd) ||
        (event.endDate >= dayStart && event.endDate <= dayEnd) ||
        (event.startDate <= dayStart && event.endDate >= dayEnd)
      );
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const freeSlots: FocusTimeSlot[] = [];
  let currentTime = new Date(dayStart);

  dayEvents.forEach((event) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);

    // If there's a gap before this event
    if (eventStart > currentTime) {
      const duration = (eventStart.getTime() - currentTime.getTime()) / (1000 * 60);
      if (duration >= minDuration) {
        freeSlots.push({
          start: new Date(currentTime),
          end: new Date(eventStart),
          duration: Math.round(duration),
          hours: Math.round((duration / 60) * 10) / 10,
        });
      }
    }

    // Update current time to after this event
    if (eventEnd > currentTime) {
      currentTime = new Date(eventEnd);
    }
  });

  // Check for free time after last event
  if (currentTime < dayEnd) {
    const duration = (dayEnd.getTime() - currentTime.getTime()) / (1000 * 60);
    if (duration >= minDuration) {
      freeSlots.push({
        start: new Date(currentTime),
        end: new Date(dayEnd),
        duration: Math.round(duration),
        hours: Math.round((duration / 60) * 10) / 10,
      });
    }
  }

  return freeSlots;
};

/**
 * Calculates event density for heatmap
 */
export interface EventDensity {
  date: Date;
  eventCount: number;
  hours: number;
  intensity: number; // 0-4 scale
}

export const calculateEventDensity = (
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): EventDensity[] => {
  const densityMap = new Map<string, { eventCount: number; hours: number }>();

  events.forEach((event) => {
    // Get all dates this event spans
    const eventStart = new Date(event.startDate);
    eventStart.setHours(0, 0, 0, 0);
    const eventEnd = new Date(event.endDate);
    eventEnd.setHours(0, 0, 0, 0);

    const currentDate = new Date(eventStart);
    while (currentDate <= eventEnd && currentDate <= endDate && currentDate >= startDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const existing = densityMap.get(dateKey) || { eventCount: 0, hours: 0 };

      // Calculate hours for this day
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const eventStartTime = new Date(Math.max(event.startDate.getTime(), dayStart.getTime()));
      const eventEndTime = new Date(Math.min(event.endDate.getTime(), dayEnd.getTime()));
      const hours = (eventEndTime.getTime() - eventStartTime.getTime()) / (1000 * 60 * 60);

      densityMap.set(dateKey, {
        eventCount: existing.eventCount + 1,
        hours: existing.hours + hours,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // Convert to array and calculate intensity
  const allHours = Array.from(densityMap.values()).map((d) => d.hours);
  const maxHours = Math.max(...allHours, 1);

  const result: EventDensity[] = Array.from(densityMap.entries()).map(([dateKey, data]) => {
    const intensity = Math.min(4, Math.floor((data.hours / maxHours) * 4));
    return {
      date: new Date(dateKey),
      eventCount: data.eventCount,
      hours: Math.round((data.hours * 10) / 10),
      intensity,
    };
  });

  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
};

