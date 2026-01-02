/**
 * Natural language parsing utilities for quick event creation
 * Parses inputs like "Meeting tomorrow 3–4pm" or "Lunch next Monday at noon"
 */

interface ParsedEvent {
  title: string;
  startDate?: Date;
  endDate?: Date;
  duration?: number; // in minutes
}

/**
 * Parses natural language event input
 * Examples:
 * - "Meeting tomorrow 3–4pm"
 * - "Lunch next Monday at noon"
 * - "Standup today at 9am"
 * - "Conference call in 2 hours"
 * - "Dinner tomorrow 7pm for 2 hours"
 */
export const parseNaturalLanguage = (input: string, referenceDate: Date = new Date()): ParsedEvent | null => {
  if (!input || input.trim().length === 0) {
    return null;
  }

  const text = input.trim();
  const now = new Date(referenceDate);

  // Extract title (everything before time/date keywords)
  let title = text;
  let startDate: Date | undefined;
  let endDate: Date | undefined;
  let duration: number | undefined;

  // Time patterns
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)/gi, // "3:30pm"
    /(\d{1,2})\s*(am|pm|AM|PM)/gi, // "3pm"
    /noon|midday/gi,
    /midnight/gi,
  ];

  // Date patterns
  const datePatterns = [
    /tomorrow/gi,
    /today/gi,
    /yesterday/gi,
    /next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month)/gi,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /in\s+(\d+)\s+(hour|hours|hr|hrs|day|days|week|weeks)/gi,
    /(\d+)\s+(hour|hours|hr|hrs|day|days|week|weeks)\s+from\s+now/gi,
  ];

  // Duration patterns
  const durationPatterns = [
    /for\s+(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs)/gi,
    /(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs)\s+long/gi,
    /(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})/gi, // "3:00-4:00"
    /(\d{1,2})\s*(am|pm|AM|PM)\s*[-–—]\s*(\d{1,2})\s*(am|pm|AM|PM)/gi, // "3pm-4pm"
  ];

  // Parse date
  let parsedDate = new Date(now);
  let dateFound = false;

  // Check for "tomorrow"
  if (/tomorrow/gi.test(text)) {
    parsedDate = new Date(now);
    parsedDate.setDate(parsedDate.getDate() + 1);
    dateFound = true;
    title = title.replace(/tomorrow/gi, '').trim();
  }
  // Check for "today"
  else if (/today/gi.test(text)) {
    parsedDate = new Date(now);
    dateFound = true;
    title = title.replace(/today/gi, '').trim();
  }
  // Check for "yesterday"
  else if (/yesterday/gi.test(text)) {
    parsedDate = new Date(now);
    parsedDate.setDate(parsedDate.getDate() - 1);
    dateFound = true;
    title = title.replace(/yesterday/gi, '').trim();
  }
  // Check for "next [day]"
  else {
    const nextDayMatch = text.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi);
    if (nextDayMatch) {
      const dayName = nextDayMatch[0].replace(/next\s+/gi, '').toLowerCase();
      parsedDate = getNextDayOfWeek(now, dayName);
      dateFound = true;
      title = title.replace(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '').trim();
    }
    // Check for day of week
    else {
      const dayMatch = text.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi);
      if (dayMatch) {
        const dayName = dayMatch[0].toLowerCase();
        parsedDate = getNextDayOfWeek(now, dayName);
        dateFound = true;
        title = title.replace(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '').trim();
      }
    }
  }

  // Check for "in X hours/days"
  const inTimeMatch = text.match(/in\s+(\d+)\s+(hour|hours|hr|hrs|day|days|week|weeks)/gi);
  if (inTimeMatch) {
    const match = inTimeMatch[0].match(/(\d+)\s+(hour|hours|hr|hrs|day|days|week|weeks)/i);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      parsedDate = new Date(now);
      if (unit.includes('hour')) {
        parsedDate.setHours(parsedDate.getHours() + amount);
      } else if (unit.includes('day')) {
        parsedDate.setDate(parsedDate.getDate() + amount);
      } else if (unit.includes('week')) {
        parsedDate.setDate(parsedDate.getDate() + amount * 7);
      }
      dateFound = true;
      title = title.replace(/in\s+(\d+)\s+(hour|hours|hr|hrs|day|days|week|weeks)/gi, '').trim();
    }
  }

  // Parse time
  let hour = now.getHours();
  let minute = now.getMinutes();

  // Check for time range "3:00-4:00" or "3pm-4pm"
  const timeRangeMatch = text.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?\s*[-–—]\s*(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/gi);
  if (timeRangeMatch) {
    const match = timeRangeMatch[0].match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?\s*[-–—]\s*(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/i);
    if (match) {
      const startHour = parseInt(match[1]);
      const startMin = match[2] ? parseInt(match[2]) : 0;
      const startPeriod = match[3]?.toLowerCase();
      const endHour = parseInt(match[4]);
      const endMin = match[5] ? parseInt(match[5]) : 0;
      const endPeriod = match[6]?.toLowerCase();

      hour = convertTo24Hour(startHour, startPeriod);
      minute = startMin;
      
      const endHour24 = convertTo24Hour(endHour, endPeriod);
      const endMinute = endMin;
      
      startDate = new Date(parsedDate);
      startDate.setHours(hour, minute, 0, 0);
      
      endDate = new Date(parsedDate);
      endDate.setHours(endHour24, endMinute, 0, 0);
      
      // If end time is before start time, assume next day
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      title = title.replace(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?\s*[-–—]\s*(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/gi, '').trim();
    }
  }
  // Check for single time
  else {
    const timeMatch = text.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/gi);
    if (timeMatch) {
      const match = timeMatch[0].match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/i);
      if (match) {
        hour = convertTo24Hour(parseInt(match[1]), match[3]?.toLowerCase());
        minute = match[2] ? parseInt(match[2]) : 0;
        startDate = new Date(parsedDate);
        startDate.setHours(hour, minute, 0, 0);
        title = title.replace(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/gi, '').trim();
      }
    }
    // Check for "noon" or "midday"
    else if (/noon|midday/gi.test(text)) {
      hour = 12;
      minute = 0;
      startDate = new Date(parsedDate);
      startDate.setHours(hour, minute, 0, 0);
      title = title.replace(/noon|midday/gi, '').trim();
    }
    // Check for "midnight"
    else if (/midnight/gi.test(text)) {
      hour = 0;
      minute = 0;
      startDate = new Date(parsedDate);
      startDate.setHours(hour, minute, 0, 0);
      title = title.replace(/midnight/gi, '').trim();
    }
    // Check for "at [time]"
    else {
      const atTimeMatch = text.match(/at\s+(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/gi);
      if (atTimeMatch) {
        const match = atTimeMatch[0].match(/at\s+(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/i);
        if (match) {
          hour = convertTo24Hour(parseInt(match[1]), match[3]?.toLowerCase());
          minute = match[2] ? parseInt(match[2]) : 0;
          startDate = new Date(parsedDate);
          startDate.setHours(hour, minute, 0, 0);
          title = title.replace(/at\s+(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/gi, '').trim();
        }
      }
    }
  }

  // Parse duration
  const durationMatch = text.match(/for\s+(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs)/gi);
  if (durationMatch) {
    const match = durationMatch[0].match(/for\s+(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs)/i);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.includes('hour')) {
        duration = amount * 60;
      } else {
        duration = amount;
      }
      title = title.replace(/for\s+(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs)/gi, '').trim();
    }
  }

  // Set default duration if start time but no end time
  if (startDate && !endDate) {
    endDate = new Date(startDate);
    if (duration) {
      endDate.setMinutes(endDate.getMinutes() + duration);
    } else {
      endDate.setHours(endDate.getHours() + 1); // Default 1 hour
    }
  }

  // Clean up title (remove extra spaces, "at", etc.)
  title = title
    .replace(/\s+/g, ' ')
    .replace(/^\s*(at|on|for|in)\s+/gi, '')
    .replace(/\s*(at|on|for|in)\s*$/gi, '')
    .trim();

  if (!title) {
    return null;
  }

  return {
    title,
    startDate,
    endDate,
    duration,
  };
}

/**
 * Converts 12-hour time to 24-hour format
 */
function convertTo24Hour(hour: number, period?: string): number {
  if (!period) {
    return hour; // Assume 24-hour if no period
  }
  const isPM = period === 'pm';
  if (isPM && hour !== 12) {
    return hour + 12;
  }
  if (!isPM && hour === 12) {
    return 0;
  }
  return hour;
}

/**
 * Gets the next occurrence of a day of the week
 */
function getNextDayOfWeek(date: Date, dayName: string): Date {
  const days: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const targetDay = days[dayName.toLowerCase()];
  if (targetDay === undefined) {
    return new Date(date);
  }

  const result = new Date(date);
  const currentDay = result.getDay();
  let daysToAdd = targetDay - currentDay;

  if (daysToAdd <= 0) {
    daysToAdd += 7; // Next week
  }

  result.setDate(result.getDate() + daysToAdd);
  return result;
}

