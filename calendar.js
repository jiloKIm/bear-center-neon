let currentDate = null;
let editingEvent = null;
let currentMonth = 9; // 2025년 9월부터 시작
let currentYear = 2025;

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

  // 날짜 입력 필드 가져오기
  const eventYear = document.getElementById('eventYear');
  const eventMonth = document.getElementById('eventMonth');
  const eventDay = document.getElementById('eventDay');

  if (event) {
    // 기존 이벤트 편집
    eventTitle.value = event.textContent;
    eventCategory.value = event.className.replace('event cat-', '');
    deleteBtn.style.display = 'inline-block';

    // 기존 이벤트의 날짜 정보 설정
    eventYear.value = currentYear;
    eventMonth.value = currentMonth;
    eventDay.value = date;
  } else {
    // 새 이벤트 추가
    eventTitle.value = '';
    eventCategory.value = '인사';
    deleteBtn.style.display = 'none';

    // 클릭한 날짜로 설정
    eventYear.value = currentYear;
    eventMonth.value = currentMonth;
    eventDay.value = date;
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

  // 날짜 입력 필드에서 값 가져오기
  const eventYear = document.getElementById('eventYear');
  const eventMonth = document.getElementById('eventMonth');
  const eventDay = document.getElementById('eventDay');

  const year = parseInt(eventYear.value);
  const month = parseInt(eventMonth.value);
  const day = parseInt(eventDay.value);

  if (!title || !year || !month || !day) {
    alert('모든 필드를 입력해주세요.');
    return;
  }

  try {
    // 날짜를 YYYY-MM-DD 형식으로 변환
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const fullDate = `${year}-${monthStr}-${dayStr}`;

    console.log('📅 저장할 날짜:', fullDate, '(년:', year, '월:', month, '일:', day, ')');

    if (editingEvent) {
      // 기존 이벤트 수정
      const eventId = editingEvent.dataset.eventId;
      await saveEvent(fullDate, title, category, eventId, year, month, day);
    } else {
      // 새 이벤트 추가
      await saveEvent(fullDate, title, category, null, year, month, day);
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

  // 기존 이벤트 다시 로드는 updateCalendar에서 처리
}

// 페이지 로드 시 달력 초기화
document.addEventListener('DOMContentLoaded', function() {
  updateCalendar();
});