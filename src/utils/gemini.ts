import { Keyframe, ThumbnailSuggestion } from '../types';

const API_KEY_STORAGE_KEY = 'kids_tube_gemini_api_key';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
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
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not remove API key from localStorage', err);
  }
}

/**
 * Suggest 3 catchy, stylized Korean thumbnail titles and pairings using Gemini API or smart kid generator
 */
export async function generateThumbnailSuggestions(
  keyframes: Keyframe[],
  videoTitle: string = '내 동영상'
): Promise<ThumbnailSuggestion[]> {
  const apiKey = getStoredApiKey();

  if (apiKey && keyframes.length > 0) {
    try {
      const result = await callGeminiMultimodal(apiKey, keyframes, videoTitle);
      if (result && result.length >= 3) {
        return result;
      }
    } catch (err) {
      console.warn('Gemini API call encountered an issue, falling back to smart kid generator:', err);
    }
  }

  // Fallback / Instant Demo mode if no key or API network issue
  return generateSmartKidSuggestions(keyframes, videoTitle);
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

  // Use supported Gemini model (gemini-2.5-flash or gemini-3.8-flash for vision)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API Error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Extract JSON from response
  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON array from Gemini response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
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

  const frame0 = frames[0]?.dataUrl || '';
  const frame1 = frames[1]?.dataUrl || frame0;
  const frame2 = frames[2]?.dataUrl || frame1;

  const cleanTitle = videoTitle.replace(/\.[^/.]+$/, '').slice(0, 15);

  return [
    {
      id: `smart-thumb-1-${Date.now()}`,
      title: `🔥 [충격] 3초 뒤 벌어진 일... 실화냐?! 😱`,
      subtitle: `${cleanTitle}의 숨겨진 비밀이 밝혀집니다!`,
      badge: '조회수 100만 각!',
      badgeColor: '#FF4757',
      textColor: '#FFEE55',
      textStrokeColor: '#1A1A1A',
      keyframeId: frames[1]?.id || frames[0].id,
      keyframeDataUrl: frame1,
      reason: '가장 박진감 넘치는 액션과 시선 집중도가 높은 프레임으로 클릭률 1위 예상!',
      styleTheme: 'fire',
    },
    {
      id: `smart-thumb-2-${Date.now()}`,
      title: `✨ 세상에서 제일 귀여운 순간 포착! 🌈 심쿵주의`,
      subtitle: '보는 내내 미소가 절로 나오는 꿀잼 모음',
      badge: '심쿵주의 💖',
      badgeColor: '#FF6B81',
      textColor: '#FFFFFF',
      textStrokeColor: '#881337',
      keyframeId: frames[0]?.id || frames[0].id,
      keyframeDataUrl: frame0,
      reason: '밝은 조명과 친근한 구도로 키즈 시청자들이 가장 호감을 갖는 따뜻한 비주얼입니다.',
      styleTheme: 'cute',
    },
    {
      id: `smart-thumb-3-${Date.now()}`,
      title: `🚨 절대 따라하지 마세요! 상상초월 특급 미션 💥`,
      subtitle: '과연 성공했을까? 끝까지 보면 반전이!',
      badge: '대박 미션 ⚡',
      badgeColor: '#FFA502',
      textColor: '#00F0FF',
      textStrokeColor: '#0F172A',
      keyframeId: frames[2]?.id || frames[0].id,
      keyframeDataUrl: frame2,
      reason: '호기심을 극대화하는 클라이맥스 구도로 시청 지속 시간을 끌어올려줍니다.',
      styleTheme: 'mystery',
    },
  ];
}
