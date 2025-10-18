const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 정적 파일 제공

// Neon DB 연결
const sql = neon(process.env.DATABASE_URL);

// ============ API 엔드포인트 ============

// 1. 모든 카테고리 조회
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await sql`
            SELECT
                c.*,
                json_agg(
                    json_build_object(
                        'id', i.id,
                        'name', i.name,
                        'company', i.company,
                        'phone', i.phone,
                        'price', i.price,
                        'quantity', i.quantity,
                        'note', i.note
                    ) ORDER BY i.id
                ) FILTER (WHERE i.id IS NOT NULL) as items
            FROM categories c
            LEFT JOIN items i ON c.id = i.category_id
            GROUP BY c.id
            ORDER BY c.id
        `;

        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// 2. 카테고리 생성
app.post('/api/categories', async (req, res) => {
    try {
        const { name, mainCategory, subCategory, type, budget, status, paymentDate, note } = req.body;

        const result = await sql`
            INSERT INTO categories (name, main_category, sub_category, type, budget, status, payment_date, note)
            VALUES (${name}, ${mainCategory}, ${subCategory}, ${type}, ${budget}, ${status}, ${paymentDate}, ${note})
            RETURNING *
        `;

        res.json(result[0]);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// 3. 카테고리 수정
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, mainCategory, subCategory, type, budget, status, paymentDate, note } = req.body;

        const result = await sql`
            UPDATE categories
            SET name = ${name},
                main_category = ${mainCategory},
                sub_category = ${subCategory},
                type = ${type},
                budget = ${budget},
                status = ${status},
                payment_date = ${paymentDate},
                note = ${note}
            WHERE id = ${id}
            RETURNING *
        `;

        res.json(result[0]);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// 4. 카테고리 삭제
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await sql`DELETE FROM categories WHERE id = ${id}`;

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// 5. 품목 추가
app.post('/api/items', async (req, res) => {
    try {
        const { categoryId, name, company, phone, price, quantity, note } = req.body;

        const result = await sql`
            INSERT INTO items (category_id, name, company, phone, price, quantity, note)
            VALUES (${categoryId}, ${name}, ${company}, ${phone}, ${price}, ${quantity}, ${note})
            RETURNING *
        `;

        res.json(result[0]);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// 6. 품목 삭제
app.delete('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await sql`DELETE FROM items WHERE id = ${id}`;

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// 7. 이름으로 카테고리 조회
app.get('/api/categories/by-name/:name', async (req, res) => {
    try {
        const { name } = req.params;

        const result = await sql`
            SELECT
                c.*,
                json_agg(
                    json_build_object(
                        'id', i.id,
                        'name', i.name,
                        'company', i.company,
                        'phone', i.phone,
                        'price', i.price,
                        'quantity', i.quantity,
                        'note', i.note
                    ) ORDER BY i.id
                ) FILTER (WHERE i.id IS NOT NULL) as items
            FROM categories c
            LEFT JOIN items i ON c.id = i.category_id
            WHERE c.name = ${name}
            GROUP BY c.id
        `;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// 헬스 체크
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Budget Management System for Bear Center`);
});
