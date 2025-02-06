import { Event } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

// 날짜 범위를 알려주는 함수 (봉준 made)
const getMonthRange = (date) => {
  const startMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  
  return {
    startMonth,
    endMonth
  };
};

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const {startMonth, endMonth} = getMonthRange(currentDate);
  return filterEventsByDateRange(events, startMonth, endMonth);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}
