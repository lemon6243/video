import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser (high limit for base64 keyframe images)
  app.use(express.json({ limit: '50mb' }));

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // 2. AI Connection Status
  app.get('/api/ai/status', (req, res) => {
    const key = process.env.GEMINI_API_KEY?.trim() || '';
    const isConnected = key.length > 0;
    res.json({
      connected: isConnected,
      hasKey: isConnected,
      model: 'gemini-3.6-flash',
      message: isConnected
        ? '하온·리호 전용 AI 스마트 엔진이 항상 연결되어 있습니다.'
        : 'API 키가 설정되지 않았습니다.',
    });
  });

  // 3. AI Connection Test
  app.post('/api/ai/test', async (req, res) => {
    const key = process.env.GEMINI_API_KEY?.trim() || '';
    if (!key) {
      return res.status(400).json({ success: false, error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
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
      return res.json({
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
  });

  // 4. Generate AI Thumbnails from Video Keyframes
  app.post('/api/ai/generate-thumbnails', async (req, res) => {
    const key = process.env.GEMINI_API_KEY?.trim() || '';
    const { keyframes = [], videoTitle = '내 동영상' } = req.body || {};

    if (!key) {
      return res.status(400).json({ error: '서버에 API 키가 설정되지 않았습니다.' });
    }

    const selectedFrames = (keyframes || []).slice(0, 4);
    const parts: any[] = [];

    selectedFrames.forEach((kf: any) => {
      const base64Data = (kf.dataUrl || '').replace(/^data:image\/\w+;base64,/, '');
      if (base64Data && base64Data.length > 50) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        });
      }
    });

    const promptText = `당신은 유튜브 크리에이터를 돕는 최고의 유튜브 기획자이자 썸네일 전문가입니다.
동영상 제목: "${videoTitle}"
제공된 영상 프레임 이미지들을 정밀 분석하여, 시청자들의 호기심과 클릭(CTR)을 폭발시킬 수 있는 기발하고 재미있는 썸네일 제목 3가지를 추천해주세요.
참고: 본 영상은 아동용(Made for Kids)으로 제한되지 않는 남녀노소 누구나 즐기는 전체 관람가 일반 영상(브이로그, 대결, 챌린지 등)입니다.

요구사항:
1. 각 썸네일 제목은 크고 눈에 띄며, 시청자들이 좋아하는 유행어와 이모지(🔥, 😱, ✨, 💥, 🌈, 👑 등)를 포함해야 합니다.
2. 3가지 컨셉:
   - 1번: [충격/반전형] 호기심 자극, 결말 궁금증
   - 2번: [꿀잼/일상형] 캐릭터나 행동의 귀여움과 재미 강조
   - 3번: [초특급 도전/액션형] 스릴 넘치고 흥미진진한 도전
3. 각 제목에 가장 잘 어울리는 프레임 번호 (0 ~ ${Math.max(0, selectedFrames.length - 1)})를 선택하세요.
4. 반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드블록이나 불필요한 설명 금지):

[
  {
    "title": "🔥 [실화?!] 3초 뒤에 벌어진 일... 하온이와 리호 대패닉! 😱",
    "subtitle": "모두가 깜짝 놀란 반전 결말 대공개!",
    "badge": "조회수 100만 각!",
    "badgeColor": "#FF4757",
    "textColor": "#FFF200",
    "textStrokeColor": "#1E1E1E",
    "keyframeIndex": 0,
    "reason": "표정과 동작이 가장 역동적이어서 시청자의 눈길을 확 사로잡아요!",
    "styleTheme": "fire"
  }
]`;

    parts.push({ text: promptText });

    const models = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let geminiResp: any = null;
    let lastError = '';

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
        const r = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.8,
              topP: 0.95,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (r.ok) {
          geminiResp = await r.json();
          break;
        } else {
          const errJson = await r.json().catch(() => ({}));
          lastError = errJson?.error?.message || `HTTP ${r.status}`;
        }
      } catch (e: any) {
        lastError = e?.message || '네트워크 호출 실패';
      }
    }

    if (!geminiResp) {
      return res.status(500).json({ error: lastError || 'AI 추천 생성 실패' });
    }

    const rawText = geminiResp?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanedText = rawText.replace(/```json\s*|```/g, '').trim();
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    }

    if (!Array.isArray(parsed) && parsed && typeof parsed === 'object') {
      parsed = (parsed as any).suggestions || (parsed as any).thumbnails || Object.values(parsed);
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return res.status(500).json({ error: '유효한 썸네일 추천을 생성하지 못했습니다.' });
    }

    const suggestions = parsed.map((item: any, idx: number) => {
      const kfIdx = Math.min(Math.max(0, item.keyframeIndex ?? idx), keyframes.length - 1);
      const targetKf = keyframes[kfIdx] || keyframes[0];
      return {
        id: `gemini-thumb-${idx + 1}-${Date.now()}`,
        title: item.title || `🔥 대박 하이라이트 영상 #${idx + 1}`,
        subtitle: item.subtitle || '놓치면 후회할 꿀잼 영상!',
        badge: item.badge || 'HOT 추천!',
        badgeColor: item.badgeColor || (idx === 0 ? '#FF4757' : idx === 1 ? '#FFA502' : '#2ED573'),
        textColor: item.textColor || '#FFF200',
        textStrokeColor: item.textStrokeColor || '#000000',
        keyframeId: targetKf?.id || 'kf-1',
        keyframeDataUrl: targetKf?.dataUrl || '',
        reason: item.reason || 'AI가 영상의 구도와 색감을 정밀 분석하여 추천했습니다.',
        styleTheme: item.styleTheme || (idx === 0 ? 'fire' : idx === 1 ? 'cute' : 'mystery'),
      };
    });

    return res.json({ suggestions });
  });

  // 4. Generate AI YouTube SEO Kit (analyzes actual video keyframe images, titles, timestamps)
  app.post('/api/ai/generate-youtube-kit', async (req, res) => {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    const { keyframes = [], videoTitle = '내 동영상' } = req.body || {};

    if (!key) {
      return res.status(400).json({ error: '서버에 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
    }

    const selectedFrames = (keyframes || []).slice(0, 5);
    const parts: any[] = [];
    const timeSummaries: string[] = [];

    selectedFrames.forEach((kf: any, idx: number) => {
      const base64Data = (kf.dataUrl || '').replace(/^data:image\/\w+;base64,/, '');
      if (base64Data && base64Data.length > 50) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        });
        timeSummaries.push(`프레임 #${idx + 1}: 타임스탬프 [${kf.timeFormatted || '00:00'}] - 태그: ${kf.tag || '하이라이트'}`);
      }
    });

    const promptText = `당신은 대한민국 최고의 유튜브 채널 성장 전략가이자 영상 SEO 마케팅 전문가입니다.
동영상 제목/가제: "${videoTitle}"
제공된 영상 프레임 이미지들(${selectedFrames.length}장)과 각 프레임의 재생 시간 정보를 정밀하게 시각 분석하세요.

프레임 타임스탬프 및 장면 정보:
${timeSummaries.join('\n')}

요청 과업:
이 영상의 실제 시각적 내용(등장인물, 배경 장소, 주요 행동, 사물/소품, 표정 및 액션, 사건 전개)을 정밀 분석하여, YouTube 검색 알고리즘 노출과 시청자 유입률(CTR), 시청 지속시간(AVD)을 극대화할 수 있는 '유튜브 업로드 SEO 패키지'를 작성해 주세요.
참고: 본 영상은 아동용(Made for Kids)으로 제한되지 않는 남녀노소 누구나 즐기는 전체 관람가 일반 영상(브이로그, 대결, 챌린지 등)이며, 댓글창과 알림 활성화가 필수적입니다.

반드시 다음 JSON 형식으로만 응답하세요 (코드 블록이나 잡담 없이 JSON만 출력):
{
  "titles": [
    "실제 영상 프레임의 행동/반응을 반영한 클릭 유발 호기심형 제목",
    "실제 영상 상황과 대결/스토리를 생생하게 담은 흥미진진한 제목",
    "시청자가 바로 눌러보고 싶게 만드는 꿀잼/일상/하이라이트 제목"
  ],
  "videoSummary": "영상 프레임들을 정밀 분석하여 파악한 실제 영상 내용의 1~2줄 요약",
  "chapters": [
    { "time": "00:00", "title": "오프닝 및 시작 상황" }
  ],
  "description": "실제 영상 내용의 매력을 생생하게 담고 시청자 소통(댓글, 좋아요, 구독, 알림)을 유도하는 완성형 유튜브 설명글 전문 (위 챕터 타임스탬프 포함)",
  "tags": [
    "실제 영상 내용 관련 핵심 키워드 15~20개 (한글 및 영어)"
  ],
  "hashtags": [
    "#영상맞춤해시태그1",
    "#영상맞춤해시태그2",
    "#영상맞춤해시태그3",
    "#영상맞춤해시태그4",
    "#영상맞춤해시태그5"
  ]
}`;

    parts.push({ text: promptText });

    const models = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let geminiResp: any = null;
    let lastError = '';

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
        const r = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (r.ok) {
          geminiResp = await r.json();
          break;
        } else {
          const errJson = await r.json().catch(() => ({}));
          lastError = errJson?.error?.message || `HTTP ${r.status}`;
        }
      } catch (e: any) {
        lastError = e?.message || '네트워크 호출 실패';
      }
    }

    if (!geminiResp) {
      return res.status(500).json({ error: lastError || 'AI 유튜브 SEO 패키지 생성 실패' });
    }

    const rawText = geminiResp?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanedText = rawText.replace(/```json\s*|```/g, '').trim();
    let parsed: any = null;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    }

    if (!parsed || !Array.isArray(parsed.titles)) {
      return res.status(500).json({ error: '유효한 SEO 패키지를 생성하지 못했습니다.' });
    }

    return res.json({
      kit: {
        titles: parsed.titles.slice(0, 3),
        description: parsed.description || '',
        tags: parsed.tags || [],
        hashtags: parsed.hashtags || [],
        videoSummary: parsed.videoSummary || 'AI가 영상 프레임을 분석하여 맞춤 작성했습니다.',
        chapters: parsed.chapters || [],
        isAiGenerated: true,
        analyzedKeyframeCount: selectedFrames.length,
      },
    });
  });

  // Vite middleware in development vs static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express 5 wildcard routing
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
