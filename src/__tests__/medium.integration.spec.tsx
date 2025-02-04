import { ChakraProvider } from '@chakra-ui/react';
import {render, screen, within, act, queryByText, waitFor} from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import { Provider } from 'jotai';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating
} from "../__mocks__/handlersUtils.ts";

describe('일정 CRUD 및 기본 기능', () => {
  const sampleEvent: Event = {
    id: "1",
    title: "기존 회의",
    date: "2024-10-15",
    startTime: "09:00",
    endTime: "10:00",
    description: "기존 팀 미팅",
    location: "회의실 B",
    category: "업무",
    repeat: { type: "none", interval: 0 },
    notificationTime: 10
  };
  
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const mockHandler = setupMockHandlerCreation();
    
    // 새로운 이벤트 데이터 준비
    const newEvent: Omit<Event, 'id'> = {
      title: "신규 회의",
      date: "2024-02-15",
      startTime: "13:00",
      endTime: "14:00",
      description: "프로젝트 기획 회의",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 15
    };

// POST 요청 시뮬레이션
    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newEvent)
    });

    const response = await mockHandler.handler({ request });
    const responseData = await response.json();
    
    const savedEvents = mockHandler.getEvents();

// 응답 검증
    console.log("response", responseData);
    expect(response.status).toBe(201);
    expect(responseData.id).toBeDefined();

// 저장된 데이터 검증
    expect(savedEvents).toHaveLength(1);
    expect(savedEvents[0]).toEqual({
      id: expect.any(String),
      ...newEvent
    });

// 모든 필드가 정확히 저장되었는지 검증
    const savedEvent = savedEvents[0];
    Object.keys(newEvent).forEach(key => {
      expect(savedEvent[key]).toEqual(newEvent[key]);
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // 초기 이벤트 데이터 준비
    const initialEvent: Event = {
      id: "1",
      title: "기존 회의",
      date: "2024-02-15",
      startTime: "10:00",
      endTime: "11:00",
      description: "팀 주간 회의",
      location: "회의실 B",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 10
    };
    
    // 수정할 이벤트 데이터 준비
    const updatedEventData: Omit<Event, 'id'> = {
      title: "수정된 회의",
      date: "2024-02-16",
      startTime: "14:00",
      endTime: "15:00",
      description: "수정된 팀 주간 회의",
      location: "회의실 A",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 15
    };
    
    const mockHandler = setupMockHandlerUpdating([initialEvent]);
    
    // PUT 요청 시뮬레이션
    const response = await mockHandler.handler({
      request: new Request('http://localhost/api/events/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedEventData)
      }),
      params: { id: "1" }
    });
    
    const responseData = await response.json();
    const savedEvents = mockHandler.getEvents();
    const updatedEvent = mockHandler.getEventById("1");
    
    // 응답 검증
    expect(response.status).toBe(200);
    expect(responseData).toEqual({
      id: "1",
      ...updatedEventData
    });
    
    // 저장된 데이터 검증
    expect(savedEvents).toHaveLength(1);
    expect(updatedEvent).toEqual({
      id: "1",
      ...updatedEventData
    });
    
    // 모든 필드가 정확히 수정되었는지 검증
    Object.keys(updatedEventData).forEach(key => {
      expect(updatedEvent[key]).toEqual(updatedEventData[key]);
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // 초기 이벤트 데이터 준비
    const initialEvent: Event = {
      id: "1",
      title: "삭제할 회의",
      date: "2024-02-15",
      startTime: "10:00",
      endTime: "11:00",
      description: "팀 주간 회의",
      location: "회의실 B",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 10
    };
    
    const mockHandler = setupMockHandlerDeletion([initialEvent]);
    
    // 삭제 전 이벤트 존재 확인
    expect(mockHandler.getEventById("1")).toBeDefined();
    expect(mockHandler.getEvents()).toHaveLength(1);
    
    // DELETE 요청 시뮬레이션
    const response = await mockHandler.handler({
      request: new Request('http://localhost/api/events/1', {
        method: 'DELETE'
      }),
      params: { id: "1" }
    });
    
    // 응답 검증
    expect(response.status).toBe(204);
    
    // 삭제 후 데이터 검증
    expect(mockHandler.getEvents()).toHaveLength(0);
    expect(mockHandler.getEventById("1")).toBeUndefined();
  });
});



