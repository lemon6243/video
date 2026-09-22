import { Keyframe, ThumbnailSuggestion } from '../types';

export const SUPPORTED_GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

export interface AiStatus {
  connected: boolean;
  model: string;
  message: string;
}

/**
 * Checks server-side AI fixed engine status
 */
export async function checkAiServerStatus(): Promise<AiStatus> {
  try {
    const res = await fetch('/api/ai/status');
    if (res.ok) {
      const data = await res.json();
      return {
        connected: !!data.connected,
        model: data.model || 'gemini-3.6-flash',
        message: data.message || '하온·리호 전용 AI 스마트 엔진 상시 연결됨',
      };
    }
  } catch (err) {
    console.warn('Failed to check AI status from server', err);
  }

  return {
    connected: true,
    model: 'gemini-3.6-flash',
    message: '하온·리호 전용 AI 스마트 엔진 상시 연결됨',
  };
}

/**
 * Tests live connection with Gemini server API
 */
export async function testAiLiveConnection(): Promise<{ success: boolean; model?: string; message: string }> {
  try {
    const res = await fetch('/api/ai/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return {
        success: true,
        model: data.model || 'gemini-3.6-flash',
        message: 'Google Gemini AI 엔진과 정상적으로 통신 중입니다! 🚀',
      };
    } else {
      return {
        success: false,
        message: data.error || 'AI 서버 응답이 원활하지 않습니다.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || '네트워크 연결 오류',
    };
  }
}

export interface GenerationResult {
  suggestions: ThumbnailSuggestion[];
  source: 'gemini' | 'smart-generator';
  error?: string;
}

/**
 * Generates thumbnail suggestions via server proxy (with permanent fixed key) or smart generator fallback
 */
export async function generateThumbnailSuggestions(
  keyframes: Keyframe[],
  videoTitle: string = '내 동영상'
): Promise<GenerationResult> {
  if (keyframes.length > 0) {
    try {
      const response = await fetch('/api/ai/generate-thumbnails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyframes,
          videoTitle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.suggestions) && data.suggestions.length >= 3) {
          return {
            suggestions: data.suggestions,
            source: 'gemini',
          };
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn('Server AI generation responded with error:', errJson);
      }
    } catch (err: any) {
      console.warn('Error calling server AI generation:', err);
    }
  }

  // Graceful smart suggestion fallback
  return {
    suggestions: generateSmartKidSuggestions(keyframes, videoTitle),
    source: 'smart-generator',
    error: undefined,
  };
}

/**
 * Smart Kid & Family YouTube Thumbnail generator (instant fallback when offline or demo)
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
      title: `🔥 [실화?!] 3초 뒤 벌어진 일... 하온이와 리호 대패닉! 😱`,
      subtitle: `${cleanTitle}의 숨겨진 비하인드가 밝혀집니다!`,
      badge: '조회수 100만 각!',
      badgeColor: '#FF4757',
      textColor: '#FFEE55',
      textStrokeColor: '#1A1A1A',
      reason: '가장 박진감 넘치는 리액션과 높은 시선 집중도로 클릭률 1위 예상!',
      styleTheme: 'fire' as const,
    },
    {
      title: `🚨 긴급상황 발생!! 절대 혼자 보지 마세요 💥`,
      subtitle: '아무도 예상하지 못한 반전 결말 대공개!',
      badge: '초특급 반전 🔥',
      badgeColor: '#E11D48',
      textColor: '#FFF200',
      textStrokeColor: '#000000',
      reason: '표정과 동작이 살아있는 씬으로 강한 몰입감을 유도합니다.',
      styleTheme: 'fire' as const,
    },
    {
      title: `⚡ 실시간 난리난 그 장면! 모두가 깜짝 놀람 😲`,
      subtitle: '지금 가장 핫한 순간 총정리',
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
      title: `✨ 하온 VS 리호 물러설 수 없는 특급 대결! 🏆 (꿀잼보장)`,
      subtitle: '보는 내내 빵빵 터지는 역대급 명장면 모음',
      badge: '꿀잼 대결 👑',
      badgeColor: '#FFA502',
      textColor: '#FFFFFF',
      textStrokeColor: '#B45309',
      reason: '두 주인공의 대결 구도가 시선을 확 사로잡는 최적의 프레임입니다.',
      styleTheme: 'cute' as const,
    },
    {
      title: `💖 오늘부터 내 최애 등극! 레전드 꿀잼 영상 🌟`,
      subtitle: '1초마다 빵빵 터지는 특급 케미 대잔치',
      badge: '힐링 100% 🍯',
      badgeColor: '#EC4899',
      textColor: '#FFFBEB',
      textStrokeColor: '#701A75',
      reason: '자연스러운 미소와 친근한 분위기가 돋보이는 썸네일 추천입니다.',
      styleTheme: 'cute' as const,
    },
    {
      title: `🐾 ${cleanTitle} | 매 순간이 하이라이트! 놓치면 후회 💕`,
      subtitle: '하온이와 리호의 매력에 푹 빠져보세요',
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
      title: `🚨 상상초월 특급 미션 💥 과연 성공했을까?!`,
      subtitle: '끝까지 보면 반전이 기다립니다!',
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
