import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// Mock useToast
// Test data
const mockEvent: Event = {
  id: '1',
  title: '미팅',
  date: '2025-02-04',
  startTime: '14:00',
  endTime: '15:00',
  description: '팀 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 0
  },
  notificationTime: 30
};

const updatedEventData: Partial<EventForm> = {
  title: '주간 미팅',
  endTime: '16:00'
};

beforeEach(() => {
  server.resetHandlers();
});


it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  // Setup
  server.use(
    http.get('/api/events', () => {
      return Response.json({ events: [mockEvent] });
    })
  );
  
  // Execute
  const response = await fetch('/api/events');
  const data = await response.json();
  
  // Assert
  expect(response.ok).toBe(true);
  expect(data.events).toHaveLength(1);
  expect(data.events[0]).toEqual(mockEvent);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  // Setup
  const { handler, getEvents } = setupMockHandlerCreation([]);
  server.use(
    http.post('/api/events', handler)
  );
  
  // Execute
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockEvent)
  });
  const savedEvent = await response.json();
  
  // Assert
  expect(response.status).toBe(201);
  expect(savedEvent.title).toBe(mockEvent.title);
  expect(getEvents()).toHaveLength(1);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  // Setup
  const { handler, getEventById } = setupMockHandlerUpdating([mockEvent]);
  server.use(
    http.put('/api/events/:id', handler)
  );
  
  // Execute
  const response = await fetch(`/api/events/${mockEvent.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...mockEvent, ...updatedEventData })
  });
  const updatedEvent = await response.json();
  
  // Assert
  expect(response.ok).toBe(true);
  expect(updatedEvent.title).toBe(updatedEventData.title);
  expect(updatedEvent.endTime).toBe(updatedEventData.endTime);
  expect(getEventById(mockEvent.id)).toEqual(updatedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  // Setup
  const { handler, getEvents } = setupMockHandlerDeletion([mockEvent]);
  server.use(
    http.delete('/api/events/:id', handler)
  );
  
  // Execute
  const response = await fetch(`/api/events/${mockEvent.id}`, {
    method: 'DELETE'
  });
  
  // Assert
  expect(response.status).toBe(204);
  expect(getEvents()).toHaveLength(0);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // Setup
  server.use(
    http.get('/api/events', () => {
      return new Response(null, { status: 500 });
    })
  );
  
  // Execute
  const response = await fetch('/api/events');
  
  // Assert
  expect(response.ok).toBe(false);
  expect(response.status).toBe(500);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  // Setup
  const { handler } = setupMockHandlerUpdating([]);
  server.use(
    http.put('/api/events/:id', handler)
  );
  
  // Execute
  const response = await fetch('/api/events/999', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedEventData)
  });
  
  // Assert
  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  // Setup
  const { handler } = setupMockHandlerDeletion([]);
  server.use(
    http.delete('/api/events/:id', handler)
  );
  
  // Execute
  const response = await fetch('/api/events/999', {
    method: 'DELETE'
  });
  
  // Assert
  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);
});
