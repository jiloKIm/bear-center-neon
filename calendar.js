let currentDate = null;
let editingEvent = null;
let currentMonth = 9; // 2025년 9월부터 시작
let currentYear = 2025;

const modal = document.getElementById('eventModal');
const eventForm = document.getElementById('eventForm');
const eventTitle = document.getElementById('eventTitle');
const eventCategory = document.getElementById('eventCategory');
const deleteBtn = document.getElementById('deleteEvent');
const closeBtn = document.querySelector('.close');

// 모달 열기/닫기
function openModal(date, event = null) {
  currentDate = date;
  editingEvent = event;
  
  if (event) {
    // 기존 이벤트 편집
    eventTitle.value = event.textContent;
    eventCategory.value = event.className.replace('event cat-', '');
    deleteBtn.style.display = 'inline-block';
  } else {
    // 새 이벤트 추가
    eventTitle.value = '';
    eventCategory.value = '인사';
    deleteBtn.style.display = 'none';
  }
  
  modal.style.display = 'block';
}

function closeModal() {
  modal.style.display = 'none';
  currentDate = null;
  editingEvent = null;
}

// 이벤트 리스너
closeBtn.onclick = closeModal;
window.onclick = function(event) {
  if (event.target === modal) {
    closeModal();
  }
}

// 기존 이벤트 리스너는 워크플로우 기능에서 대체됨

// 폼 제출
eventForm.onsubmit = async function(e) {
  e.preventDefault();
  
  const title = eventTitle.value.trim();
  const category = eventCategory.value;
  
  if (!title) return;
  
  try {
    // 날짜를 YYYY-MM-DD 형식으로 변환
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;
    
    console.log('📅 저장할 날짜:', fullDate, '(원본:', currentDate, ')');
    
    if (editingEvent) {
      // 기존 이벤트 수정
      const eventId = editingEvent.dataset.eventId;
      await saveEvent(fullDate, title, category, eventId);
    } else {
      // 새 이벤트 추가
      await saveEvent(fullDate, title, category);
    }
    
    // 항상 전체 이벤트를 다시 로드하여 UI를 업데이트
    await loadEvents();
    
    closeModal();
  } catch (error) {
    console.error('일정 저장 중 오류:', error);
    alert('일정 저장 중 오류가 발생했습니다.');
  }
};

// 삭제 버튼
deleteBtn.onclick = async function() {
  if (editingEvent && confirm('이 일정을 삭제하시겠습니까?')) {
    try {
      const eventId = editingEvent.dataset.eventId;
      
      if (!eventId) {
        alert('이 일정은 삭제할 수 없습니다.');
        return;
      }
      
      await deleteEvent(eventId);
      
      // 전체 이벤트를 다시 로드하여 UI를 업데이트
      await loadEvents();
      
      closeModal();
    } catch (error) {
      console.error('일정 삭제 중 오류:', error);
      alert('일정 삭제 중 오류가 발생했습니다.');
    }
  }
};

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

// 워크플로우 연결 기능
let connectionMode = false;
let sourceEvent = null;
let connections = [];

const connectBtn = document.getElementById('connectBtn');
const clearConnectionsBtn = document.getElementById('clearConnectionsBtn');
const connectionSvg = document.getElementById('connectionSvg');
const mainContent = document.querySelector('.main-content');

// 연결 모드 토글
connectBtn.addEventListener('click', function() {
  connectionMode = !connectionMode;
  
  if (connectionMode) {
    connectBtn.classList.add('active');
    connectBtn.textContent = '🔗 연결 모드 종료';
    mainContent.classList.add('connection-mode');
  } else {
    connectBtn.classList.remove('active');
    connectBtn.textContent = '🔗 워크플로우 연결';
    mainContent.classList.remove('connection-mode');
    sourceEvent = null;
    document.querySelectorAll('.event.connected-source').forEach(el => {
      el.classList.remove('connected-source');
    });
  }
});

// 연결선 모두 지우기
clearConnectionsBtn.addEventListener('click', function() {
  connections = [];
  connectionSvg.innerHTML = '';
  localStorage.removeItem('workflow-connections');
});

// 이벤트 클릭 처리 (기존 코드 수정)
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-btn')) {
    const cell = e.target.parentElement;
    const date = cell.getAttribute('data-date');
    openModal(date);
  }
  
  // 기존 이벤트 클릭해서 편집 또는 연결
  if (e.target.classList.contains('event')) {
    if (connectionMode) {
      // 연결 모드일 때
      handleEventConnection(e.target);
    } else {
      // 편집 모드일 때
      const cell = e.target.parentElement;
      const date = cell.getAttribute('data-date');
      
      if (!e.target.dataset.eventId) {
        alert('이 일정은 편집하거나 삭제할 수 없습니다.\n새로 추가한 일정만 편집/삭제가 가능합니다.');
        return;
      }
      
      openModal(date, e.target);
    }
  }
});

// 워크플로우 연결 처리
function handleEventConnection(event) {
  if (!sourceEvent) {
    // 첫 번째 이벤트 선택
    sourceEvent = event;
    event.classList.add('connected-source');
  } else if (sourceEvent === event) {
    // 같은 이벤트 클릭시 선택 해제
    sourceEvent.classList.remove('connected-source');
    sourceEvent = null;
  } else {
    // 두 번째 이벤트 선택 - 연결선 생성
    createConnection(sourceEvent, event);
    sourceEvent.classList.remove('connected-source');
    sourceEvent = null;
  }
}

