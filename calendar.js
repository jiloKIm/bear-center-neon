let currentDate = null;
let editingEvent = null;

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

// 일정 추가 버튼 클릭
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
    
    // data-event-id가 없는 정적 이벤트는 편집/삭제 불가
    if (!e.target.dataset.eventId) {
      alert('이 일정은 편집하거나 삭제할 수 없습니다.\n새로 추가한 일정만 편집/삭제가 가능합니다.');
      return;
    }
    
    openModal(date, e.target);
  }
});

// 폼 제출
eventForm.onsubmit = async function(e) {
  e.preventDefault();
  
  const title = eventTitle.value.trim();
  const category = eventCategory.value;
  
  if (!title) return;
  
  try {
    if (editingEvent) {
      // 기존 이벤트 수정
      const eventId = editingEvent.dataset.eventId;
      await saveEvent(currentDate, title, category, eventId);
    } else {
      // 새 이벤트 추가
      await saveEvent(currentDate, title, category);
    }
    
    // 항상 전체 이벤트를 다시 로드하여 UI를 업데이트
    if (window.getSql && window.getSql()) {
      await loadEvents();
    } else {
      loadEventsFromStorage();
    }
    
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
      if (window.getSql && window.getSql()) {
        await loadEvents();
      } else {
        loadEventsFromStorage();
      }
      
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