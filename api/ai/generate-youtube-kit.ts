export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const key = (process.env.GEMINI_API_KEY || '').trim();
  const { keyframes = [], videoTitle = '내 동영상' } = req.body || {};

  if (!key) {
    return res.status(400).json({ error: 'Vercel 서버에 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
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

반드시 다음 JSON 형식으로만 응답하세요:
{
  "titles": [
    "실제 영상 프레임의 행동/반응을 반영한 클릭 유발 호기심형 제목",
    "실제 영상 상황과 대결/스토리를 생생하게 담은 흥미진진한 제목",
    "시청자가 바로 눌러보고 싶게 만드는 꿀잼/일상/하이라이트 제목"
  ],
  "videoSummary": "영상 프레임들을 정밀 분석하여 파악한 실제 영상 내용의 1~2줄 요약",
  "chapters": [
    { "time": "00:00", "title": "오프닝 및 시작 상황" },
    ... 제공된 프레임 타임스탬프에 맞춘 실제 상황 요약 챕터 3~5개
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

  return res.status(200).json({
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
}
