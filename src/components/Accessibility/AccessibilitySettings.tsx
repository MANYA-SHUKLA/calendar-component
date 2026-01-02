'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../primitives/Modal';
import clsx from 'clsx';

export interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHighContrast = localStorage.getItem('high-contrast') === 'true';
      const savedReducedMotion = localStorage.getItem('reduced-motion') === 'true';
      setHighContrast(savedHighContrast);
      setReducedMotion(savedReducedMotion);
      applySettings(savedHighContrast, savedReducedMotion);
    }
  }, []);

  const applySettings = (highContrast: boolean, reducedMotion: boolean) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  };

  const handleHighContrastChange = (enabled: boolean) => {
    setHighContrast(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('high-contrast', enabled.toString());
      applySettings(enabled, reducedMotion);
    }
  };

  const handleReducedMotionChange = (enabled: boolean) => {
    setReducedMotion(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('reduced-motion', enabled.toString());
      applySettings(highContrast, enabled);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Accessibility Settings"
      description="Customize your calendar experience"
      size="md"
    >
      <div className="space-y-6">
        {/* High Contrast Mode */}
        <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/40">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-1">
                High Contrast Mode
              </label>
              <p className="text-xs text-neutral-400">
                Increases contrast for better visibility
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleHighContrastChange(!highContrast)}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                highContrast ? 'bg-primary-500' : 'bg-neutral-600'
              )}
              aria-label="Toggle high contrast mode"
              aria-pressed={highContrast}
            >
              <span
                className={clsx(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        {/* Reduced Motion Mode */}
        <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/40">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-1">
                Reduced Motion
              </label>
              <p className="text-xs text-neutral-400">
                Reduces animations and transitions
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleReducedMotionChange(!reducedMotion)}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                reducedMotion ? 'bg-primary-500' : 'bg-neutral-600'
              )}
              aria-label="Toggle reduced motion"
              aria-pressed={reducedMotion}
            >
              <span
                className={clsx(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  reducedMotion ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/40">
          <h3 className="text-sm font-medium text-neutral-200 mb-3">Keyboard Shortcuts</h3>
          <div className="space-y-2 text-xs text-neutral-400">
            <div className="flex justify-between">
              <span>New Event</span>
              <kbd className="px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">N</kbd>
            </div>
            <div className="flex justify-between">
              <span>Navigate Previous</span>
              <kbd className="px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">←</kbd>
            </div>
            <div className="flex justify-between">
              <span>Navigate Next</span>
              <kbd className="px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">→</kbd>
            </div>
            <div className="flex justify-between">
              <span>Month View</span>
              <kbd className="px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">M</kbd>
            </div>
            <div className="flex justify-between">
              <span>Week View</span>
              <kbd className="px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">W</kbd>
            </div>
            <div className="flex justify-between">
              <span>Day View</span>
              <kbd className="px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">D</kbd>
            </div>
            <div className="flex justify-between">
              <span>Agenda View</span>
              <kbd className="px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">A</kbd>
            </div>
            <div className="flex justify-between">
              <span>Year View</span>
              <kbd className="px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">Y</kbd>
            </div>
            <div className="flex justify-between">
              <span>Go to Today</span>
              <kbd className="px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">T</kbd>
            </div>
            <div className="flex justify-between">
              <span>Close Modal</span>
              <kbd className="px-2 py-0.5 bg-neutral-700 rounded text-neutral-300">Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

