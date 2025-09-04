// AI 텍스트 처리 Netlify Function
// Hugging Face Inference API를 사용한 무료 텍스트 마이닝 및 정리

// Hugging Face API 설정
const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN || 'hf_demo'; // 무료 토큰

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 처리
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { text, category, task } = JSON.parse(event.body);

    if (!text || !text.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '처리할 텍스트를 입력해주세요.' }),
      };
    }

    let systemPrompt = '';
    let userPrompt = '';

    // 작업 유형에 따른 프롬프트 설정
    switch (task) {
      case 'organize':
        systemPrompt = getOrganizePrompt(category);
        userPrompt = `다음 텍스트를 정리해주세요:\n\n${text}`;
        break;
      
      case 'extract_keywords':
        systemPrompt = '텍스트에서 핵심 키워드와 주요 개념을 추출하는 전문가입니다.';
        userPrompt = `다음 텍스트에서 중요한 키워드 10개를 추출하고, 각각에 대해 간단한 설명을 제공해주세요:\n\n${text}`;
        break;
      
      case 'sentiment_analysis':
        systemPrompt = '텍스트의 감정과 톤을 분석하는 전문가입니다.';
        userPrompt = `다음 텍스트의 감정 톤을 분석하고, 긍정적/중립적/부정적 측면을 평가해주세요:\n\n${text}`;
        break;
      
      case 'summarize':
        systemPrompt = '복잡한 텍스트를 핵심 내용만 간결하게 요약하는 전문가입니다.';
        userPrompt = `다음 텍스트를 3-5개의 핵심 포인트로 요약해주세요:\n\n${text}`;
        break;
      
      case 'action_items':
        systemPrompt = '텍스트에서 실행 가능한 액션 아이템을 추출하는 전문가입니다.';
        userPrompt = `다음 텍스트에서 실행해야 할 구체적인 액션 아이템들을 추출하고 우선순위를 매겨주세요:\n\n${text}`;
        break;
      
      default:
        systemPrompt = getOrganizePrompt(category);
        userPrompt = `다음 텍스트를 정리해주세요:\n\n${text}`;
    }

    // Hugging Face API 호출 (무료)
    const processedText = await callHuggingFaceAPI(userPrompt, task);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        originalText: text,
        processedText: processedText,
        category: category,
        task: task,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('AI 처리 오류:', error);

    // API 키가 없는 경우
    if (error.message.includes('API key')) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'AI 서비스 설정이 필요합니다. 관리자에게 문의해주세요.',
          fallback: getFallbackResponse(JSON.parse(event.body)),
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'AI 처리 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        fallback: getFallbackResponse(JSON.parse(event.body)),
      }),
    };
  }
};

// 카테고리별 정리 프롬프트
function getOrganizePrompt(category) {
  const basePrompt = '당신은 사육곰 센터 관리 시스템의 텍스트 정리 전문가입니다. 주어진 텍스트를 구조화하고 정리해주세요.';
  
  switch (category) {
    case '요구사항':
      return `${basePrompt}

요구사항 텍스트를 다음 형식으로 정리해주세요:

**📋 요구사항 분석**
- **핵심 요구사항**: 가장 중요한 요구사항 3-5개
- **기술적 요구사항**: 기술적으로 구현해야 할 사항
- **비즈니스 요구사항**: 업무 프로세스 관련 요구사항
- **우선순위**: 높음/중간/낮음으로 분류
- **예상 일정**: 구현 예상 기간
- **고려사항**: 주의할 점이나 제약사항

HTML 형식으로 보기 좋게 정리해주세요.`;

    case '업체':
      return `${basePrompt}

업체 관련 텍스트를 다음 형식으로 정리해주세요:

**🏢 업체 정보**
- **업체명**: [업체명]
- **연락처**: 전화번호, 이메일, 주소
- **담당자**: 이름 및 직책
- **제공 서비스**: 주요 서비스 및 제품
- **강점**: 업체의 경쟁력
- **계약 조건**: 가격, 납기, 보증 등
- **특이사항**: 주목할 점이나 문제점
- **평가**: 종합적인 업체 평가

HTML 형식으로 보기 좋게 정리해주세요.`;

    case '계약':
      return `${basePrompt}

계약 관련 텍스트를 다음 형식으로 정리해주세요:

**📄 계약 사항**
- **계약 제목**: [계약명]
- **계약 당사자**: 우리 측과 상대방
- **계약 기간**: 시작일 ~ 종료일
- **계약 금액**: 총액 및 지급 조건
- **주요 조건**: 핵심 계약 조건들
- **의무사항**: 각 당사자의 의무
- **위험 요소**: 잠재적 리스크
- **다음 단계**: 진행해야 할 절차
- **검토 필요**: 법무팀 검토가 필요한 부분

HTML 형식으로 보기 좋게 정리해주세요.`;

    case '아이디어':
      return `${basePrompt}

아이디어 텍스트를 다음 형식으로 정리해주세요:

**💡 아이디어 정리**
- **핵심 아이디어**: 메인 아이디어 요약
- **배경/동기**: 왜 이 아이디어를 생각했는지
- **구현 방법**: 구체적인 실행 방안
- **필요 자원**: 인력, 예산, 시간, 기술
- **기대 효과**: 예상되는 긍정적 결과
- **잠재적 문제**: 예상되는 어려움이나 장애물
- **다음 액션**: 바로 실행할 수 있는 첫 단계
- **성공 지표**: 성공 여부를 판단할 기준

HTML 형식으로 보기 좋게 정리해주세요.`;

    default:
      return `${basePrompt} 텍스트를 논리적이고 체계적으로 정리하여 HTML 형식으로 제공해주세요.`;
  }
}

