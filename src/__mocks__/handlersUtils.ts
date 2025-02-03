import { http, HttpResponse } from 'msw';

import { server } from '@/setupTests';
import { Event } from '@/types';

/**
 * 이벤트 상태를 관리하는 함수
 * @param initEvents 초기 이벤트 목록
 * @returns 이벤트 상태 관리 객체
 */
const createMockEventStore = (initEvents: Event[] = []) => {
  let mockEvents = [...initEvents];

  return {
    // 이벤트 조회
    getEvents: () => mockEvents,

    // 이벤트 추가
    addEvent: (newEvent: Event) => {
      const maxId = Math.max(...mockEvents.map((e) => parseInt(e.id, 10)), 0);

      newEvent.id = String(maxId + 1);
      mockEvents.push(newEvent);

      return newEvent;
    },

    // 이벤트 업데이트
    updateEvent: (id: string, updatedEvent: Event) => {
      const index = mockEvents.findIndex((event) => event.id === id);

      if (index === -1) {
        return new HttpResponse('Event not found', { status: 404 });
      }
      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };

      return mockEvents[index];
    },

    // 이벤트 삭제
    deleteEvent: (id: string) => {
      const index = mockEvents.findIndex((event) => event.id === id);

      if (index === -1) {
        return new HttpResponse('Event not found', { status: 404 });
      }
      mockEvents = mockEvents.filter((event) => event.id !== id);

      return id;
    },

    // 이벤트 초기화
    reset: () => {
      mockEvents = [...initEvents];
    },
  };
};

/**
 * 이벤트 핸들러 설정
 * @param eventStore 이벤트 상태 관리 객체
 * @returns 이벤트 핸들러 목록
 */
const createEventHandlers = (eventStore: ReturnType<typeof createMockEventStore>) => [
  // 이벤트 조회
  http.get('/api/events', () => HttpResponse.json({ events: eventStore.getEvents() })),

  // 이벤트 추가
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;

    return HttpResponse.json(eventStore.addEvent(newEvent), { status: 201 });
  }),

  // 이벤트 업데이트
  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const result = eventStore.updateEvent(id as string, updatedEvent);

    return result instanceof HttpResponse ? result : HttpResponse.json(result);
  }),

  // 이벤트 삭제
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const deletedId = eventStore.deleteEvent(id as string);

    return deletedId instanceof HttpResponse ? deletedId : new HttpResponse(null, { status: 204 });
  }),

  // 이벤트 초기화
  http.delete('/api/events', () => {
    eventStore.reset();
    return new HttpResponse(null, { status: 204 });
  }),
];

/**
 * 이벤트 핸들러 설정
 * @param initEvents 초기 이벤트 목록
 */
export const setupMockEventHandlers = (initEvents: Event[] = []): void => {
  const eventStore = createMockEventStore(initEvents);

  server.use(...createEventHandlers(eventStore));
};

/**
 * 이벤트 핸들러 초기화
 */
export const resetMockHandlers = (): void => {
  server.resetHandlers();
};
