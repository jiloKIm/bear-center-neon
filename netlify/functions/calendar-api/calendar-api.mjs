import { neon } from '@neondatabase/serverless';

export const handler = async (event, context) => {
  // CORS 헤더
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS 요청 처리 (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 네온 데이터베이스 연결 - 공백 제거
    const dbUrl = process.env.DATABASE_URL.replace(/\s+/g, '');
    const sql = neon(dbUrl);

    // GET: 모든 일정 조회
    if (event.httpMethod === 'GET') {
      const events = await sql`SELECT * FROM schedule_events ORDER BY created_at DESC`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(events)
      };
    }

    // POST: 새 일정 추가
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      
      const result = await sql`
        INSERT INTO schedule_events (date_value, title, category, color) 
        VALUES (${data.date_value}, ${data.title}, ${data.category}, ${data.color || '#333333'})
        RETURNING *
      `;
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result[0])
      };
    }

    // PUT: 일정 수정
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      
      const result = await sql`
        UPDATE schedule_events 
        SET title = ${data.title}, category = ${data.category}, color = ${data.color || '#333333'}
        WHERE id = ${data.id}
        RETURNING *
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result[0])
      };
    }

    // DELETE: 일정 삭제
    if (event.httpMethod === 'DELETE') {
      const data = JSON.parse(event.body);
      
      await sql`DELETE FROM schedule_events WHERE id = ${data.id}`;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server error',
        message: error.message 
      })
    };
  }
};