'use client';

import React, { useState, useMemo } from 'react';
import { CategoryTimeChart } from './CategoryTimeChart';
import { WeeklyLoadIndicator } from './WeeklyLoadIndicator';
import { FocusTimeHighlight } from './FocusTimeHighlight';
import { EventDensityHeatmap } from './EventDensityHeatmap';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { getWeekStart } from '@/utils/date.utils';
import clsx from 'clsx';

export interface AnalyticsPanelProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDateClick?: (date: Date) => void;
  onTimeSlotClick?: (start: Date, end: Date) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  events,
  currentDate,
  onDateClick,
  onTimeSlotClick,
  isOpen = false,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'focus' | 'density'>('overview');

  const weekStart = useMemo(() => {
    return getWeekStart(currentDate);
  }, [currentDate]);

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  const monthStart = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-xl border border-neutral-700 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
            Analytics & Insights
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-700 bg-neutral-800/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={clsx(
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'overview'
                ? 'text-white border-b-2 border-primary-500 bg-neutral-900/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            className={clsx(
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'focus'
                ? 'text-white border-b-2 border-primary-500 bg-neutral-900/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            )}
          >
            Focus Time
          </button>
          <button
            onClick={() => setActiveTab('density')}
            className={clsx(
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'density'
                ? 'text-white border-b-2 border-primary-500 bg-neutral-900/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            )}
          >
            Density
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700/50">
                <CategoryTimeChart events={events} startDate={weekStart} endDate={weekEnd} />
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700/50">
                <WeeklyLoadIndicator events={events} currentDate={currentDate} />
              </div>
            </div>
          )}

          {activeTab === 'focus' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700/50">
                <FocusTimeHighlight
                  events={events}
                  date={currentDate}
                  onTimeSlotClick={onTimeSlotClick}
                />
              </div>
            </div>
          )}

          {activeTab === 'density' && (
            <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700/50">
              <EventDensityHeatmap
                events={events}
                startDate={monthStart}
                endDate={monthEnd}
                onDateClick={onDateClick}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

