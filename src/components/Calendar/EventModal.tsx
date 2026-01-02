import React, { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from './CalendarView.types';
import { Modal } from '../primitives/Modal';
import { Button } from '../primitives/Button';
import { Select } from '../primitives/Select';
import { formatDate, formatTime } from '@/utils/date.utils';

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
  initialEndDate?: Date;
  onSave: (event: Partial<CalendarEvent>) => boolean;
  onDelete?: (id: string) => void;
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
  onSave,
  onDelete,
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
      }
      setErrors([]);
    }
  }, [isOpen, event, initialDate, initialEndDate]);

  const handleSave = useCallback(() => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    const eventData: Partial<CalendarEvent> = {
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: start,
      endDate: end,
      color,
      category: category || undefined,
    };

    const success = onSave(eventData);
    if (success) {
      onClose();
    } else {
      setErrors(['Failed to save event. Please check all fields.']);
    }
  }, [title, description, startDate, startTime, endDate, endTime, color, category, onSave, onClose]);

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

