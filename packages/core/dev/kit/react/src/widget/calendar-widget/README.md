# Calendar View Primitive

This is a reusable calendar component that can be used to display events in various views (day, week, month, year).

## Features

- Multiple view types: day, week, month, year
- Navigation between dates
- Event display with customizable rendering
- Today button for quick navigation
- Responsive design
- Date selection
- Event click handling

## Usage

### Basic Usage

```tsx
import { CalendarWidget, CalendarEvent } from "@inspatial/kit/widget";

// Define your events
const events: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Meeting",
    date: new Date(2023, 7, 15),
    itemCount: 3,
  },
  {
    id: "2",
    title: "Project Deadline",
    date: new Date(2023, 7, 20),
  },
];

// Use the component
const MyCalendar = () => (
  <CalendarWidget
    events={events}
    onDateClick={(date) => console.log("Date clicked", date)}
    onEventClick={(event) => console.log("Event clicked", event)}
  />
);
```

### Advanced Usage with Custom Rendering

You can customize how events are rendered:

```tsx
// Custom event renderer
const renderMyEvent = (event: CalendarEvent) => (
  <div 
    className="p-2 bg-blue-500 text-white rounded"
    onClick={() => handleEventClick(event)}
  >
    <h3>{event.title}</h3>
    {event.itemCount && <p>{event.itemCount} items</p>}
  </div>
);

// Use with custom renderer
<CalendarWidget
  events={events}
  renderEvent={renderMyEvent}
  initialViewType="week" // Start with week view
  initialDate={new Date(2023, 7, 1)} // Start with Aug 1, 2023
/>
```

## Creating Domain-Specific Calendar Views

The best practice is to create domain-specific wrappers around the CalendarWidget. For example:

```tsx
// ScheduleCalendarView.tsx
import { CalendarWidget, CalendarEvent } from "@/components/primitives/CalendarWidget";

interface Event extends CalendarEvent {
  eventData: EventData;
}

export function EventCalendarView({ events, onEventEdit }) {
  // Transform your domain data to CalendarEvent format
  const events = events.map(event => ({
    id: event.id,
    title: event.title,
    date: event.date,
    itemCount: event.guests?.length,
    eventData: event // Store the original data
  }));
  
  return (
    <CalendarWidget
      events={events}
      onEventClick={onEventEdit}
      // ...other props
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| events | `CalendarEvent[]` | Array of events to display |
| initialViewType | `"day" \| "week" \| "month" \| "year"` | Initial view type |
| initialDate | `Date` | Initial date to display |
| onEventClick | `(event: T) => void` | Callback when event is clicked |
| onDateClick | `(date: Date) => void` | Callback when date is clicked |
| renderEvent | `(event: T) => React.ReactNode` | Custom renderer for events |
| className | `string` | Additional class name for the container |

## CalendarEvent Interface

```ts
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  itemCount?: number; // Optional count of sub-items
  data?: any; // Optional additional data
}
``` 