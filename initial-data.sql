-- 초기 데이터 삽입 스크립트
-- 국립공원 사육곰 관리센터 2025 예산 관리

-- 기존 데이터 삭제 (있다면)
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- 사무실조성 카테고리 (100,000,000원)
INSERT INTO categories (name, main_category, sub_category, type, budget, status, payment_date, note) VALUES
('통신망 구축', '사무실조성', NULL, '물품', 7580000, '계획', NULL, '키폰 및 네트워크 장비'),
('정보기기 조달', '사무실조성', NULL, '물품', 14109010, '계획', NULL, '컴퓨터 및 주변기기'),
('프린터/복사기', '사무실조성', NULL, '물품', 7854000, '계획', NULL, '출력 장비'),
('사무용품', '사무실조성', NULL, '물품', 2000000, '계획', NULL, '각종 사무용품'),
('가구 조달', '사무실조성', NULL, '물품', 26499900, '계획', NULL, '사무실 가구'),
('휴게환경 가전제품', '사무실조성', NULL, '물품', 3817000, '계획', NULL, '휴게실 전자제품'),
('휴게환경 비품', '사무실조성', NULL, '물품', 1700000, '계획', NULL, '휴게실 비품 및 정비'),
('싱크대 설치', '사무실조성', NULL, '공사', 8400000, '계획', NULL, '철거 및 설치'),
('산업안전관리', '사무실조성', NULL, '물품', 2430000, '계획', NULL, '안전관리 용품'),
('출입통제시스템', '사무실조성', NULL, '물품', 1800000, '계획', NULL, '보안 장비'),
('신규인사관리', '사무실조성', NULL, '물품', 440000, '계획', NULL, '직원 복지'),
('사육장 관리', '사무실조성', NULL, '물품', 5000000, '계획', NULL, '사육장 운영 물품'),
('시설 관리', '사무실조성', NULL, '물품', 10000000, '계획', NULL, '시설 유지보수'),
('청소 용역', '사무실조성', NULL, '용역', 1700000, '계획', NULL, '엘리트빌딩케어'),
('기타 운영비', '사무실조성', NULL, '물품', 120970, '계획', NULL, '잡비'),
('예비비', '사무실조성', NULL, '물품', 5949120, '계획', NULL, '예비비');

-- 경비 카테고리 (119,257,960원)
INSERT INTO categories (name, main_category, sub_category, type, budget, status, payment_date, note) VALUES
('컴프레셔 구매', '경비', '운영비', '물품', 7851500, '지출완료', '2025-09-26', ''),
('청소시스템 전기선 시공', '경비', '유지보수비', '공사', 4026000, '지출완료', '2025-09-09', ''),
('케이지 제작', '경비', '운영비', '공사', 20790000, '지출완료', '2025-09-02', '성창'),
('울타리 설치공사', '경비', '유지보수비', '공사', 12100000, '지출완료', '2025-09-02', '에스콤코리아남부점'),
('물펌프공사 설치', '경비', '유지보수비', '공사', 19600000, '지출완료', '2025-09-02', '천보'),
('CCTV 설치', '경비', '기타 경비', '공사', 54890460, '지출완료', CURRENT_DATE, '보안시스템');

-- 품목 데이터 - 통신망 구축
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '키폰 주장치', '', '', 1800000, 1 FROM categories WHERE name = '통신망 구축';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '키폰 전화기', '', '', 180000, 20 FROM categories WHERE name = '통신망 구축';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, 'HUB, AP, 멀티탭 등', '', '', 2180000, 1 FROM categories WHERE name = '통신망 구축';

-- 품목 데이터 - 정보기기 조달
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '데스크톱 컴퓨터', '', '', 740901, 10 FROM categories WHERE name = '정보기기 조달';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '윈도우11 Pro', '', '', 173000, 10 FROM categories WHERE name = '정보기기 조달';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '액정 모니터', '', '', 399000, 10 FROM categories WHERE name = '정보기기 조달';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '문서세단기', '', '', 490000, 2 FROM categories WHERE name = '정보기기 조달';

-- 품목 데이터 - 프린터/복사기
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '전자복사기 및 부속품', '', '', 3432000, 2 FROM categories WHERE name = '프린터/복사기';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '복합기 토너', '', '', 99000, 10 FROM categories WHERE name = '프린터/복사기';

-- 품목 데이터 - 사무용품
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '각종 사무용품', '', '', 2000000, 1 FROM categories WHERE name = '사무용품';

