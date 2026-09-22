import { OverlayItem } from '../types';
import { SUBTITLE_COLOR_PRESETS } from '../data/stickers';

export interface AutoSubtitleCue {
  text: string;
  startTime: number;
  endTime: number;
}

/**
 * Generates timed smart subtitle cues based on video duration and content theme
 */
export function generateTimedSmartSubtitles(
  duration: number,
  videoTitle: string = '내 동영상'
): AutoSubtitleCue[] {
  const safeDuration = Math.max(duration || 15, 6);
  const cleanTitle = videoTitle.replace(/\.[^/.]+$/, '').slice(0, 12);

  // Kid-friendly subtitle templates with timings (featuring Haon & Riho)
  const sampleCues: string[] = [
    `안녕 친구들! 하온이와 리호의 ${cleanTitle} 시작해볼게요! 👋`,
    '와 대박! 지금 이 장면 진짜 신기하지 않나요? 😲',
    '하온이와 리호의 초특급 도전! 여기서 반전이 일어납니다! 🔥',
    '우와아~ 진짜 빠르고 멋있어요! 🚀',
    '모두 깜짝 놀랄 준비 되셨나요?! 😱',
    '하하하 너무 웃겨요! 꿀잼 보장! 🤣',
    '과연 미션에 성공할 수 있을까요? 끝까지 지켜봐주세요! ✨',
    '재미있으셨다면 구독과 좋아요 꾹꾹 눌러주세요! 💖',
  ];

  // Distribute cues smoothly across the duration
  const cuesCount = Math.min(Math.max(4, Math.floor(safeDuration / 3)), sampleCues.length);
  const segment = safeDuration / cuesCount;

  const result: AutoSubtitleCue[] = [];
  for (let i = 0; i < cuesCount; i++) {
    const start = Math.round(i * segment * 10) / 10;
    const end = Math.round(Math.min(safeDuration, (i + 1) * segment - 0.2) * 10) / 10;
    result.push({
      text: sampleCues[i % sampleCues.length],
      startTime: start,
      endTime: Math.max(start + 1.5, end),
    });
  }

  return result;
}

/**
 * Converts timed cues into styled OverlayItems ready for StickerCanvas
 */
export function cuesToOverlayItems(cues: AutoSubtitleCue[]): OverlayItem[] {
  return cues.map((cue, index) => {
    const colorPreset = SUBTITLE_COLOR_PRESETS[index % SUBTITLE_COLOR_PRESETS.length];
    return {
      id: `auto-sub-${Date.now()}-${index}`,
      type: 'subtitle',
      text: cue.text,
      x: 50,
      y: 82, // Standard bottom subtitle position
      fontSize: 24,
      textColor: colorPreset.text,
      strokeColor: colorPreset.stroke,
      bgColor: colorPreset.bg,
      scale: 1,
      rotation: 0,
      startTime: cue.startTime,
      endTime: cue.endTime,
    };
  });
}
