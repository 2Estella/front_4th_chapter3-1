import { describe, expect, it } from 'vitest';

import { Event } from '@/types';
import {
  parseDateTime,
  convertEventToDateRange,
  isOverlapping,
  findOverlappingEvents,
} from '@/utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2024-07-01', '14:30');
    expect(result).toEqual(new Date('2024-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('invalid-date', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024-07-01', 'invalid-time');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      description: '팀 미팅',
      date: '2024-07-01',
      startTime: '14:30',
      endTime: '15:30',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);
    expect(result.start).toEqual(new Date('2024-07-01T14:30'));
    expect(result.end).toEqual(new Date('2024-07-01T15:30'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      description: '팀 미팅',
      date: 'invalid-date',
      startTime: '14:30',
      endTime: '15:30',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);

    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      description: '팀 미팅',
      date: '2024-07-01',
      startTime: 'invalid-time',
      endTime: '15:30',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const event1: Event = {
    id: '1',
    title: '회의 1',
    description: '첫 번째 회의',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    location: '회의실 A',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event2: Event = {
      ...event1,
      id: '2',
      startTime: '15:00',
      endTime: '16:00',
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event2: Event = {
      ...event1,
      id: '2',
      startTime: '16:00',
      endTime: '17:00',
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });

  it('한 이벤트가 다른 이벤트를 완전히 포함하는 경우 true를 반환한다', () => {
    const event2: Event = {
      ...event1,
      id: '2',
      startTime: '14:00',
      endTime: '16:00',
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트의 시작 시간이 같은 경우 true를 반환한다', () => {
    const event2: Event = {
      ...event1,
      id: '2',
      startTime: '14:30',
      endTime: '16:00',
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });
});

describe('findOverlappingEvents', () => {
  const existingEvents: Event[] = [
    {
      id: '1',
      title: '회의 1',
      description: '첫 번째 회의',
      date: '2024-07-01',
      startTime: '14:30',
      endTime: '15:30',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '회의 2',
      description: '두 번째 회의',
      date: '2024-07-01',
      startTime: '16:00',
      endTime: '17:00',
      location: '회의실 B',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      title: '새 회의',
      description: '새로운 회의',
      date: '2024-07-01',
      startTime: '15:00',
      endTime: '16:30',
      location: '회의실 C',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    expect(overlappingEvents).toHaveLength(2);
    expect(overlappingEvents.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      title: '새 회의',
      description: '새로운 회의',
      date: '2024-07-01',
      startTime: '18:00',
      endTime: '19:00',
      location: '회의실 C',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);
    expect(overlappingEvents).toHaveLength(0);
  });

  it('자기 자신은 겹치는 이벤트에서 제외한다', () => {
    const newEvent: Event = {
      ...existingEvents[0],
      startTime: '15:00',
      endTime: '16:30',
    };

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    expect(overlappingEvents).toHaveLength(1);
    expect(overlappingEvents[0].id).toBe('2');
  });
});
