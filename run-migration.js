const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
    try {
        console.log('🔧 마이그레이션 시작...');

        // items 테이블에 checked_docs 컬럼 추가
        console.log('1. checked_docs 컬럼 추가 중...');
        await sql`
            ALTER TABLE items
            ADD COLUMN IF NOT EXISTS checked_docs JSONB DEFAULT '[]'::jsonb
        `;
        console.log('✅ checked_docs 컬럼 추가 완료');

        // 기존 데이터에 빈 배열 설정
        console.log('2. 기존 데이터 업데이트 중...');
        await sql`
            UPDATE items SET checked_docs = '[]'::jsonb WHERE checked_docs IS NULL
        `;
        console.log('✅ 기존 데이터 업데이트 완료');

        // 인덱스 추가
        console.log('3. 인덱스 추가 중...');
        await sql`
            CREATE INDEX IF NOT EXISTS idx_items_checked_docs ON items USING GIN (checked_docs)
        `;
        console.log('✅ 인덱스 추가 완료');

        // 확인
        console.log('4. 데이터 확인 중...');
        const result = await sql`
            SELECT id, name, checked_docs FROM items LIMIT 5
        `;
        console.log('✅ 샘플 데이터:', result);

        console.log('🎉 마이그레이션 완료!');
        process.exit(0);
    } catch (error) {
        console.error('❌ 마이그레이션 실패:', error);
        process.exit(1);
    }
}

runMigration();
