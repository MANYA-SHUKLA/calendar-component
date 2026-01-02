'use client';

import React, { useMemo } from 'react';
import { findFocusTimeSlots, FocusTimeSlot } from '@/utils/analytics.utils';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { formatTime } from '@/utils/date.utils';
import clsx from 'clsx';

export interface FocusTimeHighlightProps {
  events: CalendarEvent[];
  date: Date;
  minDuration?: number; // in minutes, default 90
  onTimeSlotClick?: (start: Date, end: Date) => void;
}

export const FocusTimeHighlight: React.FC<FocusTimeHighlightProps> = ({
  events,
  date,
  minDuration = 90,
  onTimeSlotClick,
}) => {
  const focusSlots = useMemo(() => {
    return findFocusTimeSlots(events, date, minDuration);
  }, [events, date, minDuration]);

  if (focusSlots.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-white mb-4">Focus Time</h3>
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
          <p className="text-neutral-400 text-sm">
            No focus time slots available (minimum {minDuration} minutes of uninterrupted time)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-white mb-4">
        Focus Time Available
        <span className="ml-2 text-sm text-neutral-400 font-normal">
          ({focusSlots.length} slot{focusSlots.length !== 1 ? 's' : ''})
        </span>
      </h3>
      <div className="space-y-2">
        {focusSlots.map((slot, index) => (
          <button
            key={index}
            onClick={() => onTimeSlotClick?.(slot.start, slot.end)}
            className={clsx(
              'w-full p-3 rounded-lg border transition-all duration-200',
              'hover:scale-[1.02] hover:shadow-lg text-left',
              'bg-primary-500/10 border-primary-500/30 hover:bg-primary-500/20'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">
                  {formatTime(slot.start)} - {formatTime(slot.end)}
                </div>
                <div className="text-sm text-primary-400 mt-1">
                  {slot.hours} hours of uninterrupted time
                </div>
              </div>
              <div className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-sm font-medium">
                {slot.duration} min
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

