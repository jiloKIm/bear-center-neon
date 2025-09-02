// 사육곰 센터 일정 관리 시스템 - 데이터베이스 연결

const API_URL = '/.netlify/functions/calendar-api';

// 항상 Neon 데이터베이스 사용
function isProduction() {
  return true; // 무조건 Neon DB 사용
}

// 데이터베이스 초기화
async function initDatabase() {
  console.log('🔄 데이터베이스 초기화 중...');
  
  console.log('🌐 Neon PostgreSQL 데이터베이스 전용 모드');
  return await testConnection();
}

// 연결 테스트
async function testConnection() {
  try {
    const response = await fetch('/.netlify/functions/hello');
    if (response.ok) {
      console.log('✅ Netlify Functions 연결 성공');
      return true;
    } else {
      console.error('❌ Netlify Functions 연결 실패');
      return false;
    }
  } catch (error) {
    console.error('❌ API 연결 실패:', error.message);
    console.log('🔄 로컬 개발 환경 감지, localStorage 사용');
    return false;
  }
}

// 일정 저장
async function saveEvent(date, title, category, eventId = null) {
  console.log('💾 일정 저장 시작:', { date, title, category, eventId });
  
  try {
    const connected = await testConnection();
    if (connected) {
      return await saveToDatabase(date, title, category, eventId);
    } else {
      console.log('📱 연결 실패 - localStorage 사용');
      return await saveToLocalStorage(date, title, category, eventId);
    }
  } catch (error) {
    console.error('❌ 데이터베이스 저장 실패, localStorage로 대체:', error);
    return await saveToLocalStorage(date, title, category, eventId);
  }
}

