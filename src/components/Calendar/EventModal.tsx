import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarEvent, RecurrenceRule } from './CalendarView.types';
import { Modal } from '../primitives/Modal';
import { Button } from '../primitives/Button';
import { Select } from '../primitives/Select';
import { formatDate, formatTime } from '@/utils/date.utils';
import { detectConflicts, suggestDuration } from '@/utils/smart-calendar.utils';
import { loadTemplates, applyTemplate, EventTemplate } from '@/utils/smart-calendar.utils';

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
  initialEndDate?: Date;
  existingEvents?: CalendarEvent[];
  onSave: (event: Partial<CalendarEvent>) => boolean;
  onDelete?: (id: string) => void;
  validationErrors?: string[];
}

const colorOptions = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' },
];

const categoryOptions = [
  { value: '', label: 'None' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Work', label: 'Work' },
  { value: 'Personal', label: 'Personal' },
  { value: 'Design', label: 'Design' },
  { value: 'Development', label: 'Development' },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  initialDate,
  initialEndDate,
  existingEvents = [],
  onSave,
  onDelete,
  validationErrors = [],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceRule>({
    frequency: 'weekly',
    interval: 1,
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templates] = useState<EventTemplate[]>(() => loadTemplates());

  // Auto-duration suggestion when title changes
  useEffect(() => {
    if (!event && title && !initialEndDate) {
      const suggestedDuration = suggestDuration(title);
      if (suggestedDuration && startDate && startTime) {
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + suggestedDuration);
        setEndDate(end.toISOString().split('T')[0]);
        setEndTime(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
      }
    }
  }, [title, startDate, startTime, event, initialEndDate]);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Edit mode
        setTitle(event.title);
        setDescription(event.description || '');
        setStartDate(event.startDate.toISOString().split('T')[0]);
        setStartTime(event.startDate.toTimeString().slice(0, 5));
        setEndDate(event.endDate.toISOString().split('T')[0]);
        setEndTime(event.endDate.toTimeString().slice(0, 5));
        setColor(event.color || '#3b82f6');
        setCategory(event.category || '');
        setRecurrenceEnabled(!!event.recurrence);
        setRecurrence(event.recurrence || { frequency: 'weekly', interval: 1 });
        setSelectedTemplate('');
      } else if (initialDate) {
        // Create mode with initial date (and optional end date from drag)
        const date = new Date(initialDate);
        const endDate = initialEndDate ? new Date(initialEndDate) : new Date(date);
        if (!initialEndDate) {
          endDate.setHours(endDate.getHours() + 1);
        }
        
        setStartDate(date.toISOString().split('T')[0]);
        setEndDate(endDate.toISOString().split('T')[0]);
        const hour = date.getHours();
        const minute = date.getMinutes();
        setStartTime(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
        const endHour = endDate.getHours();
        const endMinute = endDate.getMinutes();
        setEndTime(`${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`);
        setTitle('');
        setDescription('');
        setColor('#3b82f6');
        setCategory('');
        setRecurrenceEnabled(false);
        setRecurrence({ frequency: 'weekly', interval: 1 });
        setSelectedTemplate('');
      } else {
        // Create mode without initial date
        const now = new Date();
        setStartDate(now.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);
        setStartTime(now.toTimeString().slice(0, 5));
        const endTimeDate = new Date(now);
        endTimeDate.setHours(endTimeDate.getHours() + 1);
        setEndTime(endTimeDate.toTimeString().slice(0, 5));
        setTitle('');
        setDescription('');
        setColor('#3b82f6');
        setCategory('');
      setRecurrenceEnabled(false);
      setRecurrence({ frequency: 'weekly', interval: 1 });
      setSelectedTemplate('');
      }
      setErrors([]);
    }
  }, [isOpen, event, initialDate, initialEndDate]);

  // Sync validation errors from props
  useEffect(() => {
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    }
  }, [validationErrors]);

  // Apply template when selected
  useEffect(() => {
    if (selectedTemplate && !event && initialDate) {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        const date = new Date(initialDate);
        const eventData = applyTemplate(template, date);
        if (eventData.title) setTitle(eventData.title);
        if (eventData.description) setDescription(eventData.description);
        if (eventData.startDate) {
          setStartDate(eventData.startDate.toISOString().split('T')[0]);
          setStartTime(`${String(eventData.startDate.getHours()).padStart(2, '0')}:${String(eventData.startDate.getMinutes()).padStart(2, '0')}`);
        }
        if (eventData.endDate) {
          setEndDate(eventData.endDate.toISOString().split('T')[0]);
          setEndTime(`${String(eventData.endDate.getHours()).padStart(2, '0')}:${String(eventData.endDate.getMinutes()).padStart(2, '0')}`);
        }
        if (eventData.color) setColor(eventData.color);
        if (eventData.category) setCategory(eventData.category);
        if (eventData.recurrence) {
          setRecurrenceEnabled(true);
          setRecurrence(eventData.recurrence);
        }
      }
    }
  }, [selectedTemplate, templates, event, initialDate]);

  // Detect conflicts
  const conflicts = useMemo(() => {
    if (!startDate || !startTime || !endDate || !endTime) {
      return [];
    }
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    return detectConflicts(
      { startDate: start, endDate: end },
      existingEvents,
      event?.id
    );
  }, [startDate, startTime, endDate, endTime, existingEvents, event?.id]);

  const handleSave = useCallback(() => {
    // Validate date strings before creating Date objects
    if (!startDate || !startTime || !endDate || !endTime) {
      setErrors(['Please fill in all date and time fields.']);
      return;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    // Check if dates are valid
    if (isNaN(start.getTime())) {
      setErrors(['Invalid start date or time.']);
      return;
    }
    if (isNaN(end.getTime())) {
      setErrors(['Invalid end date or time.']);
      return;
    }

    const eventData: Partial<CalendarEvent> = {
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: start,
      endDate: end,
      color,
      category: category || undefined,
      recurrence: recurrenceEnabled ? recurrence : undefined,
    };

    // Validate title before saving
    if (!title || title.trim().length === 0) {
      setErrors(['Title is required']);
      return;
    }

    // Validate end date is after start date
    if (end <= start) {
      setErrors(['End date must be after start date']);
      return;
    }

    const success = onSave(eventData);
    if (success) {
      setErrors([]);
      onClose();
    } else {
      // If save failed, check validation errors after a brief delay to allow state update
      setTimeout(() => {
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        } else {
          setErrors(['Failed to save event. Please check all fields.']);
        }
      }, 50);
    }
  }, [title, description, startDate, startTime, endDate, endTime, color, category, recurrenceEnabled, recurrence, onSave, onClose, validationErrors]);

  const handleDelete = useCallback(() => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  }, [event, onDelete, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? 'Edit Event' : 'Create Event'}
      description={event ? 'Update event details below' : 'Fill in the details to create a new event'}
      size="md"
    >
      <div onKeyDown={handleKeyDown} className="space-y-4 relative">
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full blur-3xl -z-10"></div>
        {/* Templates (only in create mode) */}
        {!event && templates.length > 0 && (
          <div>
            <label htmlFor="event-template" className="block text-sm font-medium text-neutral-200 mb-1">
              Use Template
            </label>
            <Select
              id="event-template"
              options={[
                { value: '', label: 'None' },
                ...templates.map((t) => ({ value: t.id, label: t.name })),
              ]}
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            />
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="event-title" className="block text-sm font-medium text-neutral-200 mb-1">
            Title <span className="text-error-400">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 border border-neutral-600 rounded-lg bg-neutral-800/80 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Event title"
            aria-required="true"
            aria-invalid={errors.length > 0 ? 'true' : 'false'}
          />
          <div className="text-xs text-neutral-400 mt-1">{title.length}/100</div>
          {!event && suggestDuration(title) && (
            <div className="text-xs text-primary-400 mt-1">
              💡 Suggested duration: {suggestDuration(title)} minutes
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="event-description" className="block text-sm font-medium text-neutral-200 mb-1">
            Description
          </label>
          <textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-600 rounded-lg bg-neutral-800/80 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-colors"
            placeholder="Event description (optional)"
          />
          <div className="text-xs text-neutral-400 mt-1">{description.length}/500</div>
        </div>

        {/* Start Date/Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-start-date" className="block text-sm font-medium text-neutral-200 mb-1">
              Start Date <span className="text-error-400">*</span>
            </label>
            <input
              id="event-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-600 rounded-lg bg-neutral-800/80 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="event-start-time" className="block text-sm font-medium text-neutral-200 mb-1">
              Start Time <span className="text-error-400">*</span>
            </label>
            <input
              id="event-start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-600 rounded-lg bg-neutral-800/80 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-required="true"
            />
          </div>
        </div>

        {/* End Date/Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-end-date" className="block text-sm font-medium text-neutral-200 mb-1">
              End Date <span className="text-error-400">*</span>
            </label>
            <input
              id="event-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-600 rounded-lg bg-neutral-800/80 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="event-end-time" className="block text-sm font-medium text-neutral-200 mb-1">
              End Time <span className="text-error-400">*</span>
            </label>
            <input
              id="event-end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-600 rounded-lg bg-neutral-800/80 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-required="true"
            />
          </div>
        </div>

        {/* Conflict Warning */}
        {conflicts.length > 0 && (
          <div className="bg-warning-500/10 border border-warning-500/50 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <span className="text-warning-500 text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-warning-500 mb-1">
                  This overlaps with {conflicts.length} event{conflicts.length > 1 ? 's' : ''}
                </p>
                <ul className="text-xs text-warning-500/80 space-y-1">
                  {conflicts.slice(0, 3).map((conflict) => (
                    <li key={conflict.id}>
                      • {conflict.title} ({formatTime(conflict.startDate)} - {formatTime(conflict.endDate)})
                    </li>
                  ))}
                  {conflicts.length > 3 && (
                    <li className="text-warning-500/80">...and {conflicts.length - 3} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Recurrence */}
        <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/40">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-neutral-200">
              Recurring Event
            </label>
            <button
              type="button"
              onClick={() => setRecurrenceEnabled(!recurrenceEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                recurrenceEnabled ? 'bg-primary-500' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  recurrenceEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {recurrenceEnabled && (
            <div className="space-y-3 mt-3">
              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-1">
                  Frequency
                </label>
                <Select
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' },
                  ]}
                  value={recurrence.frequency}
                  onChange={(e) =>
                    setRecurrence({ ...recurrence, frequency: e.target.value as RecurrenceRule['frequency'] })
                  }
                />
              </div>
              {recurrence.frequency !== 'daily' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    Repeat Every (interval)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={recurrence.interval || 1}
                    onChange={(e) =>
                      setRecurrence({ ...recurrence, interval: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 border border-neutral-600 rounded-lg bg-neutral-800/80 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-1">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={recurrence.endDate ? recurrence.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setRecurrence({
                      ...recurrence,
                      endDate: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-600 rounded-lg bg-neutral-800/80 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Color */}
        <div>
          <label htmlFor="event-color" className="block text-sm font-medium text-neutral-200 mb-1">
            Color
          </label>
          <Select
            id="event-color"
            options={colorOptions}
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="event-category" className="block text-sm font-medium text-neutral-200 mb-1">
            Category
          </label>
          <Select
            id="event-category"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-error-500/10 border border-error-500/50 rounded-lg p-3 backdrop-blur-sm">
            <ul className="list-disc list-inside text-sm text-error-400">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-neutral-700">
          <div>
            {event && onDelete && (
              <Button variant="danger" size="md" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={onClose} className="text-neutral-300 hover:text-white border-neutral-600">
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} className="bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 hover:from-primary-600 hover:via-accent-600 hover:to-primary-700 shadow-lg shadow-primary-500/50">
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

