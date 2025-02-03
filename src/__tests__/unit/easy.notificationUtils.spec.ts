import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const mockEvent: Event = {
    id: '1',
    title: '회의',
    date: '2025-02-02',
    startTime: '14:00',
    notificationTime: 30
  };
  
  beforeEach(() => {
    // 테스트에서 한국 시간대 사용을 위한 설정
    process.env.TZ = 'Asia/Seoul';
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = [mockEvent];
    // 이벤트 시작 30분 전 시간 설정 (13:30)
    const now = new Date(`${mockEvent.date}T13:30:00`);
    const result = getUpcomingEvents(events, now, []);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mockEvent);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = [mockEvent];
    const now = new Date(`${mockEvent.date}T13:30:00`);
    const notifiedEvents = [mockEvent.id];
    
    const result = getUpcomingEvents(events, now, notifiedEvents);
    
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = [mockEvent];
    // 이벤트 시작 31분 전 시간 설정 (13:29:59)
    const now = new Date(`${mockEvent.date}T13:29:59`);
    const result = getUpcomingEvents(events, now, []);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = [mockEvent];
    // 이벤트 시작 29분 전 시간 설정 (13:31)
    const now = new Date(`${mockEvent.date}T13:31:00`);
    const notifiedEvents = [mockEvent.id];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2025-02-02',
      startTime: '14:00',
      notificationTime: 30
    };
    const message = createNotificationMessage(event);
    expect(message).toBe('30분 후 팀 미팅 일정이 시작됩니다.');
  });
});
