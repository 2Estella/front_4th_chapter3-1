import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setupMockEventHandlers, resetMockHandlers } from '@/__mocks__/handlersUtils';
import { useEventOperations } from '@/hooks/useEventOperations';
import { server } from '@/setupTests';
import { Event } from '@/types';

// Toast 모킹
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

describe('useEventOperations', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      description: '기존 회의 설명',
      date: '2024-10-15',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  beforeEach(() => {
    setupMockEventHandlers(mockEvents);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMockHandlers();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    // 초기 로딩 완료 대기
    await vi.waitFor(() => {
      expect(result.current.events).toHaveLength(1);
    });

    expect(result.current.events[0]).toEqual(mockEvents[0]);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 로딩 완료!',
        status: 'info',
      }),
    );
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    const newEvent: Event = {
      id: '',
      title: '새로운 회의',
      description: '새로운 회의 설명',
      date: '2024-10-16',
      startTime: '14:00',
      endTime: '15:00',
      location: '회의실 B',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    expect(result.current.events).toHaveLength(2);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 추가되었습니다.',
        status: 'success',
      }),
    );
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const { result } = renderHook(() => useEventOperations(true));
    const updatedEvent = {
      ...mockEvents[0],
      title: '수정된 회의',
      endTime: '12:00',
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    expect(result.current.events[0].title).toBe('수정된 회의');
    expect(result.current.events[0].endTime).toBe('12:00');
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 수정되었습니다.',
        status: 'success',
      }),
    );
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await vi.waitFor(() => {
      expect(result.current.events).toHaveLength(1);
    });

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(result.current.events).toHaveLength(0);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 삭제되었습니다.',
        status: 'info',
      }),
    );
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(http.get('/api/events', () => new HttpResponse(null, { status: 500 })));

    renderHook(() => useEventOperations(false));

    await vi.waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '이벤트 로딩 실패',
          status: 'error',
        }),
      );
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const { result } = renderHook(() => useEventOperations(true));
    const nonExistentEvent = {
      ...mockEvents[0],
      id: '999',
    };

    await act(async () => {
      await result.current.saveEvent(nonExistentEvent);
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
      }),
    );
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    const { result } = renderHook(() => useEventOperations(false));

    server.use(http.delete('/api/events/:id', () => new HttpResponse(null, { status: 500 })));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
      }),
    );
  });
});
