// 현재 월 기준 샘플 데이터 생성기

// 샘플 이벤트 템플릿
const eventTemplates = [
  { title: '곰 입식 준비', category: 'gom입식and개소' },
  { title: '외부업체 미팅', category: '외부업체방문' },
  { title: '인사 발령', category: '인사' },
  { title: 'MOU 체결', category: '협약MOU' },
  { title: '시설 점검', category: '조달설치' },
  { title: '현장 시공', category: '출장시공' },
  { title: '안전 교육', category: '인사' },
  { title: '장비 설치', category: '조달설치' },
  { title: '협력업체 방문', category: '외부업체방문' },
  { title: '곰 건강 검진', category: 'gom입식and개소' }
];

// 현재 월 기준 샘플 데이터 생성
async function generateSampleDataForCurrentMonth() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  console.log(`📊 ${currentYear}년 ${currentMonth}월 샘플 데이터 생성 중...`);

  // 현재 월에 해당하는 기존 샘플 데이터 확인
  try {
    const existingEvents = await loadEvents();

    // 현재 월의 샘플 데이터가 있는지 확인
    const currentMonthEvents = existingEvents.filter(event => {
      if (!event.date_value) return false;
      const [eventYear, eventMonth] = event.date_value.split('-').map(Number);
      return eventYear === currentYear && eventMonth === currentMonth;
    });

    if (currentMonthEvents.length > 0) {
      console.log(`✅ ${currentYear}년 ${currentMonth}월 데이터 이미 존재 (${currentMonthEvents.length}개)`);
      return;
    }

    // 샘플 데이터 생성
    const sampleEvents = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // 랜덤하게 5-8개의 이벤트 생성
    const eventCount = Math.floor(Math.random() * 4) + 5; // 5~8개
    const usedDays = new Set();

    for (let i = 0; i < eventCount; i++) {
      let day;
      do {
        day = Math.floor(Math.random() * daysInMonth) + 1;
      } while (usedDays.has(day));

      usedDays.add(day);

      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const monthStr = String(currentMonth).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateValue = `${currentYear}-${monthStr}-${dayStr}`;

      sampleEvents.push({
        date_value: dateValue,
        year: currentYear,
        month: currentMonth,
        day: day,
        title: template.title,
        category: template.category
      });
    }

    // 날짜순 정렬
    sampleEvents.sort((a, b) => a.day - b.day);

    console.log(`🎲 생성할 샘플 데이터 (${sampleEvents.length}개):`, sampleEvents);

    // 샘플 데이터 저장
    for (const event of sampleEvents) {
      try {
        await saveEvent(event.date_value, event.title, event.category, null, event.year, event.month, event.day);
        console.log(`✅ 샘플 데이터 저장: ${event.date_value} - ${event.title}`);
      } catch (error) {
        console.error(`❌ 샘플 데이터 저장 실패: ${event.date_value}`, error);
      }
    }

    console.log(`🎉 ${currentYear}년 ${currentMonth}월 샘플 데이터 생성 완료`);

  } catch (error) {
    console.error('❌ 샘플 데이터 생성 중 오류:', error);
  }
}

// 페이지 로드 시 샘플 데이터 확인 및 생성
document.addEventListener('DOMContentLoaded', async () => {
  // 데이터베이스 연결 후 샘플 데이터 확인
  setTimeout(() => {
    if (typeof generateSampleDataForCurrentMonth === 'function') {
      generateSampleDataForCurrentMonth();
    }
  }, 2000); // 2초 후 실행 (데이터베이스 초기화 완료 후)
});

// 전역 함수로 노출
window.generateSampleDataForCurrentMonth = generateSampleDataForCurrentMonth;