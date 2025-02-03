import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';
import {vi} from "vitest";

const KR_TIME_OFFSET = 9 * 60 * 60 * 1000; // 9시간을 밀리초로 변환
beforeEach(() => {
  vi.useFakeTimers();
  const krTime = new Date(Date.now() + KR_TIME_OFFSET);
  vi.setSystemTime(krTime);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const events: Event[] = [];
    const { result } = renderHook(() => useNotifications(events));
    
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });
  
  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const baseTime = new Date('2024-02-02T10:00:00+09:00');
    vi.setSystemTime(baseTime);
    
    // 10분 후의 이벤트 생성 (10:10:00)
    const eventTime = new Date('2024-02-02T10:10:00+09:00');
    
    const testEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: formatDate(eventTime),
      startTime: parseHM(eventTime.getTime()),
      endTime: parseHM(eventTime.getTime() + 3600000), // 1시간 후
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: {
        type: 'none',
        interval: 0
      },
      notificationTime: 1 // 1분 전 알림
    };
    
    const { result } = renderHook(() => useNotifications([testEvent]));
    
    // 처음에는 알림이 없어야 함
    expect(result.current.notifications).toHaveLength(0);
    
    // 8분 후로 이동 (10:08:00, 아직 알림 시간 전)
    act(() => {
      vi.setSystemTime(new Date('2024-02-02T10:08:00+09:00'));
      vi.advanceTimersByTime(1000); // interval 실행을 위해
    });
    expect(result.current.notifications).toHaveLength(0);
    
    // 알림 시간으로 이동 (10:09:00, 이벤트 1분 전)
    act(() => {
      vi.setSystemTime(new Date('2024-02-02T10:09:00+09:00'));
      vi.advanceTimersByTime(1000); // interval 실행을 위해
    });
    
    // 알림이 추가되었는지 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: testEvent.id,
      message: expect.any(String)
    });
  });
  
  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const baseTime = new Date('2024-02-02T10:00:00+09:00');
    vi.setSystemTime(baseTime);
    
    // 10분 후의 이벤트 생성 (10:10:00)
    const eventTime = new Date('2024-02-02T10:10:00+09:00');
    
    const testEvents: Event[] = [
      {
        id: '1',
        title: '테스트 이벤트 1',
        date: formatDate(eventTime),
        startTime: parseHM(eventTime.getTime()),
        endTime: parseHM(eventTime.getTime() + 3600000),
        description: '테스트 설명 1',
        location: '테스트 장소 1',
        category: '테스트 카테고리',
        repeat: {
          type: 'none',
          interval: 0
        },
        notificationTime: 1
      },
      {
        id: '2',
        title: '테스트 이벤트 2',
        date: formatDate(eventTime),
        startTime: parseHM(eventTime.getTime()),
        endTime: parseHM(eventTime.getTime() + 3600000),
        description: '테스트 설명 2',
        location: '테스트 장소 2',
        category: '테스트 카테고리',
        repeat: {
          type: 'none',
          interval: 0
        },
        notificationTime: 1
      }
    ];
    
    const { result } = renderHook(() => useNotifications(testEvents));
    // 알림 생성
    act(() => {
      vi.setSystemTime(new Date('2024-02-02T10:09:00+09:00'));
      vi.advanceTimersByTime(1000); // interval 실행을 위해
    });
    // 1분 전 알람 2개가 생김
    expect(result.current.notifications).toHaveLength(2);
    
    // 첫 번째 알림 제거
    act(() => {
      result.current.removeNotification(0);
    });
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('2');
  });
  
  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const baseTime = new Date('2024-02-02T10:00:00+09:00');
    vi.setSystemTime(baseTime);
    
    // 10분 후의 이벤트 생성 (10:10:00)
    const eventTime = new Date('2024-02-02T10:10:00+09:00');
    
    const testEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: formatDate(eventTime),
      startTime: parseHM(eventTime.getTime()),
      endTime: parseHM(eventTime.getTime() + 3600000),
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: {
        type: 'none',
        interval: 0
      },
      notificationTime: 1
    };
    
    const { result } = renderHook(() => useNotifications([testEvent]));
    // 첫 번째 알림 생성
    act(() => {
      vi.setSystemTime(new Date('2024-02-02T10:09:00+09:00'));
      vi.advanceTimersByTime(1000);
    });
    // 알람이 한 개 생김
    expect(result.current.notifications).toHaveLength(1);
    
    // 추가 시간 진행
    act(() => {
      vi.setSystemTime(new Date('2024-02-02T10:11:00+09:00'));
      vi.advanceTimersByTime(1000);
    });
    // 알림 개수가 증가하지 않아야 함
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain(testEvent.id);
  });
