import { describe, expect, it } from 'vitest';

import { Event } from '@/types';
import { getFilteredEvents } from '@/utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      description: '첫 번째 이벤트 설명',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: 'Very 중요한 미팅',
      description: '이벤트 2 설명',
      date: '2024-07-15',
      startTime: '14:00',
      endTime: '15:00',
      location: '성수동 회의실',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '팀 회의',
      description: '월간 팀 미팅',
      date: '2024-07-30',
      startTime: '11:00',
      endTime: '12:00',
      location: '뚝섬 회의실',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(2);
    expect(result.map((event) => event.id)).toEqual(['1', '2']);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'month');

    expect(result).toHaveLength(3);
    expect(result.map((event) => event.id)).toEqual(['1', '2', '3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07-15'), 'month');
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, 'VERY', new Date('2024-07-01'), 'month');

    expect(result).toHaveLength(1);
    expect(result.map((event) => event.id)).toEqual(['2']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-08-01'), 'month');
    expect(result).toHaveLength(0);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2024-07-01'), 'month');

    expect(result).toHaveLength(0);
  });

  it('설명에서 검색어를 찾을 수 있다', () => {
    const result = getFilteredEvents(mockEvents, '월간', new Date('2024-07-01'), 'month');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('위치에서 검색어를 찾을 수 있다', () => {
    const result = getFilteredEvents(mockEvents, '성수동', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('주간 뷰에서 해당 주에 이벤트가 없으면 빈 배열을 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-08-11'), 'week');
    expect(result).toHaveLength(0);
  });

  it('존재하지 않는 검색어에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents(
      mockEvents,
      '존재하지않는검색어',
      new Date('2024-07-01'),
      'month',
    );
    expect(result).toHaveLength(0);
  });
});
