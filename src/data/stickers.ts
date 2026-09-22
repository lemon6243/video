import { StickerPreset } from '../types';

export const STICKER_PRESETS: StickerPreset[] = [
  // Haon & Riho Special Badges
  { id: 'haon-riho', emoji: '🌟', label: '하온 & 리호 TV', category: 'youtube', color: 'bg-gradient-to-r from-amber-400 to-rose-400 text-neutral-900' },
  { id: 'haon-star', emoji: '👦', label: '하온이의 도전!', category: 'youtube', color: 'bg-sky-500 text-white' },
  { id: 'riho-star', emoji: '👧', label: '리호의 꿀잼타임!', category: 'youtube', color: 'bg-pink-500 text-white' },

  // YouTube Creator Badges
  { id: 'yt-sub', emoji: '🔔', label: '구독&좋아요', category: 'youtube', color: 'bg-red-500 text-white' },
  { id: 'yt-fire', emoji: '🔥', label: '인기급상승', category: 'youtube', color: 'bg-amber-500 text-white' },
  { id: 'yt-100', emoji: '💯', label: '조회수 100만', category: 'youtube', color: 'bg-rose-500 text-white' },
  { id: 'yt-live', emoji: '🔴', label: '생방송 중', category: 'youtube', color: 'bg-red-600 text-white' },
  { id: 'yt-sparkle', emoji: '✨', label: '특급공개', category: 'youtube', color: 'bg-yellow-400 text-neutral-900' },
  { id: 'yt-star', emoji: '⭐', label: '별 5개', category: 'youtube', color: 'bg-amber-400 text-neutral-900' },

  // Reaction / Comic Callouts
  { id: 'rec-daebak', emoji: '💥', label: '대박 사건!', category: 'reaction', color: 'bg-orange-500 text-white' },
  { id: 'rec-fun', emoji: '🤣', label: '꿀잼 보장!', category: 'reaction', color: 'bg-yellow-500 text-neutral-900' },
  { id: 'rec-shock', emoji: '😱', label: '충격 결말!', category: 'reaction', color: 'bg-purple-600 text-white' },
  { id: 'rec-heart', emoji: '💖', label: '심쿵 주의!', category: 'reaction', color: 'bg-pink-500 text-white' },
  { id: 'rec-warning', emoji: '🚨', label: '위험 경보!', category: 'reaction', color: 'bg-red-500 text-white' },
  { id: 'rec-cool', emoji: '😎', label: '간지 폭발', category: 'reaction', color: 'bg-blue-500 text-white' },

  // Cute Icons
  { id: 'cute-crown', emoji: '👑', label: '내가 1등!', category: 'cute', color: 'bg-yellow-400 text-neutral-900' },
  { id: 'cute-party', emoji: '🎉', label: '축하 파티', category: 'cute', color: 'bg-indigo-500 text-white' },
  { id: 'cute-cat', emoji: '🐱', label: '귀요미 냥이', category: 'cute', color: 'bg-amber-200 text-neutral-800' },
  { id: 'cute-dog', emoji: '🐶', label: '댕댕이', category: 'cute', color: 'bg-orange-200 text-neutral-800' },
  { id: 'cute-rainbow', emoji: '🌈', label: '무지개빛', category: 'cute', color: 'bg-teal-400 text-white' },
  { id: 'cute-rocket', emoji: '🚀', label: '우주 출발', category: 'cute', color: 'bg-violet-500 text-white' },

  // Fun Food & Props
  { id: 'fun-pizza', emoji: '🍕', label: '피자 타임', category: 'fun', color: 'bg-amber-500 text-white' },
  { id: 'fun-icecream', emoji: '🍦', label: '아이스크림', category: 'fun', color: 'bg-pink-300 text-neutral-800' },
  { id: 'fun-game', emoji: '🎮', label: '게임 스타트', category: 'fun', color: 'bg-emerald-500 text-white' },
  { id: 'fun-clap', emoji: '👏', label: '짝짝짝 박수', category: 'fun', color: 'bg-cyan-500 text-white' },
];

export const SUBTITLE_COLOR_PRESETS = [
  { name: '노랑 자막 (인기)', text: '#FFF200', stroke: '#000000', bg: 'rgba(0,0,0,0.65)' },
  { name: '새하얀 자막', text: '#FFFFFF', stroke: '#000000', bg: 'rgba(0,0,0,0.65)' },
  { name: '핑크 솜사탕', text: '#FF76AC', stroke: '#FFFFFF', bg: 'rgba(128,0,64,0.7)' },
  { name: '불꽃 레드', text: '#FF4757', stroke: '#FFFFFF', bg: 'rgba(0,0,0,0.7)' },
  { name: '사이버 네온', text: '#00F0FF', stroke: '#0F172A', bg: 'rgba(15,23,42,0.8)' },
  { name: '연두 톡톡', text: '#7BED9F', stroke: '#1E272E', bg: 'rgba(30,39,46,0.8)' },
];

export const SAMPLE_KID_VIDEOS = [
  {
    id: 'sample-bunny',
    title: '🐰 귀여운 토끼의 숲속 모험 (Big Buck Bunny)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    duration: 596,
    badge: '어린이 추천 1위!',
    desc: '귀여운 토끼와 숲속 장난꾸러기들의 배꼽 빠지는 코믹 모험!',
  },
  {
    id: 'sample-blazes',
    title: '🔥 불꽃 레이싱 특급 액션 (For Bigger Blazes)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    duration: 15,
    badge: '15초 번개 분석',
    desc: '눈 깜짝할 사이에 지나가는 초고속 액션! 썸네일 추천 테스트에 딱 좋아요.',
  },
  {
    id: 'sample-sintel',
    title: '🐉 아기 용을 구출하라! (Sintel)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    duration: 888,
    badge: '감동 모험극',
    desc: '신비한 아기 용과 소녀의 우정을 담은 애니메이션 명작!',
  },
];
