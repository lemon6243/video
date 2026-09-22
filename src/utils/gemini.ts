import { Keyframe, ThumbnailSuggestion } from '../types';

const API_KEY_STORAGE_KEY = 'kids_tube_gemini_api_key';
export const SUPPORTED_GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

export function getStoredApiKey(): string {
  try {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored && stored !== 'CLEARED' && stored.trim()) {
      return stored.trim();
    }
    return '';
  } catch {
    return '';
  }
}

export function saveStoredApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } catch (err) {
    console.warn('Could not save API key to localStorage', err);
  }
}

export function removeStoredApiKey(): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, 'CLEARED');
  } catch (err) {
    console.warn('Could not remove API key from localStorage', err);
  }
}

export interface GenerationResult {
  suggestions: ThumbnailSuggestion[];
  source: 'gemini' | 'smart-generator';
  error?: string;
}

/**
 * Suggest 3 catchy, stylized Korean thumbnail titles and pairings using Gemini API or smart kid generator
 */
export async function generateThumbnailSuggestions(
  keyframes: Keyframe[],
  videoTitle: string = '내 동영상'
): Promise<GenerationResult> {
  const apiKey = getStoredApiKey();

  if (apiKey && keyframes.length > 0) {
    try {
      const result = await callGeminiMultimodal(apiKey, keyframes, videoTitle);
      if (result && result.length >= 3) {
        return {
          suggestions: result,
          source: 'gemini',
        };
      }
    } catch (err: any) {
      console.warn('Gemini API call error:', err);
      return {
        suggestions: generateSmartKidSuggestions(keyframes, videoTitle),
        source: 'smart-generator',
        error: err?.message || 'Gemini API 호출 중 문제가 발생했습니다.',
      };
    }
  }

  // Fallback / Instant Demo mode if no key
  return {
    suggestions: generateSmartKidSuggestions(keyframes, videoTitle),
    source: 'smart-generator',
    error: !apiKey ? 'API 키가 등록되지 않아 추천 예시 모드로 표시 중입니다.' : undefined,
  };
}

/**
 * Calls Gemini Vision API via direct REST or SDK
 */
async function callGeminiMultimodal(
  apiKey: string,
  keyframes: Keyframe[],
  videoTitle: string
): Promise<ThumbnailSuggestion[] | null> {
  // Use up to 4 keyframes for rich multimodal context
  const selectedFrames = keyframes.slice(0, 4);

  const parts: any[] = [];

  // Add keyframe images
  selectedFrames.forEach((kf) => {
    const base64Data = kf.dataUrl.replace(/^data:image\/\w+;base64,/, '');
    if (base64Data && base64Data.length > 50) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      });
    }
  });

  const promptText = `당신은 초등학생 유튜브 크리에이터를 돕는 최고의 키즈 유튜브 기획자이자 썸네일 전문가입니다.
동영상 제목: "${videoTitle}"
제공된 영상 프레임 이미지들을 분석하여, 초등학생 시청자들의 호기심과 클릭을 폭발시킬 수 있는 기발하고 재미있는 썸네일 제목 3가지를 추천해주세요.

요구사항:
1. 각 썸네일 제목은 크고 눈에 띄며, 초등학생들이 좋아하는 유행어와 이모지(🔥, 😱, ✨, 💥, 🌈, 👑 등)를 포함해야 합니다.
2. 3가지 컨셉:
   - 1번: [충격/반전형] 호기심 자극, 결말 궁금증
   - 2번: [꿀잼/귀염뽀짝형] 캐릭터나 행동의 귀여움과 재미 강조
   - 3번: [초특급 도전/액션형] 스릴 넘치고 흥미진진한 도전
3. 각 제목에 가장 잘 어울리는 프레임 번호 (0 ~ ${Math.max(0, selectedFrames.length - 1)})를 선택하세요.
4. 반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드블록이나 불필요한 설명 금지):

[
  {
    "title": "🔥 [충격] 3초 뒤에 벌어진 일... 실화냐?! 😱",
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

  const cleanKey = apiKey.trim();
  let response: Response | null = null;
  let lastErrorMessage = '';

  for (const model of SUPPORTED_GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey,
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.ok) {
        response = res;
        break;
      } else {
        const errorData = await res.json().catch(() => ({}));
        lastErrorMessage = errorData?.error?.message || `HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastErrorMessage = err?.message || '네트워크 오류';
    }
  }

  if (!response) {
    throw new Error(lastErrorMessage || 'Gemini API 호출에 실패했습니다.');
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Extract JSON from response (clean markdown fences if present)
  const cleanedText = rawText.replace(/```json\s*|```/g, '').trim();
  let parsed: any[] = [];
  try {
    parsed = JSON.parse(cleanedText);
  } catch {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('AI 응답을 JSON으로 변환하지 못했습니다: ' + rawText.slice(0, 100));
    }
  }

  if (!Array.isArray(parsed)) {
    if (parsed && typeof parsed === 'object') {
      parsed = (parsed as any).suggestions || (parsed as any).thumbnails || Object.values(parsed);
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('유효한 썸네일 추천 목록을 받지 못했습니다.');
  }
  return parsed.map((item: any, idx: number) => {
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
      reason: item.reason || 'AI가 영상의 구도와 색감을 정밀 분석하여 선택했습니다.',
      styleTheme: item.styleTheme || (idx === 0 ? 'fire' : idx === 1 ? 'cute' : 'mystery'),
    };
  });
}

