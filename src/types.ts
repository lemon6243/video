export interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  source: 'preset' | 'upload' | 'url';
  description?: string;
  author?: string;
  resolution?: string;
  file?: File;
}

export interface Keyframe {
  id: string;
  time: number;
  timeFormatted: string;
  dataUrl: string;
  tag: string;
  color: string;
  isBestCandidate?: boolean;
}

export interface ThumbnailSuggestion {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  textColor: string;
  textStrokeColor: string;
  keyframeId: string;
  keyframeDataUrl: string;
  reason: string;
  styleTheme: 'fire' | 'cute' | 'mystery' | 'speed';
}

export type OverlayType = 'sticker' | 'subtitle';

export interface OverlayItem {
  id: string;
  type: OverlayType;
  text?: string;
  emoji?: string;
  category?: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize?: number;
  textColor?: string;
  bgColor?: string;
  strokeColor?: string;
  scale: number;
  rotation: number;
  startTime?: number; // seconds
  endTime?: number;   // seconds
}

export interface StickerPreset {
  id: string;
  emoji: string;
  label: string;
  category: 'reaction' | 'youtube' | 'cute' | 'fun';
  color: string;
}

export interface GeminiSettings {
  apiKey: string;
  hasKey: boolean;
  model: string;
}

export type VideoFilterId = 'normal' | 'vivid' | 'sunshine' | 'comic' | 'cinematic' | 'glow' | 'bw';

export interface VideoFilterOption {
  id: VideoFilterId;
  name: string;
  emoji: string;
  cssFilter: string;
  description: string;
}

export type AspectRatioMode = '16:9' | '9:16';

export interface YouTubeChapter {
  time: string;
  title: string;
}

export interface YouTubeUploadKit {
  titles: string[];
  description: string;
  tags: string[];
  hashtags: string[];
  targetAudience: string;
  videoSummary?: string;
  chapters?: YouTubeChapter[];
  isAiGenerated?: boolean;
  analyzedKeyframeCount?: number;
  kidFriendlyChecklist: {
    title: string;
    checked: boolean;
    description: string;
  }[];
}

