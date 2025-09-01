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

    // GET: 모든 물품 조회
    if (event.httpMethod === 'GET') {
      // 헬스 체크
      if (event.queryStringParameters && event.queryStringParameters.health === 'check') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            status: 'OK',
            timestamp: new Date().toISOString(),
            databaseConnected: true
          })
        };
      }
      
      const items = await sql`SELECT * FROM inventory_items ORDER BY created_at DESC`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(items)
      };
    }

    // POST: 새 물품 추가
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      
      const result = await sql`
        INSERT INTO inventory_items (type, status, name, amount, quantity, details, notes, installation_location, created_at) 
        VALUES (${data.type}, ${data.status}, ${data.name}, ${data.amount}, ${data.quantity}, ${data.details}, ${data.notes}, ${data.installation_location}, ${data.created_at})
        RETURNING *
      `;
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result[0])
      };
    }

    // PUT: 물품 수정
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      
      const result = await sql`
        UPDATE inventory_items 
        SET type = ${data.type}, status = ${data.status}, name = ${data.name}, 
            amount = ${data.amount}, quantity = ${data.quantity}, details = ${data.details}, notes = ${data.notes}, installation_location = ${data.installation_location}
        WHERE id = ${data.id}
        RETURNING *
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result[0])
      };
    }

    // DELETE: 물품 삭제
    if (event.httpMethod === 'DELETE') {
      const data = JSON.parse(event.body);
      
      await sql`DELETE FROM inventory_items WHERE id = ${data.id}`;
      
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
    console.error('Request method:', event.httpMethod);
    console.error('Request body:', event.body);
    console.error('Database URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 'undefined');
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server error',
        message: error.message,
        details: error.stack
      })
    };
  }
};