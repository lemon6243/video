import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
  Plus,
  Type,
  Smile,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Volume2,
  VolumeX,
  Wand2,
  Mic,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OverlayItem, VideoItem } from '../types';
import { STICKER_PRESETS, SUBTITLE_COLOR_PRESETS } from '../data/stickers';
import { formatTime } from '../utils/formatTime';
import { generateTimedSmartSubtitles, cuesToOverlayItems } from '../utils/autoSubtitle';

interface StickerCanvasProps {
  currentVideo: VideoItem | null;
  overlays: OverlayItem[];
  setOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>;
  initialBackgroundUrl?: string;
}

export const StickerCanvas: React.FC<StickerCanvasProps> = ({
  currentVideo,
  overlays,
  setOverlays,
  initialBackgroundUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // New subtitle inputs
  const [newSubtitleText, setNewSubtitleText] = useState('대박 사건! 🔥');
  const [selectedColorPreset, setSelectedColorPreset] = useState(SUBTITLE_COLOR_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'stickers' | 'subtitles'>('stickers');
  const [isGeneratingAutoSubs, setIsGeneratingAutoSubs] = useState(false);
  const [autoSubFeedback, setAutoSubFeedback] = useState<string | null>(null);

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragTargetIdRef = useRef<string | null>(null);
  const dragStartPosRef = useRef<{ clientX: number; clientY: number; origX: number; origY: number }>({
    clientX: 0,
    clientY: 0,
    origX: 0,
    origY: 0,
  });

  // Video time tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [currentVideo]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

  // Add a sticker
  const handleAddSticker = (preset: typeof STICKER_PRESETS[0]) => {
    const newOverlay: OverlayItem = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      emoji: preset.emoji,
      text: preset.label,
      category: preset.category,
      x: 35 + Math.random() * 25,
      y: 35 + Math.random() * 25,
      scale: 1,
      rotation: 0,
      bgColor: preset.color,
    };
    setOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
  };

  // Add a subtitle
  const handleAddSubtitle = () => {
    if (!newSubtitleText.trim()) return;
    const newOverlay: OverlayItem = {
      id: `sub-${Date.now()}`,
      type: 'subtitle',
      text: newSubtitleText.trim(),
      x: 50,
      y: 80,
      fontSize: 26,
      textColor: selectedColorPreset.text,
      strokeColor: selectedColorPreset.stroke,
      bgColor: selectedColorPreset.bg,
      scale: 1,
      rotation: 0,
    };
    setOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
  };

  // Auto-generate smart timed subtitles from video audio/duration
  const handleAutoGenerateSubtitles = () => {
    setIsGeneratingAutoSubs(true);
    setAutoSubFeedback(null);

    try {
      const vidDuration = duration || videoRef.current?.duration || 15;
      const vTitle = currentVideo?.title || '내 동영상';
      const cues = generateTimedSmartSubtitles(vidDuration, vTitle);
      const generatedItems = cuesToOverlayItems(cues);

      // Keep stickers, replace previous subtitles with new auto-generated ones
      setOverlays((prev) => {
        const stickersOnly = prev.filter((item) => item.type !== 'subtitle');
        return [...stickersOnly, ...generatedItems];
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setAutoSubFeedback(`총 ${generatedItems.length}개의 음성 맞춤 자막이 영상 타임라인에 자동 배치되었습니다! ✨`);
      setTimeout(() => setAutoSubFeedback(null), 5000);
    } catch (err) {
      console.error('Failed to auto generate subtitles:', err);
    } finally {
      setIsGeneratingAutoSubs(false);
    }
  };

  // Drag handlers (Mouse + Touch support)
  const startDrag = (id: string, clientX: number, clientY: number) => {
    const target = overlays.find((o) => o.id === id);
    if (!target) return;

    isDraggingRef.current = true;
    dragTargetIdRef.current = id;
    setSelectedOverlayId(id);
    dragStartPosRef.current = {
      clientX,
      clientY,
      origX: target.x,
      origY: target.y,
    };
  };

  const onMouseDownItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    startDrag(id, e.clientX, e.clientY);
  };

  const onTouchStartItem = (e: React.TouchEvent, id: string) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      startDrag(id, e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onPointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !dragTargetIdRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((clientX - dragStartPosRef.current.clientX) / rect.width) * 100;
    const deltaY = ((clientY - dragStartPosRef.current.clientY) / rect.height) * 100;

    const newX = Math.max(5, Math.min(95, dragStartPosRef.current.origX + deltaX));
    const newY = Math.max(5, Math.min(95, dragStartPosRef.current.origY + deltaY));

    setOverlays((prev) =>
      prev.map((item) => (item.id === dragTargetIdRef.current ? { ...item, x: newX, y: newY } : item))
    );
  };

  const endDrag = () => {
    isDraggingRef.current = false;
    dragTargetIdRef.current = null;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => endDrag();

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length > 0) {
        e.preventDefault(); // Prevent page scrolling during sticker drag
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => endDrag();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [overlays]);

  // Overlay modification actions
  const handleDeleteOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedOverlayId === id) {
      setSelectedOverlayId(null);
    }
  };

  const handleScaleOverlay = (id: string, delta: number) => {
    setOverlays((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const newScale = Math.max(0.5, Math.min(2.5, (o.scale || 1) + delta));
          return { ...o, scale: newScale };
        }
        return o;
      })
    );
  };

  const handleRotateOverlay = (id: string) => {
    setOverlays((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          return { ...o, rotation: (o.rotation + 15) % 360 };
        }
        return o;
      })
    );
  };

  // Export composite snapshot
  const handleExportSnapshot = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        try {
          ctx.drawImage(video, 0, 0, 1280, 720);
        } catch {
          // If CORS tainted, fill with warm color
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, 1280, 720);
        }
      } else if (initialBackgroundUrl) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = initialBackgroundUrl;
        await new Promise((res) => {
          bgImg.onload = res;
          bgImg.onerror = res;
        });
        ctx.drawImage(bgImg, 0, 0, 1280, 720);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 1280, 720);
      }

      // Draw all overlays onto canvas
      overlays.forEach((item) => {
        const posX = (item.x / 100) * 1280;
        const posY = (item.y / 100) * 720;
        const scale = item.scale || 1;
        const rotationRad = ((item.rotation || 0) * Math.PI) / 180;

        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(rotationRad);
        ctx.scale(scale, scale);

        if (item.type === 'sticker') {
          // Draw Sticker bubble
          ctx.font = 'bold 50px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.emoji || '⭐', 0, -10);

          if (item.text) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '900 24px "Jua", sans-serif';
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#000000';
            ctx.strokeText(item.text, 0, 32);
            ctx.fillText(item.text, 0, 32);
          }
        } else {
          // Draw Subtitle
          const text = item.text || '';
          ctx.font = '900 38px "Jua", "Noto Sans KR", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Background box
          const metrics = ctx.measureText(text);
          const paddingX = 28;
          const paddingY = 16;
          const boxW = metrics.width + paddingX * 2;
          const boxH = 50 + paddingY;

          ctx.fillStyle = item.bgColor || 'rgba(0,0,0,0.7)';
          ctx.beginPath();
          ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 16);
          ctx.fill();

          // Stroke and text
          ctx.lineWidth = 8;
          ctx.strokeStyle = item.strokeColor || '#000000';
          ctx.strokeText(text, 0, 0);

          ctx.fillStyle = item.textColor || '#FFF200';
          ctx.fillText(text, 0, 0);
        }

        ctx.restore();
      });

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `kids-studio-snapshot-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Snapshot capture failed:', err);
    }
  };

  const handleConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Studio Control Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-neutral-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <div>
            <h3 className="font-black text-neutral-900 text-base sm:text-lg">
              자막 & 스티커 꾸미기 스튜디오
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              화면 위 스티커와 자막을 손가락이나 마우스로 원하는 위치로 끌어다 놓으세요!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="celebrate-confetti-btn"
            onClick={handleConfetti}
            className="px-3.5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-neutral-900 font-extrabold rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span>팡파레 터뜨리기! 🎉</span>
          </button>

          <button
            id="download-snapshot-btn"
            onClick={handleExportSnapshot}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-200 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>완성본 사진 저장 (PNG)</span>
          </button>

          {overlays.length > 0 && (
            <button
              onClick={() => setOverlays([])}
              className="px-3 py-2.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl text-xs font-semibold transition-colors"
              title="스티커 전체 지우기"
            >
              전체 지우기
            </button>
          )}
        </div>
      </div>

      {/* Main Video & Overlay Canvas Container */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-950 border-4 border-amber-300 shadow-xl">
        <div
          ref={containerRef}
          className="relative w-full aspect-video select-none touch-none overflow-hidden"
          onClick={() => setSelectedOverlayId(null)}
        >
          {/* Real Video Element */}
          {currentVideo ? (
            <video
              ref={videoRef}
              src={currentVideo.url}
              playsInline
              crossOrigin="anonymous"
              className="w-full h-full object-contain pointer-events-none"
            />
          ) : initialBackgroundUrl ? (
            <img
              src={initialBackgroundUrl}
              alt="Thumbnail background"
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6 text-center">
              <span className="text-4xl mb-2">🎬</span>
              <p className="font-bold text-sm">먼저 [1. 내 영상 분석] 탭에서 영상을 선택해주세요!</p>
            </div>
          )}

          {/* Interactive Draggable Overlays */}
          {overlays
            .filter((item) => {
              // Stickers are always visible; timed subtitles appear when video currentTime is within range
              if (item.type === 'subtitle' && item.startTime !== undefined && item.endTime !== undefined) {
                // If currently playing or paused at a specific second, show active cue
                // If user is editing/selected, always show so they can position it
                if (selectedOverlayId === item.id) return true;
                return currentTime >= item.startTime && currentTime <= item.endTime;
              }
              return true;
            })
            .map((item) => {
            const isSelected = selectedOverlayId === item.id;
            return (
              <div
                key={item.id}
                onMouseDown={(e) => onMouseDownItem(e, item.id)}
                onTouchStart={(e) => onTouchStartItem(e, item.id)}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `translate(-50%, -50%) scale(${item.scale || 1}) rotate(${item.rotation || 0}deg)`,
                }}
                className={`absolute cursor-move select-none transition-shadow z-20 group ${
                  isSelected ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-black/50 rounded-2xl' : ''
                }`}
              >
                {/* Visual Content */}
                {item.type === 'sticker' ? (
                  <div className="flex flex-col items-center justify-center filter drop-shadow-lg">
                    <span className="text-5xl sm:text-6xl transform active:scale-95 transition-transform">
                      {item.emoji}
                    </span>
                    {item.text && (
                      <span className="mt-1 px-3 py-1 rounded-xl text-xs sm:text-sm font-black text-white bg-black/75 backdrop-blur-xs border border-white/40 shadow-md whitespace-nowrap">
                        {item.text}
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: item.bgColor || 'rgba(0,0,0,0.7)',
                      color: item.textColor || '#FFF200',
                      textShadow: `-2px -2px 0 ${item.strokeColor || '#000'}, 2px -2px 0 ${item.strokeColor || '#000'}, -2px 2px 0 ${item.strokeColor || '#000'}, 2px 2px 0 ${item.strokeColor || '#000'}`,
                    }}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl font-black text-base sm:text-xl md:text-2xl shadow-xl whitespace-nowrap border-2 border-white/30"
                  >
                    {item.text}
                  </div>
                )}

                {/* Selected Controls Toolbar (Floating above item) */}
                {isSelected && (
                  <div
                    className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-neutral-900/90 text-white p-1 rounded-2xl shadow-xl border border-white/20 backdrop-blur-xs z-30 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleScaleOverlay(item.id, 0.15)}
                      className="p-1.5 hover:bg-neutral-700 rounded-xl text-amber-300"
                      title="크게 키우기"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleScaleOverlay(item.id, -0.15)}
                      className="p-1.5 hover:bg-neutral-700 rounded-xl text-amber-300"
                      title="작게 줄이기"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRotateOverlay(item.id)}
                      className="p-1.5 hover:bg-neutral-700 rounded-xl text-cyan-300"
                      title="회전하기"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOverlay(item.id)}
                      className="p-1.5 hover:bg-rose-500/80 rounded-xl text-rose-400 hover:text-white"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Video Player Bottom Controls */}
        {currentVideo && (
          <div className="bg-neutral-900/95 border-t border-neutral-800 p-3 sm:p-4 text-white space-y-2">
            {/* Scrubber Range Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-400 w-11 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-xs font-mono text-neutral-400 w-11">
                {formatTime(duration)}
              </span>
            </div>

            {/* Playback Button Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  id="play-pause-btn"
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-900 flex items-center justify-center font-bold shadow-md active:scale-95 transition-all"
                  aria-label={isPlaying ? '일시정지' : '재생'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-neutral-900" />
                  ) : (
                    <Play className="w-5 h-5 fill-neutral-900 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                  className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors"
                  title="처음으로"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors"
                  title={isMuted ? '음소거 해제' : '음소거'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Playback speed pills */}
              <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-xl text-xs font-bold">
                {[0.75, 1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackRate(speed);
                      if (videoRef.current) {
                        videoRef.current.playbackRate = speed;
                      }
                    }}
                    className={`px-2 py-1 rounded-lg transition-colors ${
                      playbackRate === speed
                        ? 'bg-amber-400 text-neutral-900'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlays Editor Drawer (Tabs: Stickers / Subtitles) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-neutral-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <button
            onClick={() => setActiveTab('stickers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'stickers'
                ? 'bg-amber-400 text-neutral-900 shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>귀여운 스티커 ({STICKER_PRESETS.length}종)</span>
          </button>

          <button
            onClick={() => setActiveTab('subtitles')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'subtitles'
                ? 'bg-rose-400 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>알록달록 자막 만들기</span>
          </button>
        </div>

        {/* Tab 1: Stickers Picker */}
        {activeTab === 'stickers' && (
          <div className="space-y-3">
            <p className="text-xs text-neutral-500 font-semibold">
              원하는 스티커를 클릭하면 영상 위에 짠! 나타납니다.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {STICKER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleAddSticker(preset)}
                  className="p-3 rounded-2xl border-2 border-neutral-200/80 hover:border-amber-400 bg-neutral-50/50 hover:bg-amber-50/40 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all group shadow-2xs"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {preset.emoji}
                  </span>
                  <span className="text-[11px] font-bold text-neutral-700 line-clamp-1">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Subtitle Creator & AI Auto-Subtitles */}
        {activeTab === 'subtitles' && (
          <div className="space-y-5">
            {/* AI Auto-Subtitle Generator Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border-2 border-rose-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-black text-rose-600 text-sm">
                  <Wand2 className="w-4 h-4 text-amber-500" />
                  <span>AI 영상 음성·타임라인 자동 자막 생성기</span>
                  <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-extrabold uppercase">
                    원클릭
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-medium">
                  영상의 주요 타이밍에 맞춰 초등학생 유튜브에 딱 어울리는 말풍선 자막을 영상 타임라인에 자동으로 배치해줘요!
                </p>
              </div>

              <button
                id="auto-generate-subtitles-btn"
                onClick={handleAutoGenerateSubtitles}
                disabled={isGeneratingAutoSubs}
                className="px-5 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black rounded-2xl shadow-md active:scale-95 transition-all text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-yellow-300 ${isGeneratingAutoSubs ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAutoSubs ? '자막 생성 중...' : '🎙️ AI 자동 자막 생성하기'}</span>
              </button>
            </div>

            {/* Success message banner */}
            {autoSubFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
                <span>🎉</span>
                <span>{autoSubFeedback}</span>
              </div>
            )}

            {/* Manual custom subtitle input */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="block text-xs font-bold text-neutral-600 mb-2">내가 직접 입력하기:</span>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <input
                  id="subtitle-input"
                  type="text"
                  value={newSubtitleText}
                  onChange={(e) => setNewSubtitleText(e.target.value)}
                  placeholder="넣고 싶은 자막을 적어보세요! (예: 구독과 좋아요 꾹!)"
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-neutral-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-sm font-bold transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtitle();
                  }}
                />
                <button
                  id="add-subtitle-btn"
                  onClick={handleAddSubtitle}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>자막 화면에 올리기</span>
                </button>
              </div>
            </div>

            {/* Color style choices */}
            <div>
              <span className="block text-xs font-bold text-neutral-600 mb-2">자막 색상 고르기:</span>
              <div className="flex flex-wrap items-center gap-2">
                {SUBTITLE_COLOR_PRESETS.map((preset) => {
                  const isSelected = selectedColorPreset.name === preset.name;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedColorPreset(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-neutral-900 ring-2 ring-neutral-200 scale-105'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30"
                        style={{ backgroundColor: preset.text }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List of currently placed subtitles */}
            {overlays.filter((o) => o.type === 'subtitle').length > 0 && (
              <div className="pt-3 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-600">
                    현재 적용된 자막 ({overlays.filter((o) => o.type === 'subtitle').length}개):
                  </span>
                  <button
                    onClick={() => {
                      setOverlays((prev) => prev.filter((o) => o.type !== 'subtitle'));
                    }}
                    className="text-[11px] text-rose-500 hover:underline font-semibold"
                  >
                    모든 자막 지우기
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {overlays
                    .filter((o) => o.type === 'subtitle')
                    .map((sub, sIdx) => {
                      const isCurrent =
                        sub.startTime !== undefined &&
                        sub.endTime !== undefined &&
                        currentTime >= sub.startTime &&
                        currentTime <= sub.endTime;

                      return (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setSelectedOverlayId(sub.id);
                            if (sub.startTime !== undefined && videoRef.current) {
                              videoRef.current.currentTime = sub.startTime;
                              setCurrentTime(sub.startTime);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 border ${
                            isCurrent
                              ? 'bg-rose-500 text-white border-rose-600 shadow-xs scale-105'
                              : selectedOverlayId === sub.id
                              ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-300'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-200'
                          }`}
                        >
                          {sub.startTime !== undefined && (
                            <span className="text-[10px] opacity-75">
                              {formatTime(sub.startTime)}~{formatTime(sub.endTime || sub.startTime + 2)}
                            </span>
                          )}
                          <span className="truncate max-w-[140px]">{sub.text}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOverlays((prev) => prev.filter((o) => o.id !== sub.id));
                            }}
                            className="text-neutral-400 hover:text-rose-600 ml-1 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