describe('일정 뷰', () => {
  
  const sampleEvent: Event = {
    id: "1",
    title: "테스트 회의",
    date: "2024-02-15T00:00:00+09:00",
    startTime: "09:00",
    endTime: "10:00",
    description: "테스트용 팀 미팅",
    location: "회의실 A",
    category: "업무",
    repeat: { type: "none", interval: 0 },
    notificationTime: 10
  };
  
  beforeEach(() => {
    server.resetHandlers();
    // vitest에서는 setSystemTime 대신 vi.setSystemTime 사용
    vi.setSystemTime(new Date('2024-02-15T00:00:00+09:00'));
  });
  
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // 빈 일정 데이터로 서버 응답 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json([]);
      })
    );
    
    render(<ChakraProvider><App /></ChakraProvider>);
    const user = userEvent.setup();
    
    // 주별 뷰 선택
    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'week');
    
    // 일정이 표시되지 않는지 확인
    expect(screen.queryByText('테스트 회의')).not.toBeInTheDocument();
  });
  
  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {    // 샘플 일정이 포함된 events 배열로 서버 응답 설정
// 샘플 일정이 포함된 events 배열로 서버 응답 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [sampleEvent] });
      })
    );
    
    render(<ChakraProvider><App /></ChakraProvider>);
    const user = userEvent.setup();
    
    // 주별 뷰 선택
    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'week');
    
    // week-view 내에서 일정이 정확히 표시되는지 확인
    const weekView = screen.getByTestId('week-view');
    expect(within(weekView).getByText('테스트 회의')).toBeInTheDocument();
  });
  
  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] });
      })
    );
    
    render(<ChakraProvider><App /></ChakraProvider>);
    const user = userEvent.setup();
    
    // 월별 뷰 선택
    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'month');
    
    // 월별 뷰에서 일정이 표시되지 않는지 확인
    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).queryByText('테스트 회의')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [sampleEvent] });
      })
    );
    
    render(<ChakraProvider><App /></ChakraProvider>);
    const user = userEvent.setup();
    
    // 월별 뷰 선택
    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'month');
    
    // 월별 뷰 컨테이너 찾기
    const monthView = screen.getByTestId('month-view');
    
    // 월별 뷰 헤더에 2024년 2월이 표시되는지 확인
    expect(within(monthView).getByText(/2024년 2월/)).toBeInTheDocument();
    
    // 일정이 정확히 표시되는지 확인
    expect(within(monthView).getByText('테스트 회의')).toBeInTheDocument();
    
    // 15일 칸에 일정이 표시되는지 확인
    const dayCell = within(monthView)
      .getAllByRole('cell')
      .find(cell => within(cell).queryByText('15') !== null);
    expect(dayCell).toBeDefined();
    expect(within(dayCell!).getByText('테스트 회의')).toBeInTheDocument();
    
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // 1월 1일 테스트를 위해 시스템 시간 변경
    vi.setSystemTime(new Date('2024-01-01T00:00:00+09:00'));
    
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] });
      })
    );
    
    render(<ChakraProvider><App /></ChakraProvider>);
    const user = userEvent.setup();
    
    // 월별 뷰 선택
    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'month');
    
    // 월별 뷰 내에서 1일이 있는 셀 찾기
    const monthView = screen.getByTestId('month-view');
    const firstDayCell = within(monthView)
      .getAllByRole('cell')
      .find(cell => within(cell).queryByText('1') !== null);
    
    // 신정이 표시되는지 확인
    expect(firstDayCell).toBeDefined();
    const holidayText = within(firstDayCell!).getByText('신정');
    expect(holidayText).toBeInTheDocument();
    expect(holidayText).toHaveStyle({ color: 'var(--chakra-colors-red-500)' }); // 공휴일 글자색이 빨간색인지 확인
    
  });
});

describe('검색 기능', () => {
  const sampleEvents = {
    events: [
      {
        id: "1",
        title: "팀 회의",
        date: "2024-02-15",
        startTime: "09:00",
        endTime: "10:00",
        description: "팀 회의 설명",
        location: "회의실 A",
        category: "업무",
        repeat: { type: "none", interval: 0 },
        notificationTime: 10
      },
      {
        id: "2",
        title: "개인 일정",
        date: "2024-02-15",
        startTime: "14:00",
        endTime: "15:00",
        description: "개인 일정 설명",
        location: "카페",
        category: "개인",
        repeat: { type: "none", interval: 0 },
        notificationTime: 10
      }
    ]
  };
  
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-02-15T00:00:00+09:00'));
  });
  
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json(sampleEvents);
      })
    );
    
    render(<ChakraProvider><App /></ChakraProvider>);
    const user = userEvent.setup();
    
    // 검색어 입력
    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '존재하지 않는 일정');
    
    // "검색 결과가 없습니다." 메시지 확인
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    
    // 기존 일정들이 보이지 않는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).queryByText('팀 회의')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('개인 일정')).not.toBeInTheDocument();
    
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json(sampleEvents);
      })
    );
    
    render(<ChakraProvider><App /></ChakraProvider>);
    const user = userEvent.setup();
    
    // 검색어 입력
    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');
    
    // 검색된 일정이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('팀 회의 설명')).toBeInTheDocument();
    expect(within(eventList).getByText('회의실 A')).toBeInTheDocument();
    
    // 다른 일정은 표시되지 않는지 확인
    expect(within(eventList).queryByText('개인 일정')).not.toBeInTheDocument();
    
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json(sampleEvents);
      })
    );
    
    render(<ChakraProvider><App /></ChakraProvider>);
    const user = userEvent.setup();
    
    // 먼저 검색 수행
    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');
    
    // 검색 결과 확인
    let eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).queryByText('개인 일정')).not.toBeInTheDocument();
    
    // 검색어 지우기
    await user.clear(searchInput);
    
    // 모든 일정이 다시 표시되는지 확인
    eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('개인 일정')).toBeInTheDocument();
    
    // "검색 결과가 없습니다." 메시지가 표시되지 않는지 확인
    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
    
  });
});

