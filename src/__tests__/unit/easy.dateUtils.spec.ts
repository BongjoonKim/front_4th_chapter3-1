import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2024, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2024, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2024, 0)).toBe(31); // 이전 해의 12월
    expect(getDaysInMonth(2024, 13)).toBe(31); // 다음 해의 1월
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date('2024-07-10T09:00:00+09:00');
    const weekDates = getWeekDates(wednesday); // 그 주 날짜
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(7); // 일요일
    expect(weekDates[6].getDate()).toBe(13); // 토요일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date('2024-07-07T09:00:00+09:00');
    const weekDates = getWeekDates(sunday);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(7);
    expect(weekDates[6].getDate()).toBe(13);
    
  });

  it('주의 끝 (일요일)에 대해 올바른 주의 날짜들을 반환한다', () => { // 저는 주의 끝은 토요일이라고 생각합니다.
    const saturday = new Date('2024-07-13T09:00:00+09:00');
    const weekDates = getWeekDates(saturday);
    console.log("weekDates", weekDates)
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(7);
    expect(weekDates[6].getDate()).toBe(13);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const endOfYear = new Date('2024-12-29T09:00:00+09:00');
    const weekDates = getWeekDates(endOfYear);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[0].getFullYear()).toBe(2024);
    expect(weekDates[6].getDate()).toBe(4);
    expect(weekDates[6].getFullYear()).toBe(2025);
    
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const startOfYear = new Date('2025-01-01T09:00:00+09:00');
    const weekDates = getWeekDates(startOfYear);
    console.log("weekDates", weekDates)
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[0].getFullYear()).toBe(2024);
    expect(weekDates[6].getDate()).toBe(4);
    expect(weekDates[6].getFullYear()).toBe(2025);
    
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const leapDay = new Date('2024-02-29T09:00:00+09:00');
    const weekDates = getWeekDates(leapDay);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(25);
    expect(weekDates[6].getDate()).toBe(2);
    expect(weekDates[4].getDate()).toBe(29);
    
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const lastDay = new Date('2024-07-31T09:00:00+09:00');
    const weekDates = getWeekDates(lastDay);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(28);
    expect(weekDates[6].getDate()).toBe(3);
    
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2024-07-01T09:00:00+09:00');
    const weeks = getWeeksAtMonth(date);
    
    expect(weeks).toHaveLength(5); // 7월은 5주
    expect(weeks[0][0]).toBeNull(); // 1일이 월요일이므로 일요일은 null
    expect(weeks[0][1]).toBe(1); // 첫째 주 월요일은 1일
    expect(weeks[4][2]).toBe(30); // 마지막 주 화요일은 30일
    expect(weeks[4][3]).toBe(31); // 마지막 주 수요일은 31일
  });
});

describe('getEventsForDay', () => {
  const mockEvents: Event[] = [
    { id: '1', date: '2024-07-01', title: 'Event 1' },
    { id: '2', date: '2024-07-01', title: 'Event 2' },
    { id: '3', date: '2024-07-15', title: 'Event 3' },
    { id: '4', date: '2024-08-01', title: 'Event 4' },
  ];
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = getEventsForDay(mockEvents, 1);
    expect(events).toHaveLength(3);
    expect(events[0].title).toBe('Event 1');
    expect(events[1].title).toBe('Event 2');
    expect(events[2].title).toBe('Event 4');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 2);
    expect(events).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 0);
    expect(events).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 32);
    expect(events).toHaveLength(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-15');
    expect(formatWeek(date)).toBe('2024년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-01');
    expect(formatWeek(date)).toBe('2024년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-31');
    expect(formatWeek(date)).toBe('2024년 8월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-12-31');
    expect(formatWeek(date)).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');
    expect(formatWeek(date)).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2023-02-28');
    expect(formatWeek(date)).toBe('2023년 3월 1주');
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const date = new Date('2024-07-10');
    expect(formatMonth(date)).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01T09:00:00+09:00');
  const rangeEnd = new Date('2024-07-31T09:00:00+09:00');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-10T09:00:00+09:00');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
    
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-01T09:00:00+09:00');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-31T09:00:00+09:00');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2024-06-30T09:00:00+09:00');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2024-08-01T09:00:00+09:00');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const invalidRangeStart = new Date('2024-07-31T09:00:00+09:00');
    const invalidRangeEnd = new Date('2024-07-01T09:00:00+09:00');
    const date = new Date('2024-07-15T09:00:00+09:00');
    expect(isDateInRange(date, invalidRangeStart, invalidRangeEnd)).toBe(false);
    
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(7)).toBe('07');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(1000, 2)).toBe('1000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2024-07-10');
    expect(formatDate(date)).toBe('2024-07-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2024-07-10');
    expect(formatDate(date, 15)).toBe('2024-07-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2024-05-15');
    expect(formatDate(date)).toBe('2024-05-15');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2024-07-05');
    expect(formatDate(date)).toBe('2024-07-05');
  });
});
