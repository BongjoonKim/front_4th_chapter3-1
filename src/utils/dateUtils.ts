import { Event } from '../types.ts';

type WeekInfo = {
  year: number;
  month: number;
  weekNumber: number;
};
/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

export function getWeeksAtMonth(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  const initWeek = () => Array(7).fill(null);

  let week: Array<number | null> = initWeek();

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = (firstDayOfMonth + day - 1) % 7;
    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = initWeek();
    }
  }

  return weeks;
}

export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}


// 날짜로부터 해당 주의 목요일을 구하는 순수 함수 (봉준 made)
function getThursdayOfWeek(date: Date): Date {
  const thursday = new Date(date.getTime());
  const dayOfWeek = date.getDay();
  const diffToThursday = 4 - dayOfWeek;
  thursday.setDate(date.getDate() + diffToThursday);
  return thursday;
}

// 해당 월의 첫 번째 목요일을 구하는 순수 함수 (봉준 made)
function getFirstThursdayOfMonth(year: number, month: number): Date {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstThursday = new Date(firstDayOfMonth.getTime());
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));
  return firstThursday;
}

// 주차 정보를 계산하는 순수 함수 (봉준 made)
function calculateWeekInfo(date: Date): WeekInfo {
  const thursday = getThursdayOfWeek(date);
  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;
  const firstThursday = getFirstThursdayOfMonth(year, thursday.getMonth());
  
  const weekNumber = Math.floor(
    (thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)
  ) + 1;
  
  return { year, month, weekNumber };
}

// 포매팅 함수
export function formatWeek(date: Date): string {
  const { year, month, weekNumber } = calculateWeekInfo(date);
  return `${year}년 ${month}월 ${weekNumber}주`;
}

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  return date >= rangeStart && date <= rangeEnd;
}

export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}
