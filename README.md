# Calendar View Component

A production-grade, fully interactive Calendar View component built with React, TypeScript, and Tailwind CSS 4. This component provides month and week views with comprehensive event management capabilities.



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
