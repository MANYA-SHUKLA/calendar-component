'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { calculateWeeklyLoad, WeeklyLoad } from '@/utils/analytics.utils';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { getWeekStart } from '@/utils/date.utils';
import clsx from 'clsx';

export interface WeeklyLoadIndicatorProps {
  events: CalendarEvent[];
  currentDate: Date;
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeeklyLoadIndicator: React.FC<WeeklyLoadIndicatorProps> = ({
  events,
  currentDate,
}) => {
  const weeklyData = useMemo(() => {
    const weekStart = getWeekStart(currentDate);
    return calculateWeeklyLoad(events, weekStart);
  }, [events, currentDate]);

  const isOverbooked = useMemo(() => {
    return weeklyData.some((day) => day.isOverbooked);
  }, [weeklyData]);

  const totalHours = useMemo(() => {
    return weeklyData.reduce((sum, day) => sum + day.hours, 0);
  }, [weeklyData]);

  const chartData = weeklyData.map((day, index) => ({
    day: weekDays[index],
    hours: day.hours,
    isOverbooked: day.isOverbooked,
    eventCount: day.eventCount,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.day}</p>
          <p className="text-primary-400">{data.hours} hours</p>
          <p className="text-neutral-400 text-sm">{data.eventCount} events</p>
          {data.isOverbooked && (
            <p className="text-warning-500 text-sm font-medium mt-1">⚠️ Overbooked</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Weekly Load</h3>
        {isOverbooked && (
          <div className="flex items-center gap-2 px-3 py-1 bg-warning-500/20 border border-warning-500/50 rounded-lg">
            <span className="text-warning-500 text-lg">⚠️</span>
            <span className="text-warning-400 text-sm font-medium">Overbooked Week</span>
          </div>
        )}
      </div>
      <div className="mb-2 text-sm text-neutral-400">
        Total: <span className="text-white font-semibold">{totalHours.toFixed(1)} hours</span> this week
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="day" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isOverbooked ? '#f59e0b' : entry.hours > 6 ? '#3b82f6' : '#0066cc'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-neutral-500">
        * Days with more than 8 hours are considered overbooked
      </div>
    </div>
  );
};

