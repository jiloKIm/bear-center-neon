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
      throw new Error('API 서버에 연결할 수 없습니다');
    }
  } catch (error) {
    console.error('❌ API 연결 실패:', error.message);
    throw new Error('API 서버에 연결할 수 없습니다: ' + error.message);
  }
}

// 일정 저장
async function saveEvent(date, title, category, eventId = null) {
  console.log('💾 일정 저장 시작:', { date, title, category, eventId });
  
  try {
    return await saveToDatabase(date, title, category, eventId);
  } catch (error) {
    console.error('❌ 일정 저장 실패:', error);
    throw new Error('Neon 데이터베이스 저장에 실패했습니다: ' + error.message);
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
  
  await loadEvents();
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
  
  loadEventsFromStorage();
  return events[events.length - 1];
}

// 일정 삭제
async function deleteEvent(eventId) {
  console.log('🗑️ 일정 삭제:', eventId);
  
  try {
    return await deleteFromDatabase(eventId);
  } catch (error) {
    console.error('❌ 일정 삭제 실패:', error);
    throw new Error('Neon 데이터베이스 삭제에 실패했습니다: ' + error.message);
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
  await loadEvents();
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
    return await loadFromDatabase();
  } catch (error) {
    console.error('❌ 일정 불러오기 실패:', error);
    throw new Error('Neon 데이터베이스에서 데이터를 불러올 수 없습니다: ' + error.message);
  }
}

// 데이터베이스에서 불러오기
async function loadFromDatabase() {
  const response = await fetch(API_URL);
  
  if (!response.ok) {
    throw new Error(`API 에러 (${response.status})`);
  }
  
  const events = await response.json();
  console.log('✅ 데이터베이스에서 로드:', events.length, '개');
  
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
  
  // 기존 동적 이벤트 제거
  document.querySelectorAll('.event[data-event-id]').forEach(event => {
    event.remove();
  });
  
  events.forEach(event => {
    const dateValue = event.date_value || event.dateValue;
    const cell = document.querySelector(`td[data-date="${dateValue}"]`);
    
    if (cell) {
      const eventElement = document.createElement('div');
      eventElement.className = `event cat-${event.category}`;
      eventElement.textContent = event.title;
      eventElement.setAttribute('title', getCategoryName(event.category));
      eventElement.dataset.eventId = event.id;
      
      const addBtn = cell.querySelector('.add-btn');
      if (addBtn) {
        cell.insertBefore(eventElement, addBtn);
      } else {
        cell.appendChild(eventElement);
      }
    }
  });
  
  console.log('✅ 렌더링 완료');
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
  await initDatabase();
  await loadEvents();
});

// Neon 데이터베이스 전용 - localStorage 백업 불필요