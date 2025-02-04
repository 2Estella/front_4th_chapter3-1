import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotifications } from '@/hooks/useNotifications';
import { Event } from '@/types';
import { createNotificationMessage } from '@/utils/notificationUtils';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-10-01T09:49:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));
    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    expect(result.current.notifications).toEqual([]);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      { id: '1', message: createNotificationMessage(mockEvents[0]) },
    ]);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      { id: '1', message: createNotificationMessage(mockEvents[0]) },
    ]);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const notification = [{ id: '1', message: createNotificationMessage(mockEvents[0]) }];

    expect(result.current.notifications).toEqual(notification);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual(notification);
  });

  it('알림 시간이 지난 이벤트는 알림이 생성되지 않아야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const notification = [{ id: '1', message: createNotificationMessage(mockEvents[0]) }];

    expect(result.current.notifications).toEqual(notification);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual(notification);
  });
});
