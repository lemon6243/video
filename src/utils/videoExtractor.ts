import { Keyframe } from '../types';
import { formatTime } from './formatTime';

const TAG_PRESETS = [
  { tag: '🌟 주인공 첫 등장!', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { tag: '🔥 썸네일 1순위 후보!', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { tag: '💥 클라이맥스 순간!', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { tag: '👀 깜짝 놀란 표정!', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { tag: '✨ 엔딩 명장면!', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { tag: '🌈 꿀잼 포인트!', color: 'bg-pink-100 text-pink-800 border-pink-300' },
];

/**
 * Extracts 4-6 keyframes from an HTMLVideoElement or video URL/file
 */
export async function extractVideoKeyframes(
  videoSource: string | File,
  count: number = 5,
  onProgress?: (percent: number) => void
): Promise<Keyframe[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    let objectUrl = '';
    if (typeof videoSource === 'string') {
      video.src = videoSource;
    } else {
      objectUrl = URL.createObjectURL(videoSource);
      video.src = objectUrl;
    }

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      video.remove();
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 10;
        const keyframes: Keyframe[] = [];

        // Calculate time points
        const times: number[] = [];
        if (duration <= count) {
          const step = Math.max(0.5, duration / (count + 1));
          for (let i = 1; i <= count; i++) {
            times.push(Math.min(duration - 0.2, i * step));
          }
        } else {
          // Sample nicely distributed points avoiding very start/end black frames
          const percentages = [0.12, 0.32, 0.52, 0.72, 0.90];
          for (let i = 0; i < Math.min(count, percentages.length); i++) {
            times.push(duration * percentages[i]);
          }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Target 16:9 thumbnail resolution (e.g. 640x360 for fast preview)
        const targetWidth = 640;
        const targetHeight = 360;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        for (let i = 0; i < times.length; i++) {
          const t = times[i];
          const frameDataUrl = await seekAndCapture(video, canvas, ctx, t);
          const tagInfo = TAG_PRESETS[i % TAG_PRESETS.length];

          keyframes.push({
            id: `keyframe-${i + 1}`,
            time: Math.round(t * 10) / 10,
            timeFormatted: formatTime(t),
            dataUrl: frameDataUrl,
            tag: tagInfo.tag,
            color: tagInfo.color,
            isBestCandidate: i === 1 || i === 2, // middle action shots make great thumbnails
          });

          if (onProgress) {
            onProgress(Math.round(((i + 1) / times.length) * 100));
          }
        }

        cleanup();
        resolve(keyframes);
      } catch (err) {
        console.warn('Keyframe extraction warning, generating synthetic previews:', err);
        cleanup();
        resolve(generateFallbackKeyframes());
      }
    };

    video.onerror = () => {
      console.warn('Failed to load video for extraction, using fallback frames');
      cleanup();
      resolve(generateFallbackKeyframes());
    };

    // Timeout safety
    setTimeout(() => {
      if (video.readyState < 2) {
        console.warn('Video load timed out, using fallback keyframes');
        cleanup();
        resolve(generateFallbackKeyframes());
      }
    }, 12000);
  });
}

function seekAndCapture(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D | null,
  time: number
): Promise<string> {
  return new Promise((resolve) => {
    let resolved = false;

    const onSeeked = () => {
      if (resolved) return;
      resolved = true;
      video.removeEventListener('seeked', onSeeked);

      if (ctx) {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch (e) {
          // If tainted by CORS, generate a colorful placeholder frame
          resolve(generateColorFrame(time));
        }
      } else {
        resolve(generateColorFrame(time));
      }
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.currentTime = time;

    // Safety timeout in case seeked doesn't fire
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        video.removeEventListener('seeked', onSeeked);
        resolve(generateColorFrame(time));
      }
    }, 1500);
  });
}

/**
 * Capture current frame from a live HTMLVideoElement
 */
export function captureCurrentFrame(video: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (err) {
    console.warn('CORS prevented live frame capture:', err);
    return null;
  }
}

function generateColorFrame(time: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
  const col = colors[Math.floor(time) % colors.length];

  ctx.fillStyle = col;
  ctx.fillRect(0, 0, 640, 360);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`🎬 영상 장면 (${formatTime(time)})`, 320, 180);

  return canvas.toDataURL('image/jpeg', 0.8);
}

function generateFallbackKeyframes(): Keyframe[] {
  return [
    {
      id: 'kf-1',
      time: 2.5,
      timeFormatted: '00:02',
      dataUrl: generateColorFrame(2.5),
      tag: '🌟 시작 하이라이트',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      isBestCandidate: false,
    },
    {
      id: 'kf-2',
      time: 8.0,
      timeFormatted: '00:08',
      dataUrl: generateColorFrame(8.0),
      tag: '🔥 썸네일 1순위 후보!',
      color: 'bg-rose-100 text-rose-800 border-rose-300',
      isBestCandidate: true,
    },
    {
      id: 'kf-3',
      time: 15.2,
      timeFormatted: '00:15',
      dataUrl: generateColorFrame(15.2),
      tag: '💥 클라이맥스 액션!',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      isBestCandidate: true,
    },
    {
      id: 'kf-4',
      time: 22.0,
      timeFormatted: '00:22',
      dataUrl: generateColorFrame(22.0),
      tag: '👀 반전 깜짝 장면!',
      color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      isBestCandidate: false,
    },
    {
      id: 'kf-5',
      time: 28.5,
      timeFormatted: '00:28',
      dataUrl: generateColorFrame(28.5),
      tag: '✨ 대단원의 엔딩!',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      isBestCandidate: false,
    },
  ];
}
