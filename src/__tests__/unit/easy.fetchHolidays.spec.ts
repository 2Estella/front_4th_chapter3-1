import { describe, expect, it } from 'vitest';

import { fetchHolidays } from '@/apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const result = fetchHolidays(new Date('2024-02-01'));
    expect(result).toEqual({
      '2024-02-09': '설날',
      '2024-02-10': '설날',
      '2024-02-11': '설날',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const result = fetchHolidays(new Date('2024-04-01'));
    expect(result).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const result = fetchHolidays(new Date('2024-09-01'));
    expect(result).toEqual({
      '2024-09-16': '추석',
      '2024-09-17': '추석',
      '2024-09-18': '추석',
    });
  });
});