// 연결선 생성
function createConnection(fromEvent, toEvent) {
  const connection = {
    from: getEventPosition(fromEvent),
    to: getEventPosition(toEvent),
    fromId: fromEvent.dataset.eventId || fromEvent.textContent + '-' + fromEvent.parentElement.getAttribute('data-date'),
    toId: toEvent.dataset.eventId || toEvent.textContent + '-' + toEvent.parentElement.getAttribute('data-date')
  };
  
  connections.push(connection);
  drawConnection(connection);
  saveConnections();
}

// 이벤트 위치 계산
function getEventPosition(event) {
  const rect = event.getBoundingClientRect();
  
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    element: event
  };
}

// 연결선 그리기
function drawConnection(connection) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  
  const fromX = connection.from.x;
  const fromY = connection.from.y;
  const toX = connection.to.x;
  const toY = connection.to.y;
  
  // 부드러운 베지어 곡선으로 연결
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 곡선의 제어점 계산
  const controlOffset = Math.min(distance * 0.3, 50);
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  
  // 수직 방향으로 곡선 생성
  const controlX1 = fromX + dx * 0.3;
  const controlY1 = fromY - controlOffset;
  const controlX2 = toX - dx * 0.3;
  const controlY2 = toY - controlOffset;
  
  const pathData = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
  
  path.setAttribute('d', pathData);
  path.classList.add('arrow-line');
  path.setAttribute('marker-end', 'url(#arrowhead)');
  
  // 연결선에 호버 효과 추가
  path.addEventListener('mouseenter', function() {
    this.setAttribute('marker-end', 'url(#arrowheadBig)');
  });
  
  path.addEventListener('mouseleave', function() {
    this.setAttribute('marker-end', 'url(#arrowhead)');
  });
  
  // 연결선 생성 애니메이션
  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = pathLength + ' ' + pathLength;
  path.style.strokeDashoffset = pathLength;
  path.animate([
    { strokeDashoffset: pathLength },
    { strokeDashoffset: 0 }
  ], {
    duration: 800,
    easing: 'ease-out',
    fill: 'forwards'
  });
  
  connectionSvg.appendChild(path);
}

// 연결선 저장
function saveConnections() {
  localStorage.setItem('workflow-connections', JSON.stringify(connections));
}

// 연결선 로드
function loadConnections() {
  const saved = localStorage.getItem('workflow-connections');
  if (saved) {
    connections = JSON.parse(saved);
    // 페이지 로드 후 연결선 다시 그리기
    setTimeout(() => {
      redrawConnections();
    }, 100);
  }
}

// 연결선 다시 그리기
function redrawConnections() {
  connectionSvg.innerHTML = '';
  connections.forEach(connection => {
    // 요소가 여전히 존재하는지 확인하고 위치 업데이트
    const fromElement = findElementById(connection.fromId);
    const toElement = findElementById(connection.toId);
    
    if (fromElement && toElement) {
      connection.from = getEventPosition(fromElement);
      connection.to = getEventPosition(toElement);
      drawConnection(connection);
    }
  });
}

// ID로 요소 찾기
function findElementById(id) {
  return document.querySelector(`[data-event-id="${id}"]`) || 
         Array.from(document.querySelectorAll('.event')).find(el => {
           const eventId = el.textContent + '-' + el.parentElement.getAttribute('data-date');
           return eventId === id;
         });
}

// 윈도우 리사이즈시 연결선 다시 그리기
window.addEventListener('resize', function() {
  if (connections.length > 0) {
    redrawConnections();
  }
});

// 월 변경 및 달력 생성 기능
const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

// 월 변경 버튼 이벤트
document.getElementById('prevMonth').addEventListener('click', () => {
  if (currentMonth > 1) {
    currentMonth--;
    updateCalendar();
  } else if (currentYear > 2025) {
    currentYear--;
    currentMonth = 12;
    updateCalendar();
  }
});

document.getElementById('nextMonth').addEventListener('click', () => {
  if (currentMonth < 12) {
    currentMonth++;
    updateCalendar();
  } else {
    currentYear++;
    currentMonth = 1;
    updateCalendar();
  }
});

// 달력 업데이트
function updateCalendar() {
  const monthTitle = document.getElementById('currentMonthTitle');
  const subtitle = document.getElementById('currentSubtitle');

  monthTitle.textContent = `${currentYear}년 ${monthNames[currentMonth - 1]}`;
  subtitle.textContent = `카테고리별 색상으로 구분된 월간 계획 (${currentYear}년 ${currentMonth}월)`;

  generateCalendar(currentYear, currentMonth);
}

// 달력 생성
function generateCalendar(year, month) {
  const tbody = document.getElementById('calendarBody');
  tbody.innerHTML = '';

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  let date = 1;
  let today = new Date();
  let isCurrentMonth = (today.getFullYear() === year && today.getMonth() === month - 1);

  for (let i = 0; i < 6; i++) {
    const row = document.createElement('tr');

    for (let j = 0; j < 7; j++) {
      const cell = document.createElement('td');

      if (i === 0 && j < startingDay) {
        cell.classList.add('muted');
      } else if (date > daysInMonth) {
        cell.classList.add('muted');
      } else {
        cell.setAttribute('data-date', date);

        // 오늘 날짜 표시
        if (isCurrentMonth && date === today.getDate()) {
          cell.classList.add('today');
        }

        cell.innerHTML = `
          <span class="date">${date}</span>
          <div class="add-btn">+ 일정 추가</div>
        `;

        date++;
      }

      row.appendChild(cell);
    }

    tbody.appendChild(row);

    // 모든 날짜를 표시했으면 중단
    if (date > daysInMonth) {
      break;
    }
  }

  // 기존 이벤트 다시 로드
  if (typeof loadEvents === 'function') {
    loadEvents();
  }
}

// 페이지 로드 시 달력 초기화 및 연결선 복원
document.addEventListener('DOMContentLoaded', function() {
  updateCalendar();
  loadConnections();
});