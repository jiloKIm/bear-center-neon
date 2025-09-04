// 반달가슴곰 서식지 분석 시스템
let uploadedFile = null;
let selectedOptions = ['kde']; // 기본값: KDE 분석

// DOM 요소들
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const startAnalysisBtn = document.getElementById('startAnalysis');
const progressContainer = document.getElementById('progressContainer');
const resultsPanel = document.getElementById('resultsPanel');
const optionCards = document.querySelectorAll('.option-card');

// 파일 업로드 이벤트
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleFileDrop);
fileInput.addEventListener('change', handleFileSelect);

// 분석 옵션 선택
optionCards.forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('selected');
    updateSelectedOptions();
  });
});

// 분석 시작 버튼
startAnalysisBtn.addEventListener('click', startAnalysis);

function handleDragOver(e) {
  e.preventDefault();
  uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
}

function handleFileDrop(e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function processFile(file) {
  // GPKG 파일 검증
  if (!file.name.toLowerCase().endsWith('.gpkg')) {
    alert('GPKG 파일만 업로드 가능합니다.');
    return;
  }
  
  uploadedFile = file;
  
  // 파일 정보 표시
  document.getElementById('fileName').textContent = `파일명: ${file.name}`;
  document.getElementById('fileSize').textContent = `크기: ${formatFileSize(file.size)}`;
  document.getElementById('fileDate').textContent = `수정일: ${new Date(file.lastModified).toLocaleString()}`;
  
  fileInfo.style.display = 'block';
  startAnalysisBtn.disabled = false;
  
  // 업로드 영역 업데이트
  uploadArea.innerHTML = `
    <div class="upload-icon">✅</div>
    <div class="upload-text">${file.name} 업로드 완료</div>
    <div class="file-types">다른 파일로 변경하려면 클릭하세요</div>
  `;
}

function updateSelectedOptions() {
  selectedOptions = [];
  optionCards.forEach(card => {
    if (card.classList.contains('selected')) {
      selectedOptions.push(card.dataset.option);
    }
  });
  
  // 최소 하나의 옵션은 선택되어야 함
  if (selectedOptions.length === 0) {
    optionCards[1].classList.add('selected'); // KDE를 기본값으로
    selectedOptions = ['kde'];
  }
}

async function startAnalysis() {
  if (!uploadedFile) {
    alert('먼저 GPKG 파일을 업로드해주세요.');
    return;
  }
  
  // UI 업데이트
  startAnalysisBtn.disabled = true;
  progressContainer.style.display = 'block';
  resultsPanel.style.display = 'none';
  
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const progressLog = document.getElementById('progressLog');
  
  // 진행상황 시뮬레이션
  const analysisSteps = [
    { percent: 10, text: '파일 읽기 중...', log: '📁 GPKG 파일 로딩 시작' },
    { percent: 25, text: '좌표계 확인 중...', log: '🗺️ 좌표참조시스템 검증 완료' },
    { percent: 40, text: 'GPS 포인트 추출 중...', log: '📍 위치 데이터 추출: 1,247개 포인트 발견' },
    { percent: 55, text: 'MCP 계산 중...', log: '🏞️ 최소볼록다각형 계산 완료' },
    { percent: 70, text: 'KDE 밀도 분석 중...', log: '🎯 커널밀도 추정 실행 중...' },
    { percent: 85, text: '연결성 분석 중...', log: '🔗 서식지 패치 연결성 계산' },
    { percent: 95, text: '결과 생성 중...', log: '📊 시각화 및 통계 생성' },
    { percent: 100, text: '분석 완료!', log: '✅ 모든 분석 완료! 결과를 확인하세요.' }
  ];
  
  for (let i = 0; i < analysisSteps.length; i++) {
    const step = analysisSteps[i];
    
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    progressFill.style.width = step.percent + '%';
    progressText.textContent = step.text;
    
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${step.log}`;
    logEntry.style.marginBottom = '5px';
    progressLog.appendChild(logEntry);
    progressLog.scrollTop = progressLog.scrollHeight;
  }
  
  // 분석 완료 - 결과 표시
  setTimeout(() => {
    showResults();
  }, 1000);
}

function showResults() {
  resultsPanel.style.display = 'block';
  
  // 가상의 분석 결과 데이터
  const mockResults = {
    totalPoints: 1247,
    mcpArea: 234.5,
    coreHabitat: 89.2,
    connectivity: 0.73,
    suitability: 0.82
  };
  
  // 지도 시뮬레이션
  const mapContainer = document.getElementById('mapContainer');
  mapContainer.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%; background: linear-gradient(45deg, #d4f7dc 0%, #a3e6b8 50%, #6bb77b 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
      <div style="font-size: 3rem; margin-bottom: 10px;">🗺️</div>
      <div style="font-size: 1.2rem; font-weight: 600; color: #2d7d43;">서식지 분포 지도</div>
      <div style="position: absolute; top: 20px; right: 20px; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px;">
          <div style="width: 15px; height: 15px; background: #ef4444; border-radius: 50%;"></div>
          <span style="font-size: 0.9rem;">GPS 포인트</span>
        </div>
        <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px;">
          <div style="width: 15px; height: 15px; background: rgba(59, 130, 246, 0.3); border: 2px solid #3b82f6; border-radius: 3px;"></div>
          <span style="font-size: 0.9rem;">KDE 밀도</span>
        </div>
        <div style="display: flex; align-items: center; gap: 5px;">
          <div style="width: 15px; height: 15px; background: transparent; border: 2px solid #10b981; border-radius: 3px;"></div>
          <span style="font-size: 0.9rem;">MCP 경계</span>
        </div>
      </div>
      <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem;">
        확대/축소 및 상세 정보는 실제 구현에서 제공됩니다
      </div>
    </div>
  `;
  
  // 분석 통계 표시
  const analysisStats = document.getElementById('analysisStats');
  analysisStats.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
      <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
        <h5 style="margin: 0 0 5px 0; color: #0c4a6e;">총 GPS 포인트</h5>
        <p style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #0ea5e9;">${mockResults.totalPoints.toLocaleString()}개</p>
      </div>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
        <h5 style="margin: 0 0 5px 0; color: #14532d;">MCP 면적</h5>
        <p style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #22c55e;">${mockResults.mcpArea} km²</p>
      </div>
      <div style="background: #fef7cd; padding: 15px; border-radius: 8px; border-left: 4px solid #eab308;">
        <h5 style="margin: 0 0 5px 0; color: #713f12;">핵심 서식지</h5>
        <p style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #eab308;">${mockResults.coreHabitat} km²</p>
      </div>
      <div style="background: #fdf4ff; padding: 15px; border-radius: 8px; border-left: 4px solid #a855f7;">
        <h5 style="margin: 0 0 5px 0; color: #581c87;">연결성 지수</h5>
        <p style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #a855f7;">${mockResults.connectivity}</p>
      </div>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
      <h5 style="margin: 0 0 10px 0;">🎯 주요 분석 결과</h5>
      <ul style="margin: 0; padding-left: 20px;">
        <li>반달가슴곰의 주요 서식지는 해발 800-1,500m 구간에 집중</li>
        <li>핵심 서식지 간 연결성은 양호한 수준 (연결성 지수: ${mockResults.connectivity})</li>
        <li>KDE 분석 결과 3개의 주요 활동 중심지 확인</li>
        <li>서식지 적합성은 전체적으로 높은 수준 (적합도: ${mockResults.suitability})</li>
      </ul>
    </div>
  `;
  
  // 다운로드 버튼 이벤트
  document.getElementById('downloadMap').addEventListener('click', () => {
    downloadFile('habitat_map.png', '서식지 분포 지도를 다운로드합니다.');
  });
  
  document.getElementById('downloadData').addEventListener('click', () => {
    downloadFile('analysis_results.csv', '분석 결과 데이터를 다운로드합니다.');
  });
  
  document.getElementById('downloadReport').addEventListener('click', () => {
    downloadFile('habitat_analysis_report.pdf', '분석 보고서를 다운로드합니다.');
  });
  
  // 분석 완료 후 버튼 재활성화
  startAnalysisBtn.disabled = false;
  startAnalysisBtn.textContent = '🔄 다시 분석';
}

function downloadFile(filename, message) {
  alert(message + '\n실제 구현에서는 파일이 다운로드됩니다.');
  console.log(`Downloading: ${filename}`);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  console.log('🐻 반달가슴곰 서식지 분석 시스템 초기화 완료');
});