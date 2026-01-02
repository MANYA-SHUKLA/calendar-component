import { useEffect, useCallback } from 'react';
import { CalendarView } from '@/components/Calendar/CalendarView.types';

export interface KeyboardShortcutsHandlers {
  onNewEvent: () => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onSwitchView: (view: CalendarView) => void;
  onGoToToday: () => void;
  onCloseModal?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onNewEvent,
  onNavigatePrevious,
  onNavigateNext,
  onSwitchView,
  onGoToToday,
  onCloseModal,
  enabled = true,
}: KeyboardShortcutsHandlers) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // N - New Event
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onNewEvent();
        return;
      }

      // Arrow keys - Navigate dates
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigatePrevious();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigateNext();
        return;
      }

      // M - Month view
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onSwitchView('month');
        return;
      }

      // W - Week view
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        onSwitchView('week');
        return;
      }

      // D - Day view
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        onSwitchView('day');
        return;
      }

      // A - Agenda view
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        onSwitchView('agenda');
        return;
      }

      // Y - Year view
      if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        onSwitchView('year');
        return;
      }

      // T - Today
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        onGoToToday();
        return;
      }

      // Escape - Close modals
      if (e.key === 'Escape' && onCloseModal) {
        e.preventDefault();
        onCloseModal();
        return;
      }
    },
    [enabled, onNewEvent, onNavigatePrevious, onNavigateNext, onSwitchView, onGoToToday, onCloseModal]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);
};

