import { describe, expect, it } from 'vitest';

import { Event } from '@/types';
import { createNotificationMessage, getUpcomingEvents } from '@/utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '곧 시작할 회의',
      description: '회의 설명',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2024-10-01T09:30:00'); // 회의 시작 30분 전
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-10-01T09:30:00');
    const notifiedEvents = ['1'];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-10-01T09:00:00'); // 회의 시작 1시간 전
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-10-01T19:45:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      description: '회의 설명',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const message = createNotificationMessage(event);
    expect(message).toBe('30분 후 중요 회의 일정이 시작됩니다.');
  });
});