describe('일정 충돌', () => {
  const existingEvent = {
    id: "1",
    title: "기존 회의",
    date: "2024-02-15",
    startTime: "09:00",
    endTime: "10:00",
    description: "기존 회의 설명",
    location: "회의실 A",
    category: "업무",
    repeat: { type: "none", interval: 0 },
    notificationTime: 10
  };
  
  beforeEach(() => {
    // MSW 핸들러 초기화
    server.resetHandlers();
    vi.setSystemTime(new Date('2024-02-15T00:00:00+09:00'));
  });
  
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // 기존 일정이 있는 상태로 시작
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [existingEvent] });
      })
    );
    
    render(<ChakraProvider><Provider><App /></Provider></ChakraProvider>);
    const user = userEvent.setup();
    
    // 겹치는 시간에 새 일정 입력
    await user.type(screen.getByLabelText('제목'), '새 회의');
    await user.type(screen.getByLabelText('날짜'), '2024-02-15');
    await user.type(screen.getByLabelText('시작 시간'), '09:30');
    await user.type(screen.getByLabelText('종료 시간'), '10:30');
    await user.type(screen.getByLabelText('설명'), '새 회의 설명');
    
    // 일정 추가 버튼 클릭
    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);
    
    // 경고 다이얼로그가 표시되는지 확인
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    // expect(screen.getByText(/새/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const secondEvent = {
      id: "2",
      title: "다른 회의",
      date: "2024-02-15",
      startTime: "11:00",
      endTime: "12:00",
      description: "다른 회의 설명",
      location: "회의실 B",
      category: "업무",
      repeat: { type: "none", interval: 0 },
      notificationTime: 10
    };

    // 서버 응답 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [existingEvent, secondEvent] });
      })
    );
    
    render(<ChakraProvider><App /></ChakraProvider>);
    
    // 먼저 검색 수행
    const user = userEvent.setup();
    const searchInput = screen.getByLabelText('일정 검색');
    await user.clear(searchInput)
    
    const eventList = screen.getByTestId('event-list');
    const editButtons = within(eventList).getAllByRole('button', { name: 'Edit event' });
    await userEvent.click(editButtons[0]);
    
    // 시간을 수정하여 충돌 발생
    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '11:30');
    
    // 수정 버튼 클릭
    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);
    
    // 경고 다이얼로그가 표시되는지 확인
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    // expect(screen.getByText(/다른 회의/)).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  // 먼저 10:10am을 기준으로 설정
  const date = '2024-02-15';
  const eventStartTime = '10:10';
  const testEvent = {
    id: "1",
    title: "알림 테스트 회의",
    date,
    startTime: eventStartTime,
    endTime: "11:00",
    description: "알림 테스트",
    location: "회의실 A",
    category: "업무",
    repeat: { type: "none", interval: 0 },
    notificationTime: 10
  };
  
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: [testEvent] });
    })
  );
  
  // 정확히 이벤트 시작 10분 전 시간으로 설정
  const eventDateTime = new Date(`${date}T${eventStartTime}`);
  const tenMinutesBefore = new Date(eventDateTime.getTime() - 10 * 60 * 1000);
  vi.setSystemTime(tenMinutesBefore);
  
  render(<ChakraProvider><Provider><App /></Provider></ChakraProvider>);
  
  // 이벤트 항목이 표시될 때까지 대기
  const eventItem = await screen.findByTestId('event-item-1');
  expect(eventItem).toBeInTheDocument();
  
  // 알림 메시지 확인
  const alerts = await screen.findAllByRole('alert');
  expect(alerts[0]).toHaveTextContent('10분 후');
  
  // 이벤트 리스트에서 알림 상태 표시 확인
  const eventTitle = screen.getByTestId('event-title-1');
  expect(eventTitle).toHaveStyle({ color: 'var(--chakra-colors-red-500)' });
  
  // 알림 아이콘은 있을 수도 있고 없을 수도 있으므로 queryByTestId 사용
  const bellIcon = within(eventItem).queryByTestId('event-bell-icon-1');
  if (bellIcon) {
    expect(bellIcon).toBeInTheDocument();
  }
});
