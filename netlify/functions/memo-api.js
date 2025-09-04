// 메모 관리 API - Neon PostgreSQL 연동
const { Pool } = require('pg');

// Neon 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getMemos(headers);
      case 'POST':
        return await createMemo(JSON.parse(event.body), headers);
      case 'PUT':
        return await updateMemo(JSON.parse(event.body), headers);
      case 'DELETE':
        return await deleteMemo(JSON.parse(event.body), headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    console.error('API 오류:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '서버 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};

// 모든 메모 조회
async function getMemos(headers) {
  const query = `
    SELECT id, category, title, content, organized_content, keywords, 
           summary, action_items, sentiment_analysis, created_at, updated_at
    FROM memos 
    ORDER BY created_at DESC
  `;
  
  const result = await pool.query(query);
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.rows),
  };
}

// 새 메모 생성
async function createMemo(memoData, headers) {
  const { category, title, content } = memoData;
  
  if (!category || !title || !content) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: '필수 필드가 누락되었습니다.' }),
    };
  }

  const query = `
    INSERT INTO memos (category, title, content, created_at, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  
  const result = await pool.query(query, [category, title, content]);
  
  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(result.rows[0]),
  };
}

// 메모 수정
async function updateMemo(memoData, headers) {
  const { 
    id, category, title, content, organized_content, 
    keywords, summary, action_items, sentiment_analysis 
  } = memoData;
  
  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'ID가 필요합니다.' }),
    };
  }

  const query = `
    UPDATE memos 
    SET category = COALESCE($2, category),
        title = COALESCE($3, title),
        content = COALESCE($4, content),
        organized_content = COALESCE($5, organized_content),
        keywords = COALESCE($6, keywords),
        summary = COALESCE($7, summary),
        action_items = COALESCE($8, action_items),
        sentiment_analysis = COALESCE($9, sentiment_analysis),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    id, category, title, content, organized_content,
    keywords, summary, action_items, sentiment_analysis
  ]);
  
  if (result.rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: '메모를 찾을 수 없습니다.' }),
    };
  }
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.rows[0]),
  };
}

// 메모 삭제
async function deleteMemo(data, headers) {
  const { id } = data;
  
  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'ID가 필요합니다.' }),
    };
  }

  const query = 'DELETE FROM memos WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [id]);
  
  if (result.rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: '메모를 찾을 수 없습니다.' }),
    };
  }
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: '메모가 삭제되었습니다.', id }),
  };
}