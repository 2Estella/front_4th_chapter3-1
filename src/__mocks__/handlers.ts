import { http, HttpResponse } from 'msw';

import { events } from '@/__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '@/types';

// 가변 상태 유지
let mockEvents = [...events];

/**
 * 이벤트 관련 핸들러
 */
export const handlers = [
  // 이벤트 조회
  http.get('/api/events', () => HttpResponse.json({ events: mockEvents })),

  // 이벤트 추가
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;

    // 새로운 ID 생성 (가장 큰 ID +1)
    const maxId = mockEvents.length ? Math.max(...mockEvents.map((e) => Number(e.id))) : 0;
    newEvent.id = String(maxId + 1);

    mockEvents.push(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  // 이벤트 업데이트
  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = mockEvents.findIndex((event) => event.id === id);

    if (index !== -1) {
      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    }

    return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
  }),

  // 이벤트 삭제
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = mockEvents.findIndex((event) => event.id === id);

    if (index !== -1) {
      mockEvents = mockEvents.filter((event) => event.id !== id);
      return HttpResponse.json(null, { status: 204 });
    }

    return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
  }),
];
