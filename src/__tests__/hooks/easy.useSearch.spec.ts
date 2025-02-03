import {act, cleanup, renderHook} from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '주간 회의',
    date: '2024-02-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: 'meeting',
    repeat: {
      type: 'none',
      interval: 1,
      until: null
    },
    notificationTime: 30
  },
  {
    id: '2',
    title: '점심 식사',
    date: '2024-02-01',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀 점심 식사',
    location: '구내 식당',
    category: 'break',
    repeat: {
      type: 'none',
      interval: 1,
      until: null
    },
    notificationTime: 15
  },
  {
    id: '3',
    title: '프로젝트 미팅',
    date: '2024-02-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '신규 프로젝트 점검 회의',
    location: '회의실 B',
    category: 'meeting',
    repeat: {
      type: 'none',
      interval: 1,
      until: null
    },
    notificationTime: 30
  }
];

let currentDate = new Date('2024-02-01T09:00:00+09:00');



it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const {result} = renderHook(() => useSearch(mockEvents, currentDate, ""));
  expect(result.current.filteredEvents.length).toBe(3);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const {result} = renderHook(() => useSearch(mockEvents, currentDate, ""));
  act(() => {
    result.current.setSearchTerm("프로젝트 미팅")
  })
  expect(result.current.filteredEvents.length).toBe(1);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const {result} = renderHook(() => useSearch(mockEvents, currentDate, ""));
  act(() => {
    // 설명이 맞는 경우
    result.current.setSearchTerm("신규")
  })
  expect(result.current.filteredEvents.length).toBe(1);
  
  act(() => {
    // 제목이 맞는 경우
    result.current.setSearchTerm("프로")
  })
  expect(result.current.filteredEvents.length).toBe(1);
  
  act(() => {
    // 장소가 맞는 경우
    result.current.setSearchTerm("B")
  })
  expect(result.current.filteredEvents.length).toBe(1);
  
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  // 주간 뷰 테스트
  currentDate = new Date('2024-02-01T09:00:00+09:00');
  const { result: weekResult, unmount: weekUnmount } = renderHook(() =>
    useSearch(mockEvents, currentDate, 'week')
  );
  expect(weekResult.current.filteredEvents.length).toBe(2);
  
  // 주간 뷰 hook 언마운트
  weekUnmount();
  
  // 월간 뷰 테스트
  currentDate = new Date('2024-02-01T09:00:00+09:00');
  const { result: monthResult } = renderHook(() =>
    useSearch(mockEvents, currentDate, 'month')
  );
  expect(monthResult.current.filteredEvents.length).toBe(3);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() =>
    useSearch(mockEvents, currentDate, 'month')
  );
  
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents.length).toBe(2);
  
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 식사');
});