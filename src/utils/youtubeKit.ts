import { Keyframe, YouTubeUploadKit, YouTubeChapter } from '../types';
import { getStudioFallbackKey } from './gemini';

const DEFAULT_CHECKLIST = [
  {
    title: '⭐ [필수 권장] "아니요, 아동용이 아닙니다" 선택하기',
    checked: true,
    description: 'YouTube Studio 업로드 시 "아니요, 아동용이 아닙니다"로 설정해야 시청자 댓글창, 구독 알림(🔔), 미니플레이어 및 추천 알고리즘이 정상 작동합니다.',
  },
  {
    title: '썸네일 권장 규격 (1280 × 720 HD 16:9)',
    checked: true,
    description: '본 스튜디오에서 다운로드한 썸네일은 유튜브 표준 1280x720 고화질로 자동 렌더링되어 선명하게 노출됩니다.',
  },
  {
    title: '쇼츠(Shorts) 9:16 우측 버튼 & 하단 자막 세이프존',
    checked: true,
    description: '쇼츠 재생 시 우측 좋아요/댓글/공유 버튼과 하단 제목란에 중요한 자막이 가려지지 않도록 배치 완료!',
  },
  {
    title: '시청 지속 시간(AVD)을 높이는 타임스탬프 챕터',
    checked: true,
    description: '설명란에 포함된 00:00 단위 타임스탬프가 유튜브 재생바에 자동으로 챕터로 나뉘어 검색 노출에 유리합니다.',
  },
];

/**
 * Generates an initial or contextual YouTube upload package based on video details and keyframes
 */
export function generateYouTubeUploadKit(
  videoTitle: string = '내 동영상',
  keyframes: Keyframe[] = []
): YouTubeUploadKit {
  const cleanTitle = videoTitle.replace(/\.[^/.]+$/, '').trim() || '하온이와 리호의 신나는 하루';

  // Build chapters using actual keyframe timestamps if available
  const chapters: YouTubeChapter[] = [
    { time: '00:00', title: '오늘의 오프닝 시작! 🎬' },
  ];

  if (keyframes.length > 0) {
    keyframes.slice(0, 4).forEach((kf, idx) => {
      const time = kf.timeFormatted || `00:0${(idx + 1) * 5}`;
      const title = kf.tag ? `${kf.tag} 하이라이트` : `하온이와 리호의 명장면 #${idx + 1}`;
      if (time !== '00:00' && !chapters.some((c) => c.time === time)) {
        chapters.push({ time, title });
      }
    });
  } else {
    chapters.push(
      { time: '00:15', title: '하온이와 리호의 하이라이트 명장면 🔥' },
      { time: '00:45', title: '아무도 예상 못한 반전 결말 😱' },
      { time: '01:20', title: '에필로그 & 다음 편 예고 🌟' }
    );
  }

  const chaptersText = chapters.map((c) => `${c.time} ${c.title}`).join('\n');

  return {
    titles: [
      `🔥 [실화?!] 3초 뒤에 벌어진 일... 하온이와 리호 대패닉! 😱`,
      `👑 하온 VS 리호 물러설 수 없는 진검승부! 과연 최후의 승자는 누구?! 🏆`,
      `✨ ${cleanTitle} | 매 순간 빵빵 터지는 역대급 하이라이트 공개! 꿀잼보장 🎬`,
    ],
    videoSummary: `영상 속 주요 장면들을 포착하여 ${keyframes.length > 0 ? `${keyframes.length}개 핵심 키프레임 타임스탬프` : '인기 유튜브 템플릿'}을 구성했습니다.`,
    chapters,
    description: `안녕하세요! 하온이와 리호의 채널에 오신 여러분을 환영합니다! 💖
오늘 영상에서는 "${cleanTitle}" 신나고 특별한 순간을 함께 담아보았습니다.
영상이 재미있으셨다면 [구독]과 [좋아요 👍], [알림 설정 🔔] 꼭 부탁드립니다!
여러분의 소중한 댓글 하나하나가 큰 힘이 됩니다! 💬

⏱️ [타임스탬프 / 챕터]
${chaptersText}

✨ [출연 및 제작]
- 출연: 하온 & 리호 🌟
- 편집: 하온이와 리호의 전용 스튜디오
- BGM: YouTube Audio Library

#하온이와리호 #일상브이로그 #유튜브쇼츠 #꿀잼영상 #도전영상 #하이라이트`,
    tags: [
      '하온이',
      '리호',
      '하온이와리호',
      '일상브이로그',
      '꿀잼영상',
      '유튜브쇼츠',
      '유튜브동영상',
      '가족일상',
      '도전과제',
      '게임챌린지',
      '하이라이트',
      '반전결말',
      '브이로그',
      'Shorts',
      'YouTubeVlog',
    ],
    hashtags: ['#하온이와리호', '#일상브이로그', '#유튜브쇼츠', '#꿀잼영상', '#Vlog'],
    targetAudience: '남녀노소 누구나 즐길 수 있는 전체 관람가 일반 영상 (아동용 아님 - 댓글 및 알림 활성화)',
    isAiGenerated: false,
    analyzedKeyframeCount: keyframes.length,
    kidFriendlyChecklist: DEFAULT_CHECKLIST,
  };
}

