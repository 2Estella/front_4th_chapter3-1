import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSearch } from '@/hooks/useSearch';
import { Event } from '@/types';

describe('useSearch', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      description: '프로젝트 진행 상황 공유',
      location: '회의실 A',
      date: '2024-10-15',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 식사',
      description: '팀 회식',
      location: '식당',
      date: '2024-10-15',
      startTime: '12:00',
      endTime: '13:00',
      category: '회식',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
    {
      id: '3',
      title: '고객 미팅',
      description: '신규 프로젝트 논의',
      location: '회의실 B',
      date: '2024-10-20',
      startTime: '14:00',
      endTime: '15:00',
      category: '미팅',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ];

  const currentDate = new Date('2024-10-15');

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    expect(result.current.filteredEvents).toEqual(mockEvents);
    expect(result.current.searchTerm).toBe('');
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents[0].title).toBe('팀 회의');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회');
    });

    const filtered = result.current.filteredEvents;
    expect(filtered).toHaveLength(3);
    expect(filtered.some((event) => event.title === '팀 회의')).toBe(true);
    expect(filtered.some((event) => event.description === '팀 회식')).toBe(true);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents.every((event) => event.date === '2024-10-15')).toBe(true);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents[0].title).toBe('팀 회의');

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents[0].title).toBe('점심 식사');
  });

  // 추가 케이스
  it('검색어가 대소문자 구분 없이 필터링 되어야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의실 a');
    });

    expect(result.current.filteredEvents).toHaveLength(1);

    act(() => {
      // 대소문자 변경
      result.current.setSearchTerm('회의실 a'.toUpperCase());
    });

    expect(result.current.filteredEvents).toHaveLength(1);
  });
});
