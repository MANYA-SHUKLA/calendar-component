import { useState, useCallback } from 'react';
import { CalendarState, CalendarView } from '@/components/Calendar/CalendarView.types';

export const useCalendar = (initialDate: Date = new Date(), initialView: CalendarView = 'month') => {
  const [state, setState] = useState<CalendarState>({
    currentDate: initialDate,
    view: initialView,
    selectedDate: null,
    selectedDateRange: null,
    focusedDate: initialDate,
  });

  const goToNextMonth = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentDate: new Date(
        prev.currentDate.getFullYear(),
        prev.currentDate.getMonth() + 1,
        1
      ),
    }));
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentDate: new Date(
        prev.currentDate.getFullYear(),
        prev.currentDate.getMonth() - 1,
        1
      ),
    }));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setState((prev) => ({
      ...prev,
      currentDate: today,
      focusedDate: today,
    }));
  }, []);

  const goToDate = useCallback((date: Date) => {
    setState((prev) => ({
      ...prev,
      currentDate: date,
      focusedDate: date,
    }));
  }, []);

  const setView = useCallback((view: CalendarView) => {
    setState((prev) => ({
      ...prev,
      view,
    }));
  }, []);

  const setSelectedDate = useCallback((date: Date | null) => {
    setState((prev) => ({
      ...prev,
      selectedDate: date,
      selectedDateRange: null,
    }));
  }, []);

  const setSelectedDateRange = useCallback((range: { start: Date; end: Date } | null) => {
    setState((prev) => ({
      ...prev,
      selectedDateRange: range,
      selectedDate: null,
    }));
  }, []);

  const setFocusedDate = useCallback((date: Date | null) => {
    setState((prev) => ({
      ...prev,
      focusedDate: date,
    }));
  }, []);

  const goToNextWeek = useCallback(() => {
    setState((prev) => {
      const nextWeek = new Date(prev.currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return {
        ...prev,
        currentDate: nextWeek,
      };
    });
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setState((prev) => {
      const prevWeek = new Date(prev.currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      return {
        ...prev,
        currentDate: prevWeek,
      };
    });
  }, []);

  return {
    ...state,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    goToDate,
    setView,
    setSelectedDate,
    setSelectedDateRange,
    setFocusedDate,
    goToNextWeek,
    goToPreviousWeek,
  };
};

