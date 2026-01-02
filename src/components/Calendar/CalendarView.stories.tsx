import type { Meta, StoryObj } from '@storybook/react';
import { CalendarView } from './CalendarView';
import { CalendarEvent } from './CalendarView.types';

const meta: Meta<typeof CalendarView> = {
  title: 'Components/Calendar/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CalendarView>;

// Sample events for stories
const sampleEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Team Standup',
    description: 'Daily sync with the team',
    startDate: new Date(2024, 0, 15, 9, 0),
    endDate: new Date(2024, 0, 15, 9, 30),
    color: '#3b82f6',
    category: 'Meeting',
  },
  {
    id: 'evt-2',
    title: 'Design Review',
    description: 'Review new component designs',
    startDate: new Date(2024, 0, 15, 14, 0),
    endDate: new Date(2024, 0, 15, 15, 30),
    color: '#10b981',
    category: 'Design',
  },
  {
    id: 'evt-3',
    title: 'Client Presentation',
    startDate: new Date(2024, 0, 16, 10, 0),
    endDate: new Date(2024, 0, 16, 11, 30),
    color: '#f59e0b',
    category: 'Meeting',
  },
  {
    id: 'evt-4',
    title: 'Development Sprint',
    description: 'Sprint planning and task assignment',
    startDate: new Date(2024, 0, 17, 9, 0),
    endDate: new Date(2024, 0, 17, 17, 0),
    color: '#8b5cf6',
    category: 'Work',
  },
];

// Generate many events for large dataset story
const generateManyEvents = (count: number): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const categories = ['Meeting', 'Work', 'Personal', 'Design', 'Development'];
  
  for (let i = 0; i < count; i++) {
    const day = Math.floor(i / 5) + 1;
    const hour = 9 + (i % 8);
    const minute = (i % 2) * 30;
    
    events.push({
      id: `evt-${i}`,
      title: `Event ${i + 1}`,
      description: `Description for event ${i + 1}`,
      startDate: new Date(2024, 0, day, hour, minute),
      endDate: new Date(2024, 0, day, hour + 1, minute),
      color: colors[i % colors.length],
      category: categories[i % categories.length],
    });
  }
  
  return events;
};

export const Default: Story = {
  args: {
    events: sampleEvents,
    onEventAdd: (event) => console.log('Event added:', event),
    onEventUpdate: (id, updates) => console.log('Event updated:', id, updates),
    onEventDelete: (id) => console.log('Event deleted:', id),
    initialView: 'month',
    initialDate: new Date(2024, 0, 15),
  },
};

export const Empty: Story = {
  args: {
    events: [],
    onEventAdd: (event) => console.log('Event added:', event),
    onEventUpdate: (id, updates) => console.log('Event updated:', id, updates),
    onEventDelete: (id) => console.log('Event deleted:', id),
    initialView: 'month',
    initialDate: new Date(2024, 0, 15),
  },
};

export const WeekView: Story = {
  args: {
    events: sampleEvents,
    onEventAdd: (event) => console.log('Event added:', event),
    onEventUpdate: (id, updates) => console.log('Event updated:', id, updates),
    onEventDelete: (id) => console.log('Event deleted:', id),
    initialView: 'week',
    initialDate: new Date(2024, 0, 15),
  },
};

export const WithManyEvents: Story = {
  args: {
    events: generateManyEvents(25),
    onEventAdd: (event) => console.log('Event added:', event),
    onEventUpdate: (id, updates) => console.log('Event updated:', id, updates),
    onEventDelete: (id) => console.log('Event deleted:', id),
    initialView: 'month',
    initialDate: new Date(2024, 0, 1),
  },
};

export const InteractivePlayground: Story = {
  args: {
    events: sampleEvents,
    onEventAdd: (event) => {
      console.log('Event added:', event);
      alert(`Event "${event.title}" added successfully!`);
    },
    onEventUpdate: (id, updates) => {
      console.log('Event updated:', id, updates);
      alert(`Event updated successfully!`);
    },
    onEventDelete: (id) => {
      console.log('Event deleted:', id);
      alert('Event deleted successfully!');
    },
    initialView: 'month',
    initialDate: new Date(2024, 0, 15),
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    events: sampleEvents,
    onEventAdd: (event) => console.log('Event added:', event),
    onEventUpdate: (id, updates) => console.log('Event updated:', id, updates),
    onEventDelete: (id) => console.log('Event deleted:', id),
    initialView: 'month',
    initialDate: new Date(2024, 0, 15),
  },
};

export const Accessibility: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
  args: {
    events: sampleEvents,
    onEventAdd: (event) => console.log('Event added:', event),
    onEventUpdate: (id, updates) => console.log('Event updated:', id, updates),
    onEventDelete: (id) => console.log('Event deleted:', id),
    initialView: 'month',
    initialDate: new Date(2024, 0, 15),
  },
  play: async ({ canvasElement }) => {
    // Demonstrate keyboard navigation
    const firstCell = canvasElement.querySelector('[role="button"]') as HTMLElement;
    if (firstCell) {
      firstCell.focus();
    }
  },
};

