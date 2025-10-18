const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

exports.handler = async (event, context) => {
    const path = event.path.replace('/.netlify/functions/api', '');
    const method = event.httpMethod;

    // CORS 헤더
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // GET /categories - 모든 카테고리 조회
        if (path === '/categories' && method === 'GET') {
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

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(categories)
            };
        }

        // POST /categories - 카테고리 생성
        if (path === '/categories' && method === 'POST') {
            const { name, mainCategory, subCategory, type, budget, status, paymentDate, note } = JSON.parse(event.body);

            const result = await sql`
                INSERT INTO categories (name, main_category, sub_category, type, budget, status, payment_date, note)
                VALUES (${name}, ${mainCategory}, ${subCategory}, ${type}, ${budget}, ${status}, ${paymentDate}, ${note})
                RETURNING *
            `;

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(result[0])
            };
        }

        // PUT /categories/:id - 카테고리 수정
        if (path.startsWith('/categories/') && method === 'PUT') {
            const id = parseInt(path.split('/')[2]);
            const { name, mainCategory, subCategory, type, budget, status, paymentDate, note } = JSON.parse(event.body);

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

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result[0])
            };
        }

        // DELETE /categories/:id - 카테고리 삭제
        if (path.startsWith('/categories/') && method === 'DELETE') {
            const id = parseInt(path.split('/')[2]);

            await sql`DELETE FROM categories WHERE id = ${id}`;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }

        // POST /items - 품목 추가
        if (path === '/items' && method === 'POST') {
            const { categoryId, name, company, phone, price, quantity, note } = JSON.parse(event.body);

            const result = await sql`
                INSERT INTO items (category_id, name, company, phone, price, quantity, note)
                VALUES (${categoryId}, ${name}, ${company}, ${phone}, ${price}, ${quantity}, ${note})
                RETURNING *
            `;

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(result[0])
            };
        }

        // DELETE /items/:id - 품목 삭제
        if (path.startsWith('/items/') && method === 'DELETE') {
            const id = parseInt(path.split('/')[2]);

            await sql`DELETE FROM items WHERE id = ${id}`;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }

        // GET /categories/by-name/:name - 이름으로 카테고리 조회
        if (path.startsWith('/categories/by-name/') && method === 'GET') {
            const name = decodeURIComponent(path.split('/')[3]);

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
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Category not found' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result[0])
            };
        }

        // 404 Not Found
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
