import { setupServer } from 'msw/node';
import { beforeAll, beforeEach, afterAll, afterEach, expect, vi } from 'vitest';

import { handlers } from './__mocks__/handlers';

// MSW 서버 설정
export const server = setupServer(...handlers);

// 테스트 환경 설정
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-10-01T09:30'));
  server.listen();
});

// 각 테스트 케이스 시작 전 assertion 확인
beforeEach(() => {
  expect.hasAssertions();
});

// 각 테스트 케이스 종료 후 핸들러 초기화
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// 모든 테스트 종료 후 서버 종료
afterAll(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
  server.close();
});
