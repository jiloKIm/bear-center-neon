-- 사육곰 센터 일정 관리 테이블
CREATE TABLE schedule_events (
    id SERIAL PRIMARY KEY,
    date_value TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 테스트 데이터 추가
INSERT INTO schedule_events (date_value, title, category)
VALUES
    ('2025-09-01', '곰 입식 준비', 'gom입식and개소'),
    ('2025-09-02', '외부업체 미팅', '외부업체방문'),
    ('2025-09-03', '인사 발령', '인사'),
    ('2025-09-04', 'MOU 체결', '협약MOU');

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_schedule_events_date ON schedule_events(date_value);
CREATE INDEX idx_schedule_events_category ON schedule_events(category);