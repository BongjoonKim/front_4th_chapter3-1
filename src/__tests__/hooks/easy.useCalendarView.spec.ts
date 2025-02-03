import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';
import {beforeEach, vi} from "vitest";

describe('초기 상태', () => {
  // 실제 Date 객체를 저장
  //
  const mockDate = new Date('2024-10-01T09:00:00+09:00'); // 2024년 10월 01일
  console.log("오늘 날짜", mockDate)
  let data ;
  
  beforeEach(() => {
    // Vitest의 방식으로 날짜 모킹
    vi.setSystemTime(mockDate);
    const {result} = renderHook(() => useCalendarView());
    data = result.current;
  });
  
  
  it('view는 "month"이어야 한다', () => {
    expect(data.view).toBe("month")
  });

  it('currentDate는 오늘 날짜인 "2024-10-01"이어야 한다', () => {
    const today = new Date();
    
    expect(data.currentDate.toISOString().slice(0, 10)).toBe("2024-10-01")
  });

  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    expect(data.holidays["2024-10-03"]).toBe("개천절")
    expect(data.holidays["2024-10-09"]).toBe("한글날")
    
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const {result} = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView("week");
  })
  expect(result.current.view).toBe("week")
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2024-10-08' 날짜로 지정이 된다", () => {
  const {result} = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView("week");
  })
  act(() => {
    result.current.navigate("next");
  })
  expect(result.current.currentDate.toISOString().slice(0, 10)).toBe("2024-10-08")
});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2024-09-24' 날짜로 지정이 된다", () => {
  const {result} = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView("week");
  })
  act(() => {
    result.current.navigate("prev");
  })
  expect(result.current.currentDate.toISOString().slice(0, 10)).toBe("2024-09-24")
});

it("월간 뷰에서 다음으로 navigate시 한 달 전 '2024-11-01' 날짜여야 한다", () => {
  // mockDate 재설정
  // vi.setSystemTime(new Date(2024, 9, 2)); // 2024년 10월 1일로 설정
  const {result} = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView("month");
  })
  act(() => {
    result.current.navigate("next");
  })
  
  expect(result.current.currentDate.toISOString().slice(0, 10)).toBe("2024-11-01")
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2024-09-01' 날짜여야 한다", () => {
  const {result} = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView("month");
  })
  act(() => {
    result.current.navigate("prev");
  })
  expect(result.current.currentDate.toISOString().slice(0, 10)).toBe("2024-09-01")
});

it("currentDate가 '2024-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
  const {result} = renderHook(() => useCalendarView());
  act(() => {
    result.current.setCurrentDate(new Date("2024-01-01T09:00:00+09:00"));
  })
  console.log("result.current", result)
  expect(result.current.holidays["2024-01-01"]).toBe("신정")
});
