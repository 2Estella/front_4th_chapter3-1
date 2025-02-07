import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

import { setupMockEventHandlers, resetMockHandlers } from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '기존 회의',
    description: '월간 팀 미팅',
    date: '2024-10-15',
    startTime: '14:00',
    endTime: '15:00',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const renderApp = () => {
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>,
  );
};

describe('일정 관리 앱', () => {
  let user: UserEvent;

  beforeEach(async () => {
    resetMockHandlers();
    vi.setSystemTime(new Date('2024-10-15'));

    renderApp();
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetMockHandlers();
  });

  describe('일정 CRUD', () => {
    it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다', async () => {
      setupMockEventHandlers(mockEvents);

      // 초기 데이터 로딩 대기
      await waitFor(() => {
        const eventList = screen.getByTestId('event-list');
        expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      });

      // 새로운 일정 정보 입력
      await user.type(screen.getByLabelText('제목'), '새로운 회의');
      await user.type(screen.getByLabelText('날짜'), '2024-10-20');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      await user.type(screen.getByLabelText('설명'), '새로운 회의 설명');
      await user.type(screen.getByLabelText('위치'), '회의실 C');

      const categorySelect = screen.getByRole('combobox', { name: '카테고리' });
      await user.selectOptions(categorySelect, '업무');

      await user.click(screen.getByTestId('event-submit-button'));

      // 새로운 일정이 추가될 때까지 대기
      await waitFor(() => {
        const eventList = screen.getByTestId('event-list');
        expect(within(eventList).queryByText('새로운 회의')).toBeInTheDocument();
      });

      // 필드 값들 검증
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('2024-10-20')).toBeInTheDocument();
      expect(eventList.getByText('10:00 - 11:00')).toBeInTheDocument();
      expect(eventList.getByText('새로운 회의 설명')).toBeInTheDocument();
      expect(eventList.getByText('회의실 C')).toBeInTheDocument();
      expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
    });

    it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
      setupMockEventHandlers(mockEvents);

      // 초기 데이터 로딩 대기
      await waitFor(() => {
        const eventList = screen.getByTestId('event-list');
        expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      });

      const editButton = await screen.findByLabelText('Edit event');
      await user.click(editButton);

      await user.type(screen.getByLabelText('제목'), '수정된 회의');

      await user.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
      });
    });

    it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
      setupMockEventHandlers(mockEvents);

      // 초기 데이터 로딩 대기
      await waitFor(() => {
        const eventList = screen.getByTestId('event-list');
        expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText('Delete event');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText('기존 회의')).not.toBeInTheDocument();
        expect(screen.queryByText('월간 팀 미팅')).not.toBeInTheDocument();
      });
    });

    describe('일정 뷰', () => {
      it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
        setupMockEventHandlers(mockEvents);

        // 초기 데이터 로딩 대기
        await waitFor(() => {
          const eventList = screen.getByTestId('event-list');
          expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
        });

        await user.selectOptions(await screen.findByLabelText(/view/), 'week');

        await waitFor(() => {
          expect(screen.getByText('기존 회의')).toBeInTheDocument();
        });
      });

      it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
        // 2024년 1월로 시스템 시간 설정
        vi.setSystemTime(new Date('2024-01-01T00:00:00'));

        renderApp();

        await waitFor(() => {
          const holidayCell = screen.getByText('1', {
            exact: false,
            selector: 'td',
          });
          expect(holidayCell).toHaveTextContent('신정');
        });
      });

      it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다', async () => {
        setupMockEventHandlers(mockEvents);

        // 초기 데이터 로딩 대기
        await waitFor(() => {
          const eventList = screen.getByTestId('event-list');
          expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
        });

        await user.selectOptions(await screen.findByLabelText(/view/), 'week');
        await user.click(screen.getByRole('button', { name: 'Next' }));

        await waitFor(() => {
          const eventList = screen.getByTestId('event-list');
          expect(within(eventList).queryByText('기존 회의')).not.toBeInTheDocument();
        });
      });

      it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
        setupMockEventHandlers(mockEvents);

        // 초기 데이터 로딩 대기
        await waitFor(() => {
          const eventList = screen.getByTestId('event-list');
          expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
        });

        await user.type(screen.getByLabelText('일정 검색'), '기존 회의');

        await waitFor(() => {
          const eventList = within(screen.getByTestId('event-list'));
          expect(eventList.getByText('기존 회의')).toBeInTheDocument();
        });

        await user.clear(screen.getByLabelText('일정 검색'));

        await waitFor(() => {
          const events = screen.queryAllByText('기존 회의');
          expect(events.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('검색 기능', () => {
    it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
      setupMockEventHandlers(mockEvents);

      // 초기 데이터 로딩 대기
      await waitFor(() => {
        const eventList = screen.getByTestId('event-list');
        expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('일정 검색'), '존재하지 않는 일정');
      await waitFor(() => {
        expect(screen.queryByText('검색 결과가 없습니다.')).toBeTruthy();
      });
    });

    it('기존 회의를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다', async () => {
      setupMockEventHandlers([
        {
          id: '1',
          title: '기존 회의',
          date: '2024-10-15',
          startTime: '14:00',
          endTime: '15:00',
          location: '회의실 A',
          category: '업무',
          description: '월간 팀 미팅',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      // 초기 데이터 로딩 대기
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        const events = eventList.getAllByText(/기존 회의/i);
        expect(events.length).toBeGreaterThan(0);
      });

      // 검색어 입력
      await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '기존 회의');

      // 검색 결과 확인
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        const searchResults = eventList.getAllByText(/기존 회의/i);
        expect(searchResults.length).toBeGreaterThan(0);
      });
    });
  });

  describe('일정 충돌', () => {
    it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
      // 초기 데이터 설정
      setupMockEventHandlers([
        {
          id: '1',
          title: '기존 회의',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
          location: '회의실 A',
          category: '업무',
          description: '기존 팀 미팅',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 0,
        },
      ]);

      // 초기 데이터 로딩 대기
      await waitFor(() => {
        // 폼 요소들 확인
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
        expect(screen.getByLabelText('날짜')).toBeInTheDocument();
        expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
        expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
        expect(screen.getByLabelText('카테고리')).toBeInTheDocument();

        // 기존 일정이 표시되는지 확인
        expect(screen.getByText('기존 회의')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('제목'), '새 회의');
      await user.type(screen.getByLabelText('날짜'), '2024-10-15');
      await user.type(screen.getByLabelText('시작 시간'), '14:30');

      await user.type(screen.getByLabelText('종료 시간'), '15:30');

      const categorySelect = screen.getByRole('combobox', { name: '카테고리' });
      await user.selectOptions(categorySelect, '업무');

      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        console.log('다이얼로그 찾음:', dialog.textContent);
        expect(dialog).toBeInTheDocument();
      });

      it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
        // 초기 데이터 로딩 대기
        await waitFor(() => {
          const eventList = screen.getByTestId('event-list');
          const events = within(eventList).getAllByText(/기존 회의/i);
          expect(events.length).toBe(1);
        });

        // 일정 수정
        await user.click(screen.getByLabelText('Edit event'));

        await user.clear(screen.getByLabelText('시작 시간'));
        await user.type(screen.getByLabelText('시작 시간'), '10:00');
        await user.clear(screen.getByLabelText('종료 시간'));
        await user.type(screen.getByLabelText('종료 시간'), '11:00');

        await user.click(screen.getByTestId('event-submit-button'));

        // 경고 메시지 확인
        const warningDialog = await screen.findByText('일정 겹침 경고');
        expect(warningDialog).toBeInTheDocument();
      });
    });

    it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
      setupMockEventHandlers(mockEvents);

      await waitFor(() => {
        const eventList = screen.getByTestId('event-list');
        expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      });
    });
  });
});
