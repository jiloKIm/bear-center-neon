-- 국립공원 사육곰 관리센터 예산 관리 시스템 데이터베이스 스키마

-- 사업(카테고리) 테이블
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    main_category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    budget BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT '계획',
    payment_date DATE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 품목(아이템) 테이블
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    price BIGINT NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 필요 서류 체크리스트 테이블
CREATE TABLE IF NOT EXISTS document_checklist (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    checked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_reference CHECK (
        (category_id IS NOT NULL AND item_id IS NULL) OR
        (category_id IS NULL AND item_id IS NOT NULL)
    )
);

-- 인덱스 생성
CREATE INDEX idx_categories_main_category ON categories(main_category);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_payment_date ON categories(payment_date);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_document_checklist_category_id ON document_checklist(category_id);
CREATE INDEX idx_document_checklist_item_id ON document_checklist(item_id);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터 (예시)
COMMENT ON TABLE categories IS '사업별 예산 카테고리';
COMMENT ON TABLE items IS '사업별 세부 품목';
COMMENT ON TABLE document_checklist IS '필요 서류 체크리스트';
