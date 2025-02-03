import { http, HttpResponse } from 'msw';

import {Event, EventForm} from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json(events);
  }),

  http.post('/api/events', async ({ request }) => {
    // try {
      const eventData: EventForm = await request.json();
      const newId = String(Math.max(...events.events.map(e => Number(e.id))) + 1);
      const newEvent: Event = {
        id: newId,
        ...eventData
      };
      // 실제 구현에서는 여기서 events 배열에 추가하는 로직이 필요
      return HttpResponse.json(newEvent, { status: 201 });
    // } catch (error) {
    //   return HttpResponse.json(
    //     { message: 'Invalid event data' },
    //     { status: 400 }
    //   );
    // }
  }),

  http.put('/api/events/:id', async ({request, params} : any) => {
    // try {
      const eventData: EventForm = await request.json();
      const eventId = params.id;
      
      // 이벤트 존재 여부 확인
      const eventExists = events.events.some(event => event.id === eventId);
      
      if (!eventExists) {
        return HttpResponse.json(
          { message: 'Event not found' },
          { status: 404 }
        );
      }
      
      const updatedEvent: Event = {
        id: eventId,
        ...eventData
      };
      
      return HttpResponse.json(updatedEvent);
    // } catch (error) {
    //   return HttpResponse.json(
    //     { message: 'Invalid event data' },
    //     { status: 400 }
    //   );
    // }
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const eventId = params.id;
    
    // 이벤트 존재 여부 확인
    const eventExists = events.events.some(event => event.id === eventId);
    
    if (!eventExists) {
      return HttpResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }
    
    return new HttpResponse(null, { status: 204 });
  }),
];
