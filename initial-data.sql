-- 초기 데이터 삽입 스크립트
-- 국립공원 사육곰 관리센터 2025 예산 관리

-- 기존 데이터 삭제 (있다면)
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- 인건비 카테고리
INSERT INTO categories (name, main_category, sub_category, type, budget, status, payment_date, note) VALUES
('센터장', '인건비', '관리직', '용역', 30000000, '지출완료', '2025-01-15', '센터 총괄 책임자'),
('수의사 2명', '인건비', '전문직', '용역', 24000000, '지출완료', '2025-01-15', '곰 진료 및 건강관리 담당'),
('사육사 3명', '인건비', '현장직', '용역', 15000000, '지출진행', '2025-02-01', '곰 사육 및 관리');

-- 재료비 카테고리
INSERT INTO categories (name, main_category, sub_category, type, budget, status, payment_date, note) VALUES
('사료 및 영양제', '재료비', '사육용품', '물품', 5000000, '지출진행', NULL, '연간 사료 및 영양보충제'),
('의료용품', '재료비', '의료소모품', '물품', 3000000, '계획', NULL, '진료용 의료소모품'),
('청소 및 소독용품', '재료비', '위생용품', '물품', 2000000, '계획', NULL, '시설 청소 및 위생관리');

-- 경비 카테고리
INSERT INTO categories (name, main_category, sub_category, type, budget, status, payment_date, note) VALUES
('전기료', '경비', '공공요금', '용역', 24000000, '지출진행', NULL, '연간 전기 사용료'),
('수도료', '경비', '공공요금', '용역', 12000000, '계획', NULL, '연간 수도 사용료'),
('난방비', '경비', '공공요금', '용역', 18000000, '계획', NULL, '동절기 난방비'),
('통신비', '경비', '공공요금', '용역', 3600000, '지출완료', '2025-01-10', '인터넷 및 전화료'),
('차량 유지비', '경비', '차량운영', '용역', 8000000, '계획', NULL, '차량 연료 및 정비'),
('보험료', '경비', '보험', '용역', 15000000, '지출완료', '2025-01-05', '시설 및 배상책임보험'),
('시설 유지보수', '경비', '시설관리', '용역', 30000000, '계획', NULL, '시설 정기점검 및 수리'),
('보안 및 경비', '경비', '안전관리', '용역', 18000000, '지출진행', NULL, 'CCTV 및 보안시스템'),
('폐기물 처리', '경비', '환경관리', '용역', 10400000, '계획', NULL, '의료폐기물 및 일반폐기물');

-- 사무실조성 카테고리
INSERT INTO categories (name, main_category, sub_category, type, budget, status, payment_date, note) VALUES
('책상 및 의자', '사무실조성', '가구', '물품', 15000000, '지출완료', '2025-01-20', '사무실 가구 일체'),
('컴퓨터 및 주변기기', '사무실조성', 'IT기기', '물품', 25000000, '지출완료', '2025-01-25', '업무용 PC 및 프린터'),
('사무용품', '사무실조성', '소모품', '물품', 5000000, '지출진행', NULL, '문구류 및 소모품'),
('회의실 설비', '사무실조성', '회의시설', '물품', 20000000, '계획', NULL, '회의용 테이블, 빔프로젝터'),
('냉난방기', '사무실조성', '공조설비', '물품', 15000000, '지출완료', '2025-01-18', '사무실 에어컨'),
('전화 및 통신설비', '사무실조성', '통신장비', '물품', 8000000, '지출완료', '2025-01-22', '사무실 전화기 및 네트워크'),
('보안시스템', '사무실조성', '보안설비', '물품', 12000000, '지출진행', NULL, '출입통제 및 CCTV');

