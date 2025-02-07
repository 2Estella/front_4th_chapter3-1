import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

import { OverlapDialog } from '@/components/common/OverlapDialog';
import { Event } from '@/types';

describe('OverlapDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();
  const mockCancelRef = { current: null };

  const overlappingEvents: Event[] = [
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
    {
      id: '2',
      title: '다른 회의',
      description: '미팅',
      date: '2024-10-15',
      startTime: '14:30',
      endTime: '15:30',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) =>
    render(<ChakraProvider>{component}</ChakraProvider>);

  it('다이얼로그가 열리면 겹치는 일정 목록이 표시된다', async () => {
    renderWithProvider(
      <OverlapDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        overlappingEvents={overlappingEvents}
        cancelRef={mockCancelRef}
      />,
    );

    // role로 다이얼로그 찾기
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toBeInTheDocument();

    // 다이얼로그 내용 확인
    const header = await within(dialog).findByRole('heading', { name: '일정 겹침 경고' });
    expect(header).toBeInTheDocument();

    // 일정 정보 확인
    expect(within(dialog).getByText(/기존 회의/)).toBeInTheDocument();
    expect(within(dialog).getByText(/다른 회의/)).toBeInTheDocument();
    expect(within(dialog).getByText(/2024-10-15 14:00-15:00/)).toBeInTheDocument();
    expect(within(dialog).getByText(/2024-10-15 14:30-15:30/)).toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <OverlapDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        overlappingEvents={overlappingEvents}
        cancelRef={mockCancelRef}
      />,
    );

    const dialog = await screen.findByRole('alertdialog');
    const cancelButton = within(dialog).getByRole('button', { name: '취소' });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('계속 진행 버튼 클릭 시 onConfirm이 호출된다', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <OverlapDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        overlappingEvents={overlappingEvents}
        cancelRef={mockCancelRef}
      />,
    );

    const dialog = await screen.findByRole('alertdialog');
    const confirmButton = within(dialog).getByRole('button', { name: '계속 진행' });
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('다이얼로그가 닫힌 상태에서는 내용이 보이지 않는다', async () => {
    renderWithProvider(
      <OverlapDialog
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        overlappingEvents={overlappingEvents}
        cancelRef={mockCancelRef}
      />,
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('겹치는 일정이 없을 때 빈 목록이 표시된다', async () => {
    renderWithProvider(
      <OverlapDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        overlappingEvents={[]}
        cancelRef={mockCancelRef}
      />,
    );

    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(within(dialog).getByText('다음 일정과 겹칩니다:')).toBeInTheDocument();
    expect(within(dialog).queryByText(/\d{2}:\d{2}-\d{2}:\d{2}/)).not.toBeInTheDocument();
  });
});
