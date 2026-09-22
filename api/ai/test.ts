export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key) {
    return res.status(400).json({
      success: false,
      error: 'Vercel 환경변수(Environment Variables)에 GEMINI_API_KEY가 등록되지 않았습니다.',
    });
  }

  const models = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let success = false;
  let activeModel = '';
  let lastError = '';

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: '테스트입니다. "연결완료"라고만 답변해주세요.' }] }],
        }),
      });

      if (response.ok) {
        success = true;
        activeModel = model;
        break;
      } else {
        const errData = await response.json().catch(() => ({}));
        lastError = errData?.error?.message || `HTTP ${response.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || '네트워크 연결 오류';
    }
  }

  if (success) {
    return res.status(200).json({
      success: true,
      model: activeModel,
      message: 'AI 연결 정상 확인 완료! 모든 기기에서 즉시 사용 가능합니다.',
    });
  } else {
    return res.status(500).json({
      success: false,
      error: lastError || 'AI 서버 응답 실패',
    });
  }
}
