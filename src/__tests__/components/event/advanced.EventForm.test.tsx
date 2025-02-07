import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventForm } from '@/components/event/EventForm';

describe('EventForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnChange = vi.fn();

  const defaultFormData = {
    title: '',
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    isRepeating: false,
    repeatType: 'daily',
    repeatInterval: 1,
    repeatEndDate: '2024-03-27',
    notificationTime: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('필수 입력 필드가 모두 렌더링된다', () => {
    render(
      <EventForm
        formData={defaultFormData}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
        isEditing={false}
      />,
    );

    expect(screen.getByRole('textbox', { name: '제목' })).toBeInTheDocument();
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
  });

  it('선택 입력 필드가 모두 렌더링된다', () => {
    render(
      <EventForm
        formData={defaultFormData}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
        isEditing={false}
      />,
    );

    expect(screen.getByRole('textbox', { name: '설명' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '위치' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '카테고리' })).toBeInTheDocument();
    expect(screen.getByText('반복 일정')).toBeInTheDocument();
  });

  // TODO
  // it('입력값 변경 시 onChange가 호출된다', async () => {
  // });
  // it('반복 일정 체크박스 토글 시 관련 필드가 표시/숨김된다', async () => {
  // });
  // it('시작/종료 시간 에러가 표시된다', () => {
  // });
  // it('제출 버튼 텍스트가 isEditing에 따라 변경된다', () => {
  // });
  // it('알림 설정이 정상적으로 동작한다', async () => {
  // });
});