-- 진료실조성 카테고리
INSERT INTO categories (name, main_category, sub_category, type, budget, status, payment_date, note) VALUES
('CT 장비', '진료실조성', '영상진단', '물품', 450000000, '계획', NULL, '대형동물용 CT 스캐너'),
('수술대 및 마취기', '진료실조성', '수술장비', '물품', 35000000, '계획', NULL, '대형동물 수술장비'),
('초음파 진단기', '진료실조성', '진단장비', '물품', 18000000, '계획', NULL, '복부 및 심장 초음파'),
('X-ray 장비', '진료실조성', '영상진단', '물품', 25000000, '계획', NULL, '디지털 X-ray 시스템'),
('혈액분석기', '진료실조성', '검사장비', '물품', 8000000, '계획', NULL, '혈액 및 생화학 분석'),
('약품 보관 냉장고', '진료실조성', '보관설비', '물품', 4000000, '지출완료', '2025-02-01', '의약품 전용 냉장고');

-- 각 카테고리별 세부 항목 추가

-- 센터장 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '센터장 연봉', '국립공원관리공단', '02-1234-5678', 30000000, 1
FROM categories WHERE name = '센터장';

-- 수의사 2명 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '수의사 인건비', '국립공원관리공단', '02-1234-5678', 12000000, 2
FROM categories WHERE name = '수의사 2명';

-- 사육사 3명 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '사육사 인건비', '국립공원관리공단', '02-1234-5678', 5000000, 3
FROM categories WHERE name = '사육사 3명';

-- 사료 및 영양제 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '곰 전용 사료', '동물사료 주식회사', '031-111-2222', 200000, 20
FROM categories WHERE name = '사료 및 영양제';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '종합 영양제', '동물영양 주식회사', '031-333-4444', 50000, 20
FROM categories WHERE name = '사료 및 영양제';

-- 의료용품 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '수술용 장갑', '메디컬 주식회사', '02-555-6666', 50000, 30
FROM categories WHERE name = '의료용품';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '주사기 세트', '메디컬 주식회사', '02-555-6666', 30000, 50
FROM categories WHERE name = '의료용품';

-- 전기료 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '월 전기료', '한국전력공사', '123', 2000000, 12
FROM categories WHERE name = '전기료';

-- 수도료 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '월 수도료', '지방상수도', '123', 1000000, 12
FROM categories WHERE name = '수도료';

-- 난방비 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '월 난방비', '지역난방공사', '123', 3000000, 6
FROM categories WHERE name = '난방비';

-- 통신비 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '인터넷 월정액', 'KT', '100', 200000, 12
FROM categories WHERE name = '통신비';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '전화 월정액', 'KT', '100', 100000, 12
FROM categories WHERE name = '통신비';

-- 보험료 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '시설 종합보험', '삼성화재', '1588-5114', 10000000, 1
FROM categories WHERE name = '보험료';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '배상책임보험', '삼성화재', '1588-5114', 5000000, 1
FROM categories WHERE name = '보험료';

-- 책상 및 의자 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '사무용 책상', '퍼시스', '02-2007-9000', 500000, 20
FROM categories WHERE name = '책상 및 의자';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '사무용 의자', '퍼시스', '02-2007-9000', 250000, 20
FROM categories WHERE name = '책상 및 의자';

-- 컴퓨터 및 주변기기 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '업무용 데스크탑', '삼성전자', '1588-3366', 1500000, 10
FROM categories WHERE name = '컴퓨터 및 주변기기';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '레이저 프린터', 'HP코리아', '1588-4747', 800000, 5
FROM categories WHERE name = '컴퓨터 및 주변기기';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '모니터 27인치', '삼성전자', '1588-3366', 400000, 10
FROM categories WHERE name = '컴퓨터 및 주변기기';

-- 냉난방기 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '시스템 에어컨', 'LG전자', '1544-7777', 3000000, 5
FROM categories WHERE name = '냉난방기';

-- 전화 및 통신설비 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '사무용 전화기', '삼성전자', '1588-3366', 150000, 20
FROM categories WHERE name = '전화 및 통신설비';

INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '네트워크 스위치', '시스코', '02-3429-0100', 500000, 5
FROM categories WHERE name = '전화 및 통신설비';

-- 약품 보관 냉장고 세부항목
INSERT INTO items (category_id, name, company, phone, price, quantity)
SELECT id, '의약품 전용 냉장고', 'LG전자', '1544-7777', 4000000, 1
FROM categories WHERE name = '약품 보관 냉장고';

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