/**
 * Smart Kid YouTube Thumbnail generator (used when offline, no key, or demo mode)
 * Provides rich variety across successive clicks
 */
export function generateSmartKidSuggestions(
  keyframes: Keyframe[],
  videoTitle: string
): ThumbnailSuggestion[] {
  const frames = keyframes.length > 0 ? keyframes : [{
    id: 'kf-mock-1',
    time: 2,
    timeFormatted: '00:02',
    dataUrl: '',
    tag: '🌟 베스트 샷',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  }];

  const cleanTitle = videoTitle.replace(/\.[^/.]+$/, '').slice(0, 15) || '내 영상';

  const concept1Pool = [
    {
      title: `🔥 [충격] 3초 뒤 벌어진 일... 실화냐?! 😱`,
      subtitle: `${cleanTitle}의 숨겨진 비밀이 밝혀집니다!`,
      badge: '조회수 100만 각!',
      badgeColor: '#FF4757',
      textColor: '#FFEE55',
      textStrokeColor: '#1A1A1A',
      reason: '가장 박진감 넘치는 액션과 시선 집중도가 높은 프레임으로 클릭률 1위 예상!',
      styleTheme: 'fire' as const,
    },
    {
      title: `🚨 긴급상황 발생!! 절대 혼자 보지 마세요 💥`,
      subtitle: '아무도 예상하지 못한 충격적인 결말 공개!',
      badge: '초특급 반전 🔥',
      badgeColor: '#E11D48',
      textColor: '#FFF200',
      textStrokeColor: '#000000',
      reason: '동작과 눈빛이 살아있는 씬으로 강한 몰입감을 유도합니다.',
      styleTheme: 'fire' as const,
    },
    {
      title: `⚡ 실시간 난리난 그 장면! 선생님도 깜짝 놀람 😲`,
      subtitle: '지금 유튜브에서 가장 핫한 순간 총정리',
      badge: '인기 급상승 🚀',
      badgeColor: '#EF4444',
      textColor: '#FFE600',
      textStrokeColor: '#18181B',
      reason: '다이내믹한 앵글로 시청자가 바로 눌러보고 싶게 만듭니다.',
      styleTheme: 'fire' as const,
    }
  ];

  const concept2Pool = [
    {
      title: `✨ 세상에서 제일 귀여운 순간 포착! 🌈 심쿵주의`,
      subtitle: '보는 내내 미소가 절로 나오는 꿀잼 모음',
      badge: '심쿵주의 💖',
      badgeColor: '#FF6B81',
      textColor: '#FFFFFF',
      textStrokeColor: '#881337',
      reason: '밝은 조명과 친근한 구도로 키즈 시청자들이 가장 호감을 갖는 따뜻한 비주얼입니다.',
      styleTheme: 'cute' as const,
    },
    {
      title: `💖 오늘부터 내 최애 등극! 레전드 힐링 영상 🌟`,
      subtitle: '1초마다 빵빵 터지는 꿀잼 귀요미 대잔치',
      badge: '힐링 100% 🍯',
      badgeColor: '#EC4899',
      textColor: '#FFFBEB',
      textStrokeColor: '#701A75',
      reason: '자연스러운 미소와 친근한 분위기가 돋보이는 썸네일 추천입니다.',
      styleTheme: 'cute' as const,
    },
    {
      title: `🐾 너무 귀여워서 기절할 뻔! 심장 부여잡고 보세요 💕`,
      subtitle: `${cleanTitle} 귀여운 매력에 푹 빠져보세요`,
      badge: '꿀잼 보장 🍭',
      badgeColor: '#F43F5E',
      textColor: '#FEF08A',
      textStrokeColor: '#4C0519',
      reason: '포근하고 따뜻한 색감과 조화되어 친근감을 극대화합니다.',
      styleTheme: 'cute' as const,
    }
  ];

  const concept3Pool = [
    {
      title: `🚨 절대 따라하지 마세요! 상상초월 특급 미션 💥`,
      subtitle: '과연 성공했을까? 끝까지 보면 반전이!',
      badge: '대박 미션 ⚡',
      badgeColor: '#FFA502',
      textColor: '#00F0FF',
      textStrokeColor: '#0F172A',
      reason: '호기심을 극대화하는 클라이맥스 구도로 시청 지속 시간을 끌어올려줍니다.',
      styleTheme: 'mystery' as const,
    },
    {
      title: `🏆 [최종화] 드디어 밝혀진 진실! 승자는 누구?! 👑`,
      subtitle: '마지막 10초에 벌어진 기적의 역전승!',
      badge: '클라이맥스 🏅',
      badgeColor: '#F59E0B',
      textColor: '#38BDF8',
      textStrokeColor: '#0284C7',
      reason: '궁금증을 유발하는 질문형 타이틀과 가장 긴장감 넘치는 장면의 결합입니다.',
      styleTheme: 'mystery' as const,
    },
    {
      title: `🔥 24시간 챌린지 성공?! 역대급 스케일 도전 🎬`,
      subtitle: '모두가 불가능하다고 했던 미션의 결과는?',
      badge: '레전드 챌린지 🎯',
      badgeColor: '#EA580C',
      textColor: '#A7F3D0',
      textStrokeColor: '#064E3B',
      reason: '시청자의 도전 욕구를 자극하여 클릭률을 극대화하는 구도입니다.',
      styleTheme: 'mystery' as const,
    }
  ];

  const c1 = concept1Pool[Math.floor(Math.random() * concept1Pool.length)];
  const c2 = concept2Pool[Math.floor(Math.random() * concept2Pool.length)];
  const c3 = concept3Pool[Math.floor(Math.random() * concept3Pool.length)];

  const f0 = frames[0]?.dataUrl || '';
  const f1 = frames[Math.min(1, frames.length - 1)]?.dataUrl || f0;
  const f2 = frames[Math.min(2, frames.length - 1)]?.dataUrl || f1;

  return [
    {
      id: `smart-thumb-1-${Date.now()}`,
      ...c1,
      keyframeId: frames[1]?.id || frames[0].id,
      keyframeDataUrl: f1,
    },
    {
      id: `smart-thumb-2-${Date.now()}`,
      ...c2,
      keyframeId: frames[0]?.id || frames[0].id,
      keyframeDataUrl: f0,
    },
    {
      id: `smart-thumb-3-${Date.now()}`,
      ...c3,
      keyframeId: frames[2]?.id || frames[0].id,
      keyframeDataUrl: f2,
    },
  ];
}
