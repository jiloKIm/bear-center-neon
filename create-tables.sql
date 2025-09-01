-- 사육곰 센터 일정 관리 테이블
CREATE TABLE schedule_events (
    id SERIAL PRIMARY KEY,
    date_value TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 물품 관리 테이블
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    details TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 테스트 데이터 추가
INSERT INTO schedule_events (date_value, title, category)
VALUES
    ('2025-09-01', '곰 입식 준비', 'gom입식and개소'),
    ('2025-09-02', '외부업체 미팅', '외부업체방문'),
    ('2025-09-03', '인사 발령', '인사'),
    ('2025-09-04', 'MOU 체결', '협약MOU');

-- 물품 관리 테스트 데이터 추가
INSERT INTO inventory_items (type, status, name, amount, quantity, details, notes)
VALUES
    ('조달', '계획', '사육장 철망 교체', 5000000, 1, '스테인리스 스틸 철망 300㎡\n안전 잠금장치 10개\n설치용 부자재 일식', '긴급도: 높음'),
    ('계약', '진행중', 'CT 스캐너 도입', 150000000, 1, 'CT 스캐너 1대\n조영제 주입기 1세트\n방사선 차폐시설 일식\n모니터링 시스템 1세트', '의료진 교육 포함'),
    ('지출', '완료', '사료 구매', 2000000, 12, '고급 사료 1톤 x 12개월분\n영양제 보충제\n특수 사료 (치료용)', '월별 정기 구매');

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_schedule_events_date ON schedule_events(date_value);
CREATE INDEX idx_schedule_events_category ON schedule_events(category);
CREATE INDEX idx_inventory_items_type ON inventory_items(type);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);