import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  beforeAll(() => {
    // 테스트에서 한국 시간대 사용을 위한 설정
    process.env.TZ = 'Asia/Seoul';
  });
  
  it('주어진 월의 공휴일만 반환한다', () => {
    // 1월의 공휴일 테스트
    const januaryDate = new Date('2024-01-15');
    const januaryHolidays = fetchHolidays(januaryDate);
    
    expect(januaryHolidays).toEqual({
      '2024-01-01': '신정'
    });
    expect(januaryHolidays).toEqual({
      '2024-01-01': '신정'
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    // 4월은 공휴일이 없음
    const aprilDate = new Date('2024-04-15');
    const aprilHolidays = fetchHolidays(aprilDate);
    
    expect(aprilHolidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    // 9월은 추석 연휴로 3일의 공휴일이 있음
    const septemberDate = new Date('2024-09-15');
    const septemberHolidays = fetchHolidays(septemberDate);
    
    expect(septemberHolidays).toEqual({
      '2024-09-16': '추석',
      '2024-09-17': '추석',
      '2024-09-18': '추석'
    });
    
    // 10월은 개천절, 한글날 있음
    const octoberDate = new Date('2024-10-15');
    const octoberHolidays = fetchHolidays(octoberDate);
    
    expect(octoberHolidays).toEqual({
      '2024-10-03': '개천절',
      '2024-10-09': '한글날',
    });
  });
});
