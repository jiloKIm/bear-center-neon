-- items 테이블에 checked_docs 컬럼 추가
-- 서류 체크 상태를 JSON 배열로 저장

ALTER TABLE items
ADD COLUMN IF NOT EXISTS checked_docs JSONB DEFAULT '[]'::jsonb;

-- 기존 데이터에 빈 배열 설정
UPDATE items SET checked_docs = '[]'::jsonb WHERE checked_docs IS NULL;

-- 인덱스 추가 (선택사항, 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_items_checked_docs ON items USING GIN (checked_docs);

-- 확인
SELECT id, name, checked_docs FROM items LIMIT 5;
