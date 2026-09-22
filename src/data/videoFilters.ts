import { VideoFilterOption } from '../types';

export const VIDEO_FILTERS: VideoFilterOption[] = [
  {
    id: 'normal',
    name: '기본 원본',
    emoji: '🎬',
    cssFilter: 'none',
    description: '촬영한 원본 색상 그대로 보여줍니다.',
  },
  {
    id: 'vivid',
    name: '비비드 팝',
    emoji: '🌈',
    cssFilter: 'saturate(1.45) contrast(1.12) brightness(1.06)',
    description: '키즈 유튜브 특유의 쨍하고 화사한 고채도 필터',
  },
  {
    id: 'sunshine',
    name: '따스한 햇살',
    emoji: '☀️',
    cssFilter: 'sepia(0.18) saturate(1.3) brightness(1.08) hue-rotate(-8deg)',
    description: '아이들의 미소가 돋보이는 부드럽고 따뜻한 감성 톤',
  },
  {
    id: 'comic',
    name: '레트로 팝아트',
    emoji: '🎨',
    cssFilter: 'contrast(1.35) saturate(1.5) brightness(1.05)',
    description: '만화책 주인공처럼 선명하고 톡톡 튀는 색감',
  },
  {
    id: 'cinematic',
    name: '시네마틱',
    emoji: '🎞️',
    cssFilter: 'contrast(1.2) saturate(1.15) hue-rotate(8deg)',
    description: '영화 속 한 장면 같은 깊이감 있는 톤',
  },
  {
    id: 'glow',
    name: '스파클 글로우',
    emoji: '✨',
    cssFilter: 'brightness(1.18) contrast(1.08) saturate(1.2)',
    description: '반짝반짝 화사하게 빛나는 주인공 효과',
  },
  {
    id: 'bw',
    name: '레트로 흑백',
    emoji: '🖤',
    cssFilter: 'grayscale(1) contrast(1.25) brightness(1.05)',
    description: '과거 회상이나 흑역사 씬에 딱 맞는 흑백 연출',
  },
];
