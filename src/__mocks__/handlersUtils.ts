import {Event, EventForm} from '../types';
import {http, HttpResponse} from "msw";

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  let events = [...initEvents];
  
  return {
    handler: async ({ request }) => {
      try {
        const eventData: EventForm = await request.json();
        
        // 새 이벤트 ID 생성
        const newId = String(
          events.length > 0
            ? Math.max(...events.map(e => Number(e.id))) + 1
            : 1
        );
        
        const newEvent: Event = {
          id: newId,
          ...eventData
        };
        
        events.push(newEvent);
        return HttpResponse.json(newEvent, { status: 201 });
      } catch (error) {
        return HttpResponse.json(
          { message: 'Invalid event data' },
          { status: 400 }
        );
      }
    },
    getEvents: () => events,
    reset: () => {
      events = [...initEvents];
    }
  };
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  let events = [...initEvents];
  
  return {
    handler: async ({ request, params }: { request: Request; params: { id: string } }) => {
      console.log("request", request);
      console.log("params", params)
      try {
        const eventData: EventForm = await request.json();
        const eventId = params.id;
        
        const eventIndex = events.findIndex(event => event.id === eventId);
        
        if (eventIndex === -1) {
          return HttpResponse.json(
            { message: 'Event not found' },
            { status: 404 }
          );
        }
        
        const updatedEvent: Event = {
          id: eventId,
          ...eventData
        };
        
        events[eventIndex] = updatedEvent;
        return HttpResponse.json(updatedEvent);
      } catch (error) {
        return HttpResponse.json(
          { message: 'Invalid event data' },
          { status: 400 }
        );
      }
    },
    getEvents: () => events,
    getEventById: (id: string) => events.find(event => event.id === id),
    reset: () => {
      events = [...initEvents];
    }
  };
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  let events = [...initEvents];
  
  return {
    handler: async ({ params }: { params: { id: string } }) => {
      const eventId = params.id;
      const eventIndex = events.findIndex(event => event.id === eventId);
      
      if (eventIndex === -1) {
        return HttpResponse.json(
          {message: 'Event not found'},
          {status: 404}
        );
      }
      
      events.splice(eventIndex, 1);
      return new HttpResponse(null, {status: 204});
    },
    getEvents: () => events,
    getEventById: (id: string) => events.find(event => event.id === id),
    reset: () => {
      events = [...initEvents];
    }
  };
}
