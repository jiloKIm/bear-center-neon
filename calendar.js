let currentDate = null;
let editingEvent = null;

// 현재 날짜 기준으로 초기화
const today = new Date();
let currentMonth = today.getMonth() + 1; // 현재 월 (1-12)
let currentYear = today.getFullYear(); // 현재 년

// 전역 변수로 설정 (이벤트 렌더링에서 사용)
window.currentYear = currentYear;
window.currentMonth = currentMonth;

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

// 폼 제출
eventForm.onsubmit = async function(e) {
  e.preventDefault();

  const title = eventTitle.value.trim();
  const category = eventCategory.value;

  if (!title) return;

  try {
    // 날짜를 YYYY-MM-DD 형식으로 변환
    const day = String(currentDate).padStart(2, '0');
    const monthStr = String(currentMonth).padStart(2, '0');
    const fullDate = `${currentYear}-${monthStr}-${day}`;

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

// 이벤트 클릭 처리
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-btn')) {
    const cell = e.target.parentElement;
    const date = cell.getAttribute('data-date');
    openModal(date);
  }

  // 기존 이벤트 클릭해서 편집
  if (e.target.classList.contains('event')) {
    const cell = e.target.parentElement;
    const date = cell.getAttribute('data-date');

    if (!e.target.dataset.eventId) {
      alert('이 일정은 편집하거나 삭제할 수 없습니다.\n새로 추가한 일정만 편집/삭제가 가능합니다.');
      return;
    }

    openModal(date, e.target);
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

  // 전역 변수 업데이트 (이벤트 렌더링에서 사용)
  window.currentYear = currentYear;
  window.currentMonth = currentMonth;

  generateCalendar(currentYear, currentMonth);

  // 달력 변경 후 해당 월의 이벤트 다시 로드
  if (window.loadEvents) {
    window.loadEvents();
  }
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

  // 기존 이벤트는 updateCalendar에서 처리
}

// 페이지 로드 시 달력 초기화
document.addEventListener('DOMContentLoaded', function() {
  updateCalendar();
});