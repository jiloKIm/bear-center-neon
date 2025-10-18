# 국립공원 사육곰 관리센터 2025 예산 관리집행대장

공무원 스타일의 전문적인 예산 관리 시스템

## 기능

- ✅ 대분류별 예산 현황 (인건비, 재료비, 경비, 사무실조성, 진료실조성)
- ✅ 지출 상태 관리 (계획, 지출진행, 지출완료)
- ✅ 세부 품목 등록 및 관리
- ✅ 필터링 (대분류, 지출상태, 구분, 지출일, 검색)
- ✅ 통계 대시보드
- ✅ 엑셀 다운로드
- ✅ Neon PostgreSQL 데이터베이스 연동

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 Neon DB 연결 정보를 입력하세요:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
PORT=3000
```

### 3. 데이터베이스 스키마 생성

Neon DB 대시보드의 SQL Editor에서 `schema.sql` 파일의 내용을 실행하세요.

### 4. 서버 실행

```bash
npm start
```

서버가 http://localhost:3000 에서 실행됩니다.

## 기술 스택

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: Neon PostgreSQL
- **Deployment**: Netlify (Frontend), Vercel/Railway (Backend)

## API 엔드포인트

### 카테고리(사업)

- `GET /api/categories` - 모든 카테고리 조회
- `POST /api/categories` - 카테고리 생성
- `PUT /api/categories/:id` - 카테고리 수정
- `DELETE /api/categories/:id` - 카테고리 삭제
- `GET /api/categories/by-name/:name` - 이름으로 카테고리 조회

### 품목

- `POST /api/items` - 품목 추가
- `DELETE /api/items/:id` - 품목 삭제

## 데이터베이스 스키마

### categories (사업)
- id, name, main_category, sub_category, type, budget, status, payment_date, note

### items (품목)
- id, category_id, name, company, phone, price, quantity, note

### document_checklist (서류)
- id, category_id, item_id, document_type, document_name, is_checked

## 라이센스

MIT

## 개발자

Bear Center Team