/**
 * AI-powered YouTube SEO Package Generator:
 * Analyzes ACTUAL video keyframes (images + timestamps + tags) using Gemini AI
 */
export async function generateAiYouTubeUploadKit(
  keyframes: Keyframe[],
  videoTitle: string = '내 동영상'
): Promise<YouTubeUploadKit> {
  const cleanTitle = videoTitle.replace(/\.[^/.]+$/, '').trim() || '내 동영상';

  // 1. Try Server API endpoint (/api/ai/generate-youtube-kit)
  try {
    const res = await fetch('/api/ai/generate-youtube-kit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyframes, videoTitle: cleanTitle }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.kit && Array.isArray(data.kit.titles) && data.kit.titles.length > 0) {
        return {
          ...data.kit,
          targetAudience: '남녀노소 누구나 즐길 수 있는 전체 관람가 일반 영상 (아동용 아님 - 댓글 및 알림 활성화)',
          kidFriendlyChecklist: DEFAULT_CHECKLIST,
        };
      }
    }
  } catch (err) {
    console.warn('Server API failed for YouTube kit, trying direct Gemini client call...', err);
  }

  // 2. Direct client fallback via Gemini API
  const directKit = await callGeminiYouTubeKitDirectly(keyframes, cleanTitle);
  if (directKit) {
    return directKit;
  }

  // 3. Smart contextual fallback using actual keyframes
  return generateYouTubeUploadKit(cleanTitle, keyframes);
}

/**
 * Direct client-side Gemini API call with actual keyframe images
 */
async function callGeminiYouTubeKitDirectly(
  keyframes: Keyframe[],
  videoTitle: string
): Promise<YouTubeUploadKit | null> {
  const fallbackKey = getStudioFallbackKey();
  if (!fallbackKey) return null;

  const selectedFrames = keyframes.slice(0, 5);
  const parts: any[] = [];
  const timeSummaries: string[] = [];

  selectedFrames.forEach((kf, idx) => {
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
  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(fallbackKey)}`;
      const response = await fetch(endpoint, {
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

      if (!response.ok) continue;

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = rawText.replace(/```json\s*|```/g, '').trim();
      let parsed: any = null;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      }

      if (parsed && Array.isArray(parsed.titles) && parsed.titles.length > 0) {
        return {
          titles: parsed.titles.slice(0, 3),
          description: parsed.description || '',
          tags: parsed.tags || [],
          hashtags: parsed.hashtags || [],
          videoSummary: parsed.videoSummary || 'AI가 실제 영상 프레임을 분석하여 맞춤 작성했습니다.',
          chapters: parsed.chapters || [],
          targetAudience: '남녀노소 누구나 즐길 수 있는 전체 관람가 일반 영상 (아동용 아님 - 댓글 및 알림 활성화)',
          isAiGenerated: true,
          analyzedKeyframeCount: selectedFrames.length,
          kidFriendlyChecklist: DEFAULT_CHECKLIST,
        };
      }
    } catch (e) {
      console.warn(`Model ${model} failed for direct YouTube kit generation`, e);
    }
  }

  return null;
}
