'use client';

import { CalendarView } from '@/components/Calendar/CalendarView';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import Footer from '@/components/Footer';

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
];

export default function Home() {
  const handleEventAdd = (event: CalendarEvent) => {
    console.log('Event added:', event);
  };

  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    console.log('Event updated:', id, updates);
  };

  const handleEventDelete = (id: string) => {
    console.log('Event deleted:', id);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 pb-20 sm:pb-24 relative">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 rounded-3xl blur-3xl -z-10"></div>
          <CalendarView
            events={sampleEvents}
            onEventAdd={handleEventAdd}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            initialView="month"
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
