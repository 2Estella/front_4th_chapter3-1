import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '@/types';

/**
 * 이벤트 관련 작업을 처리하는 훅
 * @param editing 편집 중인지 여부
 * @param onSave 이벤트 저장 후 호출될 함수
 * @returns 이벤트 목록, 이벤트 로드 함수, 이벤트 저장 함수, 이벤트 삭제 함수
 */
export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  // 이벤트 목록 상태
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  // 이벤트 목록을 서버에서 가져오는 함수
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 이벤트 저장 또는 수정 함수
  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      // 편집 중인 경우 PUT 요청, 새 이벤트 추가는 POST 요청
      if (editing) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      // 저장 후 이벤트 목록을 다시 불러옴
      await fetchEvents();
      onSave?.();
      toast({
        title: editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 이벤트 삭제 함수
  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' }); // 삭제 요청

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents(); // 삭제 후 이벤트 목록을 다시 불러옴
      toast({
        title: '일정이 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 컴포넌트 초기화 함수 (이벤트 목록 로딩)
  async function init() {
    await fetchEvents();
    toast({
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    });
  }

  useEffect(() => {
    init(); // 컴포넌트가 마운트되면 이벤트 목록을 가져옴
  }, []);

  // 훅에서 반환할 값들
  return { events, fetchEvents, saveEvent, deleteEvent };
};
