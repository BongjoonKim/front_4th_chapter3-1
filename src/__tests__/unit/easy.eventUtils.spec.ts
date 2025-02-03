import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import {vi} from "vitest";

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '첫 번째 이벤트입니다.',
      location: '서울시 강남구',
      category: '회의',
      repeat: {
        type: 'none',
        interval: 0
      },
      notificationTime: 30
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-07-03',
      startTime: '14:00',
      endTime: '15:00',
      description: '두 번째 이벤트입니다.',
      location: '서울시 서초구',
      category: '미팅',
      repeat: {
        type: 'none',
        interval: 0
      },
      notificationTime: 15
    },
    {
      id: '3',
      title: '중요 미팅',
      date: '2024-07-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '이벤트 관련 미팅',
      location: '서울시 종로구',
      category: '미팅',
      repeat: {
        type: 'none',
        interval: 0
      },
      notificationTime: 60
    },
    {
      id: '4',
      title: 'event',
      date: '2024-07-25',
      startTime: '11:00',
      endTime: '12:00',
      description: '업체와 미팅',
      location: '서울시 광진구',
      category: '미팅',
      repeat: {
        type: 'none',
        interval: 0
      },
      notificationTime: 60
    },
    {
      id: '5',
      title: 'Event',
      date: '2024-07-26',
      startTime: '11:00',
      endTime: '12:00',
      description: '친구와 약속',
      location: '서울시 강남구',
      category: '개인',
      repeat: {
        type: 'none',
        interval: 0
      },
      notificationTime: 240
    }
  ];
  
  beforeEach(() => {
    // 테스트에서 사용할 한국 시간대 설정
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-07-01T00:00:00+09:00'));
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
    
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const currentDate = new Date('2024-07-01T00:00:00+09:00');
    const result = getFilteredEvents(mockEvents, '', currentDate, 'week');
    
    expect(result).toHaveLength(2);
    expect(result.map(event => event.date)).toEqual(['2024-07-01', '2024-07-03']);
    
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2024-07-01T00:00:00+09:00');
    const result = getFilteredEvents(mockEvents, '', currentDate, 'month');
    
    expect(result).toHaveLength(5);
    expect(result.map(event => event.date)).toEqual([
      '2024-07-01',
      '2024-07-03',
      '2024-07-15',
      '2024-07-25',
      '2024-07-26',
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const currentDate = new Date('2024-07-01T00:00:00+09:00');
    const result = getFilteredEvents(mockEvents, '이벤트', currentDate, 'week');
    
    expect(result).toHaveLength(2);
    expect(result.map(event => event.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2024-07-01T00:00:00+09:00');
    const result = getFilteredEvents(mockEvents, '', currentDate, 'all');
    expect(result).toHaveLength(5);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, 'EVENT', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(2);
    expect(result.some(event => event.title.toLowerCase().includes('event'))).toBeTruthy();
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const borderEvents: Event[] = [
      {
        ...mockEvents[0],
        date: '2024-06-30T00:00:00+09:00'
      },
      {
        ...mockEvents[1],
        date: '2024-07-01T00:00:00+09:00'
      },
      {
        ...mockEvents[2],
        date: '2024-07-31T00:00:00+09:00'
      }
    ];
    
    const currentDate = new Date('2024-07-01T00:00:00+09:00');
    const result = getFilteredEvents(borderEvents, '', currentDate, 'month');
    
    expect(result).toHaveLength(2);
    expect(result.map(event => event.date)).toEqual(['2024-07-01T00:00:00+09:00', '2024-07-31T00:00:00+09:00']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2024-07-01T00:00:00+09:00'), 'month');
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBeTruthy();
    
  });
});