// Hugging Face API 호출 함수 (무료)
async function callHuggingFaceAPI(prompt, task) {
  try {
    // 무료 모델들을 순서대로 시도
    const models = [
      'microsoft/DialoGPT-medium',
      'gpt2',
      'distilgpt2'
    ];

    for (const model of models) {
      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 500,
              temperature: 0.7,
              do_sample: true,
              top_p: 0.9
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result && result[0] && result[0].generated_text) {
            return formatAIResponse(result[0].generated_text, task);
          }
        }
      } catch (modelError) {
        console.log(`모델 ${model} 실패, 다음 시도...`);
        continue;
      }
    }

    // 모든 모델 실패시 로컬 처리
    throw new Error('모든 AI 모델 호출 실패');
    
  } catch (error) {
    console.error('HuggingFace API 오류:', error);
    // 로컬 처리로 폴백
    return getSimpleAIResponse(prompt, task);
  }
}

// AI 응답 포맷팅
function formatAIResponse(text, task) {
  // 생성된 텍스트를 HTML 형식으로 정리
  let formatted = text.replace(/\n/g, '<br>');
  
  switch(task) {
    case 'extract_keywords':
      return `<strong>🏷️ 키워드 분석</strong><br><br>${formatted}`;
    case 'summarize':
      return `<strong>📝 요약</strong><br><br>${formatted}`;
    case 'action_items':
      return `<strong>✅ 액션 아이템</strong><br><br>${formatted}`;
    case 'sentiment_analysis':
      return `<strong>💭 감성 분석</strong><br><br>${formatted}`;
    default:
      return `<strong>🤖 AI 정리</strong><br><br>${formatted}`;
  }
}

// 간단한 AI 응답 (완전 폴백)
function getSimpleAIResponse(prompt, task) {
  const content = prompt.substring(prompt.lastIndexOf('\n\n') + 2);
  
  switch(task) {
    case 'extract_keywords':
      const words = content.split(' ').filter(w => w.length > 3);
      const keywords = [...new Set(words)].slice(0, 8);
      return `<strong>🏷️ 키워드 분석 (기본)</strong><br><br>${keywords.map(k => `• ${k}`).join('<br>')}`;
      
    case 'summarize':
      const sentences = content.split('.').filter(s => s.trim().length > 10);
      const summary = sentences.slice(0, 3).join('. ');
      return `<strong>📝 요약 (기본)</strong><br><br>${summary}`;
      
    case 'action_items':
      return `<strong>✅ 액션 아이템 (기본)</strong><br><br>• 상세 검토 필요<br>• 관련 부서와 협의<br>• 일정 수립 및 실행`;
      
    default:
      return `<strong>🤖 기본 정리</strong><br><br>${content.substring(0, 300)}${content.length > 300 ? '...' : ''}`;
  }
}

// API 오류 시 폴백 응답
function getFallbackResponse(requestData) {
  const { text, category, task } = requestData;
  
  let fallbackText = `<strong>📝 기본 정리 (AI 서비스 일시 중단)</strong><br><br>`;
  fallbackText += `<strong>원본 내용:</strong><br>${text.substring(0, 500)}${text.length > 500 ? '...' : ''}<br><br>`;
  fallbackText += `<strong>카테고리:</strong> ${category}<br>`;
  fallbackText += `<strong>처리 시간:</strong> ${new Date().toLocaleString()}<br><br>`;
  fallbackText += `<em>현재 AI 텍스트 정리 서비스가 일시적으로 중단되어 기본 형식으로 표시됩니다.<br>`;
  fallbackText += `나중에 다시 시도하시거나 관리자에게 문의해주세요.</em>`;
  
  return fallbackText;
}