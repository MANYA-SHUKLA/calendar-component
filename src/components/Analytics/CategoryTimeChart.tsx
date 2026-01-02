'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryTime } from '@/utils/analytics.utils';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';

export interface CategoryTimeChartProps {
  events: CalendarEvent[];
  startDate?: Date;
  endDate?: Date;
}

const COLORS = ['#0066cc', '#00b8e6', '#00d4ff', '#3b82f6', '#60a5fa', '#93c5fd', '#cbd5e1'];

export const CategoryTimeChart: React.FC<CategoryTimeChartProps> = ({
  events,
  startDate,
  endDate,
}) => {
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, { minutes: number; color?: string }>();

    events.forEach((event) => {
      if (startDate && event.endDate < startDate) return;
      if (endDate && event.startDate > endDate) return;

      const duration = (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60);
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

    return Array.from(categoryMap.entries())
      .map(([category, data], index) => ({
        name: category,
        value: Math.round(data.minutes),
        hours: Math.round((data.minutes / 60) * 10) / 10,
        percentage: totalMinutes > 0 ? Math.round((data.minutes / totalMinutes) * 100) : 0,
        color: data.color || COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [events, startDate, endDate]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-primary-400">{data.hours} hours</p>
          <p className="text-neutral-400 text-sm">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        <p>No events to analyze</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-white mb-4">Time Spent by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value, entry: any) => (
              <span className="text-neutral-300">
                {value}: {entry.payload.hours}h ({entry.payload.percentage}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

