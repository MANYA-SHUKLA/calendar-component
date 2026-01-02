# Calendar View Component

A production-grade, fully interactive Calendar View component built with React, TypeScript, and Tailwind CSS 4. This component provides month and week views with comprehensive event management capabilities.

## About

The Calendar View Component is a modern, feature-rich calendar application designed for seamless event management and scheduling. Built with cutting-edge web technologies, it offers an intuitive user interface with powerful functionality for both developers and end-users.

### What is it?

This is a fully customizable calendar component library that provides a complete scheduling solution. It's designed to be integrated into web applications, offering month and week views with comprehensive event management capabilities. The component handles everything from event creation and editing to persistent storage and responsive design.

### Key Capabilities

- **Dual View System**: Seamlessly switch between month and week views to get the perspective you need
- **Event Management**: Full CRUD operations (Create, Read, Update, Delete) for calendar events
- **Interactive Creation**: Drag-to-create events directly in the week view by selecting time slots
- **Date Range Selection**: Select multiple dates in month view for bulk operations or planning
- **Persistent Storage**: Automatic localStorage integration to save your events across sessions
- **Smart Event Handling**: Intelligent positioning and display of overlapping events
- **Responsive Design**: Works flawlessly on mobile, tablet, and desktop devices
- **Accessibility First**: Built with WCAG 2.1 AA compliance for inclusive design

### Who is it for?

- **Developers**: Looking for a production-ready calendar component to integrate into their React/Next.js applications
- **Product Teams**: Needing a customizable scheduling solution for their applications
- **End Users**: Seeking a clean, intuitive calendar interface for managing events and schedules

### Use Cases

- **Event Scheduling Applications**: Create, manage, and view scheduled events
- **Task Management**: Organize tasks with due dates and time slots
- **Booking Systems**: Handle reservations and appointments
- **Team Calendars**: Share schedules and coordinate team activities
- **Personal Planners**: Manage personal events and reminders
- **Project Management**: Track project timelines and milestones

### Highlights

✨ **Modern Stack**: Built with React 19, TypeScript 5, and Tailwind CSS 4  
🎨 **Beautiful UI**: Gradient designs, smooth animations, and polished interactions  
♿ **Accessible**: Full keyboard navigation and screen reader support  
⚡ **Performant**: Optimized for speed, handles 500+ events without lag  
📱 **Responsive**: Works perfectly on all screen sizes  
🔧 **Customizable**: Easy to integrate and customize to match your brand  
📚 **Well Documented**: Comprehensive Storybook documentation with interactive examples

## Installation

```bash
npm install
npm run storybook
```

For Next.js development:

```bash
npm run dev
```

## Architecture

The component is built with a modular architecture following best practices:

- **Component Structure**: Separated into logical components (MonthView, WeekView, CalendarCell, EventModal)
- **Custom Hooks**: `useCalendar` for calendar state management and `useEventManager` for event operations
- **Utility Functions**: Date manipulation and event utilities in separate modules
- **Primitive Components**: Reusable UI primitives (Button, Modal, Select) built from scratch
- **Type Safety**: Full TypeScript with strict mode enabled

## Features

- [x] Month/Week views with smooth transitions
- [x] Event management (Create, Read, Update, Delete)
- [x] Responsive design (Mobile, Tablet, Desktop)
- [x] Keyboard accessibility (WCAG 2.1 AA compliant)
- [x] ARIA labels and roles
- [x] Event color coding and categorization
- [x] Time slot selection in week view
- [x] Drag-to-create events in week view
- [x] Multi-select date range selection in month view
- [x] LocalStorage persistence for events
- [x] Overlapping event handling
- [x] Performance optimizations (React.memo, useCallback, useMemo)

## Storybook Stories

1. **Default** - Current month with sample events
2. **Empty** - Empty calendar state
3. **Week View** - Week view with time slots
4. **With Many Events** - Calendar with 25+ events
5. **Interactive Playground** - Fully functional with all interactions
6. **Mobile View** - Responsive layout demonstration
7. **Accessibility** - Keyboard navigation demonstration

## Technologies

- **React 19** - Component framework
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Next.js 16** - Build tooling and framework
- **Storybook 10** - Component documentation
- **date-fns** - Date manipulation utilities
- **clsx** - Conditional class management

## Project Structure

```
calendar-component/
├── src/
│   ├── components/
│   │   ├── Calendar/
│   │   │   ├── CalendarView.tsx
│   │   │   ├── CalendarView.stories.tsx
│   │   │   ├── CalendarView.types.ts
│   │   │   ├── MonthView.tsx
│   │   │   ├── WeekView.tsx
│   │   │   ├── CalendarCell.tsx
│   │   │   └── EventModal.tsx
│   │   └── primitives/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Select.tsx
│   ├── hooks/
│   │   ├── useCalendar.ts
│   │   └── useEventManager.ts
│   └── utils/
│       ├── date.utils.ts
│       └── event.utils.ts
├── .storybook/
│   ├── main.ts
│   └── preview.ts
└── app/
    └── globals.css
```

## Usage

```tsx
import { CalendarView } from '@/components/Calendar/CalendarView';
import { CalendarEvent } from '@/components/Calendar/CalendarView.types';

const events: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Team Meeting',
    startDate: new Date(2024, 0, 15, 9, 0),
    endDate: new Date(2024, 0, 15, 10, 0),
    color: '#3b82f6',
  },
];

function App() {
  return (
    <CalendarView
      events={events}
      onEventAdd={(event) => console.log('Added:', event)}
      onEventUpdate={(id, updates) => console.log('Updated:', id, updates)}
      onEventDelete={(id) => console.log('Deleted:', id)}
      initialView="month"
    />
  );
}
```

## Accessibility

The component meets WCAG 2.1 AA standards:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper labels, roles, and live regions
- **Focus Management**: Logical focus order with visible indicators
- **Screen Reader Support**: Semantic HTML and ARIA attributes

## Performance

- Optimized rendering with React.memo for expensive components
- Debounced interactions where appropriate
- Efficient date calculations
- Handles 500+ events without performance degradation

## Development

```bash
# Run Storybook
npm run storybook

# Run Next.js dev server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

## License

MIT

## Contact

MANYA SHUKLA 2025
