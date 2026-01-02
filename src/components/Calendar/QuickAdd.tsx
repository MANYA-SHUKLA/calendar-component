import React, { useState, useCallback, useRef, useEffect } from 'react';
import { parseNaturalLanguage } from '@/utils/natural-language.utils';
import { CalendarEvent } from './CalendarView.types';
import clsx from 'clsx';

export interface QuickAddProps {
  onAdd: (event: Partial<CalendarEvent>) => void;
  placeholder?: string;
}

export const QuickAdd: React.FC<QuickAddProps> = ({
  onAdd,
  placeholder = "Quick add event (e.g., 'Meeting tomorrow 3–4pm')",
}) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = parseNaturalLanguage(input, new Date());
    if (parsed && parsed.title) {
      onAdd({
        title: parsed.title,
        startDate: parsed.startDate || new Date(),
        endDate: parsed.endDate || new Date(Date.now() + 60 * 60 * 1000),
      });
      setInput('');
      inputRef.current?.blur();
    }
  }, [input, onAdd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setInput('');
      inputRef.current?.blur();
    }
  }, []);

  // Focus on '/' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !isFocused && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFocused]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={clsx(
            "w-full px-4 py-2.5 pr-10 rounded-lg border transition-all duration-200",
            "bg-neutral-800/80 text-neutral-100 placeholder-neutral-500",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            "border-neutral-600 hover:border-neutral-500",
            isFocused && "bg-neutral-800 shadow-lg shadow-primary-500/20"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {!isFocused && (
            <kbd className="px-2 py-0.5 text-xs font-semibold text-neutral-400 bg-neutral-700/50 border border-neutral-600 rounded">
              /
            </kbd>
          )}
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
              aria-label="Clear input"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {isFocused && input && (
        <div className="mt-2 text-xs text-neutral-400 px-1">
          Press Enter to add, Esc to cancel
        </div>
      )}
    </form>
  );
};

