/**
 * Calculates the number of days between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Number of days (can be negative if end is before start)
 */
export const daysBetween = (start: Date, end: Date): number => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startMs = start.getTime();
  const endMs = end.getTime();
  return Math.floor((endMs - startMs) / msPerDay);
};

/**
 * Checks if two dates fall on the same day (ignores time)
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Gets all days in a month
 */
export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysCount = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysCount }, (_, i) => new Date(year, month, i + 1));
};

/**
 * Gets the calendar grid (42 cells for month view)
 */
export const getCalendarGrid = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDay);
  
  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    grid.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }
  return grid;
};

/**
 * Checks if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

/**
 * Checks if a date is in the current month
 */
export const isCurrentMonth = (date: Date, currentDate: Date): boolean => {
  return (
    date.getFullYear() === currentDate.getFullYear() &&
    date.getMonth() === currentDate.getMonth()
  );
};

/**
 * Gets the start of the week for a given date
 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

/**
 * Gets all days in a week
 */
export const getWeekDays = (date: Date): Date[] => {
  const start = getWeekStart(date);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
};

/**
 * Formats date to readable string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats time to readable string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Gets time slots for a day (00:00 - 23:00)
 */
export const getTimeSlots = (intervalMinutes: number = 60): Date[] => {
  const slots: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const slot = new Date(today);
      slot.setHours(hour, minute, 0, 0);
      slots.push(slot);
    }
  }
  return slots;
};

/**
 * Checks if a date is within a date range (inclusive, ignores time)
 */
export const isDateInRange = (date: Date, range: { start: Date; end: Date }): boolean => {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  
  const rangeStart = new Date(range.start);
  rangeStart.setHours(0, 0, 0, 0);
  
  const rangeEnd = new Date(range.end);
  rangeEnd.setHours(0, 0, 0, 0);
  
  const dateTime = dateStart.getTime();
  const startTime = rangeStart.getTime();
  const endTime = rangeEnd.getTime();
  
  // Ensure start is before end
  const minTime = Math.min(startTime, endTime);
  const maxTime = Math.max(startTime, endTime);
  
  return dateTime >= minTime && dateTime <= maxTime;
};

/**
 * Gets events for a specific day
 */
export const getEventsForDay = <T extends { startDate: Date; endDate: Date }>(
  events: T[],
  date: Date
): T[] => {
  return events.filter((event) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return (
      (eventStart >= dayStart && eventStart <= dayEnd) ||
      (eventEnd >= dayStart && eventEnd <= dayEnd) ||
      (eventStart <= dayStart && eventEnd >= dayEnd)
    );
  });
};