// 데이터베이스에 저장
async function saveToDatabase(date, title, category, eventId = null) {
  const method = eventId ? 'PUT' : 'POST';
  const body = eventId 
    ? { id: eventId, title, category }
    : { date_value: date, title, category };

  console.log('🌐 API 호출:', { method, body });

  const response = await fetch(API_URL, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 에러 (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ 데이터베이스 저장 성공:', result);
  
  return result;
}

// localStorage에 저장
async function saveToLocalStorage(date, title, category, eventId = null) {
  const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
  
  if (eventId) {
    const index = events.findIndex(e => e.id == eventId);
    if (index !== -1) {
      events[index] = { ...events[index], title, category };
    }
  } else {
    events.push({
      id: Date.now(),
      date_value: date,
      title,
      category,
      created_at: new Date().toISOString()
    });
  }
  
  localStorage.setItem('calendarEvents', JSON.stringify(events));
  console.log('✅ localStorage 저장 성공');
  
  return events[events.length - 1] || { id: Date.now(), date_value: date, title, category };
}

// 일정 삭제
async function deleteEvent(eventId) {
  console.log('🗑️ 일정 삭제:', eventId);
  
  try {
    const connected = await testConnection();
    if (connected) {
      return await deleteFromDatabase(eventId);
    } else {
      console.log('📱 연결 실패 - localStorage 사용');
      return await deleteFromLocalStorage(eventId);
    }
  } catch (error) {
    console.error('❌ 데이터베이스 삭제 실패, localStorage로 대체:', error);
    return await deleteFromLocalStorage(eventId);
  }
}

// 데이터베이스에서 삭제
async function deleteFromDatabase(eventId) {
  const response = await fetch(API_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: eventId })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 에러 (${response.status}): ${errorText}`);
  }
  
  console.log('✅ 데이터베이스 삭제 성공');
}

// localStorage에서 삭제
async function deleteFromLocalStorage(eventId) {
  const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
  const filtered = events.filter(e => e.id != eventId);
  localStorage.setItem('calendarEvents', JSON.stringify(filtered));
  console.log('✅ localStorage 삭제 성공');
  loadEventsFromStorage();
}

// 일정 불러오기
async function loadEvents() {
  console.log('📋 일정 불러오기 시작...');
  
  try {
    const connected = await testConnection();
    if (connected) {
      return await loadFromDatabase();
    } else {
      console.log('📱 연결 실패 - localStorage 사용');
      return loadEventsFromStorage();
    }
  } catch (error) {
    console.error('❌ 일정 불러오기 실패:', error);
    console.log('📱 백업: localStorage 사용');
    return loadEventsFromStorage();
  }
}

// 데이터베이스에서 불러오기
async function loadFromDatabase() {
  console.log('🌐 API 호출 시작:', API_URL);
  const response = await fetch(API_URL);
  
  console.log('📡 API 응답 상태:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API 응답 에러:', errorText);
    throw new Error(`API 에러 (${response.status}): ${errorText}`);
  }
  
  const events = await response.json();
  console.log('✅ 데이터베이스에서 로드:', events.length, '개');
  console.log('📊 데이터 샘플:', events.slice(0, 3));
  
  // 데이터 검증
  events.forEach((event, index) => {
    if (index < 5) {
      console.log(`🔍 데이터 [${index}]:`, {
        id: event.id,
        date_value: event.date_value,
        title: event.title,
        category: event.category,
        created_at: event.created_at
      });
    }
  });
  
  renderEvents(events);
  return events;
}

// localStorage에서 불러오기
function loadEventsFromStorage() {
  try {
    const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    console.log('✅ localStorage에서 로드:', events.length, '개');
    renderEvents(events);
    return events;
  } catch (error) {
    console.error('❌ localStorage 읽기 실패:', error);
    renderEvents([]);
    return [];
  }
}

// 이벤트 렌더링
function renderEvents(events) {
  console.log('🎨 이벤트 렌더링:', events.length, '개');
  console.log('📄 이벤트 데이터 샘플:', events.slice(0, 3));
  
  // 기존 동적 이벤트 제거
  document.querySelectorAll('.event[data-event-id]').forEach(event => {
    console.log('🗑️ 기존 이벤트 제거:', event.textContent);
    event.remove();
  });
  
  // 먼저 사용 가능한 셀들 확인
  const availableCells = document.querySelectorAll('td[data-date]');
  console.log('📅 사용 가능한 날짜 셀들:', Array.from(availableCells).map(cell => cell.getAttribute('data-date')));
  
  let successCount = 0;
  let failCount = 0;
  
  events.forEach((event, index) => {
    const dateValue = event.date_value || event.dateValue;
    
    // 날짜에서 일(day) 부분만 추출
    let dayOnly = dateValue;
    if (dateValue && typeof dateValue === 'string') {
      if (dateValue.includes('-')) {
        // '2025-09-01 14:30:09.014417' 또는 '2025-09-01' 형식 처리
        const datePart = dateValue.split(' ')[0]; // 시간 부분 제거
        dayOnly = datePart.split('-')[2];
        // 앞의 0 제거 (예: '01' -> '1')
        dayOnly = parseInt(dayOnly, 10).toString();
      }
    }
    
    if (index < 3) { // 처음 3개만 자세한 로그
      console.log(`🔍 [${index}] 원본날짜: ${dateValue} -> 변환: ${dayOnly}, 이벤트: ${event.title}`);
    }
    
    const cell = document.querySelector(`td[data-date="${dayOnly}"]`);
    
    if (cell) {
      const eventElement = document.createElement('div');
      eventElement.className = `event cat-${event.category}`;
      eventElement.textContent = event.title;
      eventElement.setAttribute('title', getCategoryName(event.category));
      eventElement.dataset.eventId = event.id;
      
      if (index < 3) {
        console.log(`✨ [${index}] 이벤트 생성:`, eventElement.textContent, eventElement.className);
      }
      
      const addBtn = cell.querySelector('.add-btn');
      if (addBtn) {
        cell.insertBefore(eventElement, addBtn);
        console.log('📍 addBtn 앞에 삽입');
      } else {
        cell.appendChild(eventElement);
        console.log('📍 cell 마지막에 추가');
      }
      
      // 스타일 확인
      const computedStyle = window.getComputedStyle(eventElement);
      console.log(`🎨 [${index}] 스타일 확인:`, {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        backgroundColor: computedStyle.backgroundColor
      });
      
      successCount++;
      
      if (index < 3) {
        console.log(`📌 [${index}] 이벤트 추가 완료 - DOM에 연결됨:`, document.contains(eventElement));
        console.log(`📌 [${index}] 셀 내용:`, cell.innerHTML.substring(0, 200));
      }
    } else {
      failCount++;
      if (index < 5) { // 실패한 것 중 처음 5개만 로그
        console.error(`❌ [${index}] 날짜 셀 못찾음: ${dayOnly} (원본: ${dateValue})`);
      }
    }
  });
  
  console.log(`✅ 렌더링 완료 - 성공: ${successCount}, 실패: ${failCount}`);
}

// 카테고리 이름 변환
function getCategoryName(category) {
  const categoryMap = {
    '인사': '인사',
    '협약MOU': '협약 / MOU',
    '외부업체방문': '외부 업체 방문',
    '조달설치': '조달 / 설치',
    'gom입식and개소': '곰 입식 & 개소',
    '출장시공': '출장 / 시공'
  };
  return categoryMap[category] || category;
}

// 전역 함수로 노출
window.initDatabase = initDatabase;
window.saveEvent = saveEvent;
window.deleteEvent = deleteEvent;
window.loadEvents = loadEvents;
window.loadEventsFromStorage = loadEventsFromStorage;

// 페이지 로드시 자동 초기화
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 사육곰 센터 일정 관리 시스템 시작');
  
  // 테스트 제거
  
  try {
    const connected = await initDatabase();
    if (connected) {
      console.log('✅ 데이터베이스 연결됨 - 원격 데이터 로드');
      await loadEvents();
    } else {
      console.log('📱 로컬 모드 - localStorage 데이터 로드');
      loadEventsFromStorage();
    }
  } catch (error) {
    console.error('❌ 초기화 실패:', error);
    console.log('📱 백업: localStorage 사용');
    loadEventsFromStorage();
  }
});

// Neon 데이터베이스 전용 - localStorage 백업 불필요