-- 품목 데이터 - 가구 조달
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '파티션', '', '', 2528000, 1 FROM categories WHERE name = '가구 조달';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '의자', '', '', 297200, 20 FROM categories WHERE name = '가구 조달';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '책상', '', '', 349800, 20 FROM categories WHERE name = '가구 조달';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '회의용 탁자', '', '', 1152000, 4 FROM categories WHERE name = '가구 조달';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '캐비닛/로커', '', '', 6503900, 1 FROM categories WHERE name = '가구 조달';

-- 품목 데이터 - 휴게환경 가전제품
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '냉장고', '', '', 1450000, 1 FROM categories WHERE name = '휴게환경 가전제품';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '전자레인지', '', '', 119000, 1 FROM categories WHERE name = '휴게환경 가전제품';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '청소기', '', '', 324000, 2 FROM categories WHERE name = '휴게환경 가전제품';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '정수기 (설치비 포함)', '', '', 550000, 2 FROM categories WHERE name = '휴게환경 가전제품';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '비데 (설치비 포함)', '', '', 550000, 2 FROM categories WHERE name = '휴게환경 가전제품';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '공기청정기 (설치비 포함)', '', '', 1100000, 1 FROM categories WHERE name = '휴게환경 가전제품';

-- 품목 데이터 - 휴게환경 비품
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '매트릭스 및 침구류', '', '', 300000, 1 FROM categories WHERE name = '휴게환경 비품';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '다용도 테이블 의자', '', '', 600000, 1 FROM categories WHERE name = '휴게환경 비품';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '바닥/벽 정비', '', '', 800000, 1 FROM categories WHERE name = '휴게환경 비품';

-- 품목 데이터 - 싱크대 설치
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '철거 및 설치', '', '', 8400000, 1 FROM categories WHERE name = '싱크대 설치';

-- 품목 데이터 - 산업안전관리
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '미끄럼방지', '', '', 960000, 1 FROM categories WHERE name = '산업안전관리';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '소방/피난 설비', '', '', 350000, 1 FROM categories WHERE name = '산업안전관리';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '보호구', '', '', 250000, 1 FROM categories WHERE name = '산업안전관리';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '위험물질 관리', '', '', 200000, 1 FROM categories WHERE name = '산업안전관리';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '안전표지/게시물', '', '', 320000, 1 FROM categories WHERE name = '산업안전관리';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '측정/점검 장비', '', '', 150000, 1 FROM categories WHERE name = '산업안전관리';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '응급/구호 용품', '', '', 100000, 1 FROM categories WHERE name = '산업안전관리';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '장애인 편의시설', '', '', 100000, 1 FROM categories WHERE name = '산업안전관리';

-- 품목 데이터 - 출입통제시스템
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '도어락', '', '', 1800000, 1 FROM categories WHERE name = '출입통제시스템';

-- 품목 데이터 - 신규인사관리
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '등산화 지급', '', '', 440000, 1 FROM categories WHERE name = '신규인사관리';

-- 품목 데이터 - 사육장 관리
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '사육장 관리 물품', '', '', 5000000, 1 FROM categories WHERE name = '사육장 관리';

-- 품목 데이터 - 시설 관리
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '시설 관리 물품', '', '', 10000000, 1 FROM categories WHERE name = '시설 관리';

-- 품목 데이터 - 청소 용역
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '청소 용역 (12개월)', '엘리트빌딩케어', '', 1700000, 1 FROM categories WHERE name = '청소 용역';

-- 품목 데이터 - 기타 운영비
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '기타 잡비', '', '', 120970, 1 FROM categories WHERE name = '기타 운영비';

-- 품목 데이터 - 경비 카테고리
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '컴프레셔', '', '', 7851500, 1 FROM categories WHERE name = '컴프레셔 구매';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '청소시스템 전기선 시공', '', '', 4026000, 1 FROM categories WHERE name = '청소시스템 전기선 시공';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '케이지 제작', '성창', '', 20790000, 1 FROM categories WHERE name = '케이지 제작';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '울타리 설치공사', '에스콤코리아남부점', '', 12100000, 1 FROM categories WHERE name = '울타리 설치공사';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '물펌프공사 설치', '천보', '', 19600000, 1 FROM categories WHERE name = '물펌프공사 설치';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, 'CCTV 설치', '', '', 54890460, 1 FROM categories WHERE name = 'CCTV 설치';

-- 데이터 확인
SELECT
    c.name AS 카테고리명,
    c.main_category AS 대분류,
    c.sub_category AS 중분류,
    c.type AS 구분,
    c.budget AS 예산,
    c.status AS 상태,
    COUNT(i.id) AS 항목수
FROM categories c
LEFT JOIN items i ON c.id = i.category_id
GROUP BY c.id, c.name, c.main_category, c.sub_category, c.type, c.budget, c.status
ORDER BY c.main_category, c.name;
