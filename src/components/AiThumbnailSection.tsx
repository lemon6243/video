import React, { useState } from 'react';
import { Wand2, Sparkles, Download, Palette, RefreshCw, Key, Check, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Keyframe, ThumbnailSuggestion } from '../types';

interface AiThumbnailSectionProps {
  suggestions: ThumbnailSuggestion[];
  isLoading: boolean;
  onRefreshSuggestions: () => void;
  onSendToEditor: (suggestion: ThumbnailSuggestion) => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  keyframes: Keyframe[];
  source?: 'gemini' | 'smart-generator';
  errorMessage?: string;
}

export const AiThumbnailSection: React.FC<AiThumbnailSectionProps> = ({
  suggestions,
  isLoading,
  onRefreshSuggestions,
  onSendToEditor,
  onOpenApiKeyModal,
  hasApiKey,
  keyframes,
  source = 'smart-generator',
  errorMessage,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadThumbnail = async (suggestion: ThumbnailSuggestion) => {
    setDownloadingId(suggestion.id);

    try {
      // Create a high-res 1280x720 16:9 canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background keyframe image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = suggestion.keyframeDataUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // continue even if fallback
      });

      // Draw image
      ctx.drawImage(img, 0, 0, 1280, 720);

      // Add a subtle top/bottom dark vignette so text pops
      const gradient = ctx.createLinearGradient(0, 0, 0, 720);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);

      // Draw Badge Ribbon (Top Left)
      ctx.save();
      ctx.fillStyle = suggestion.badgeColor || '#FF4757';
      ctx.beginPath();
      // Round rect
      const bx = 45;
      const by = 45;
      const bw = 240;
      const bh = 55;
      const br = 18;
      ctx.roundRect(bx, by, bw, bh, br);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 26px "Jua", "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(suggestion.badge, bx + bw / 2, by + bh / 2);
      ctx.restore();

      // Draw Main Big Stylized YouTube Thumbnail Title (Bottom Area)
      ctx.save();
      const title = suggestion.title;
      ctx.font = '900 58px "Jua", "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      const textX = 640;
      const textY = 620;

      // Black thick outline / stroke
      ctx.lineWidth = 14;
      ctx.strokeStyle = suggestion.textStrokeColor || '#000000';
      ctx.lineJoin = 'round';
      ctx.strokeText(title, textX, textY);

      // Soft drop shadow
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;

      // Fill text
      ctx.fillStyle = suggestion.textColor || '#FFF200';
      ctx.fillText(title, textX, textY);
      ctx.restore();

      // Draw Subtitle Banner
      if (suggestion.subtitle) {
        ctx.save();
        ctx.font = 'bold 30px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#000000';
        ctx.lineJoin = 'round';
        ctx.strokeText(suggestion.subtitle, 640, 675);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(suggestion.subtitle, 640, 675);
        ctx.restore();
      }

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `youtube-thumbnail-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Confetti burst for kid celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to export thumbnail canvas:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Concept Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{source === 'gemini' ? '✨ Gemini AI 실시간 분석 완료' : '💡 스마트 아이디어 모드'}</span>
              </div>
              {hasApiKey && (
                <button
                  onClick={onOpenApiKeyModal}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/20 hover:bg-black/30 text-[11px] font-bold text-white transition-colors"
                >
                  <Key className="w-3 h-3 text-amber-300" />
                  API 키 등록됨 (설정)
                </button>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              어린이 시청자 사로잡는 AI 썸네일 추천 3선 🌟
            </h2>
            <p className="text-sm sm:text-base text-rose-50 font-medium leading-relaxed">
              영상 속 가장 흥미진진한 장면과 찰떡궁합인 대박 제목을 AI가 3가지 스타일로 만들어드렸어요!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="refresh-ai-thumbnails-btn"
              onClick={onRefreshSuggestions}
              disabled={isLoading || keyframes.length === 0}
              className="px-5 py-3.5 bg-white text-neutral-900 hover:bg-yellow-300 font-extrabold rounded-2xl shadow-md active:scale-95 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'AI가 생각하는 중...' : '새로운 아이디어 추천'}</span>
            </button>

            {!hasApiKey && (
              <button
                onClick={onOpenApiKeyModal}
                className="px-4 py-3.5 bg-black/25 hover:bg-black/35 text-white font-bold rounded-2xl text-xs sm:text-sm border border-white/30 transition-all flex items-center gap-1.5"
              >
                <Key className="w-4 h-4 text-yellow-300" />
                <span>내 AI 키 연결</span>
              </button>
            )}
          </div>
        </div>

        {/* Status / Error feedback */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-black/30 border border-white/30 rounded-2xl text-xs text-rose-100 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-300 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-200">Gemini API 안내: </span>
              <span>{errorMessage}</span>
              <span className="block text-[11px] text-white/80">
                (API 키를 모달에서 다시 [연결 테스트] 해보시거나, 기본 스마트 아이디어가 제공됩니다.)
              </span>
            </div>
          </div>
        )}

        {/* AI Prompt note */}
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-xs text-white/90">
          <Info className="w-4 h-4 shrink-0 text-yellow-200" />
          <span>
            AI 분석 프롬프트: &ldquo;영상 프레임들을 시각적으로 분석하여 초등학생 유튜브 채널에 딱 맞는 클릭 유발 썸네일 3가지를 추천해줘&rdquo;
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-amber-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center animate-spin">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-neutral-900">
            Gemini AI가 영상 속 명장면을 정밀 분석하고 있어요!
          </h3>
          <p className="text-sm text-neutral-500 font-medium max-w-md mx-auto">
            표정, 동작, 색감을 비교하여 아이들이 좋아하는 최고 인기 썸네일을 만드는 중입니다... 🎬 ✨
          </p>
        </div>
      )}

      {/* 3 Suggested Thumbnail Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {suggestions.map((item, index) => {
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border-3 border-neutral-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-rose-300 transition-all flex flex-col justify-between"
              >
                {/* 16:9 Thumbnail Visual Canvas Preview */}
                <div className="relative aspect-video bg-neutral-900 overflow-hidden select-none">
                  {/* Background Frame Image */}
                  <img
                    src={item.keyframeDataUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Top/Bottom Dark Vignette Overlay for maximum readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40 pointer-events-none" />

                  {/* Top Badge Ribbon */}
                  <div className="absolute top-3 left-3">
                    <span
                      style={{ backgroundColor: item.badgeColor }}
                      className="inline-block px-3 py-1 rounded-xl text-white font-black text-xs sm:text-sm shadow-md border-2 border-white tracking-wide"
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Style concept pill */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold border border-white/20">
                    추천 #{index + 1}
                  </div>

                  {/* Main YouTube Bold Thumbnail Title */}
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <div
                      style={{
                        color: item.textColor,
                        textShadow:
                          '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 10px rgba(0,0,0,0.8)',
                      }}
                      className="font-black text-lg sm:text-xl lg:text-lg xl:text-xl leading-tight tracking-tight drop-shadow-md"
                    >
                      {item.title}
                    </div>

                    {item.subtitle && (
                      <p className="text-white text-xs font-bold mt-1 text-shadow-sm drop-shadow-sm line-clamp-1">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Content & AI Reason */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 bg-neutral-50/50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
                      <span>컨셉 스타일</span>
                      <span className="text-rose-600">
                        {index === 0 ? '🔥 충격·반전형' : index === 1 ? '✨ 귀염뽀짝형' : '🚨 스릴도전형'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-neutral-900 text-base leading-snug">
                      {item.title}
                    </h4>

                    {/* AI selection reason */}
                    <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                      <span className="font-bold block mb-0.5 text-amber-800">💡 AI 추천 포인트:</span>
                      {item.reason}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleDownloadThumbnail(item)}
                      disabled={downloadingId === item.id}
                      className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      {downloadingId === item.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>고화질 썸네일 생성 중...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>📥 이 썸네일 즉시 다운로드 (PNG)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSendToEditor(item)}
                      className="w-full py-2.5 bg-white hover:bg-neutral-100 text-indigo-700 font-bold rounded-2xl border-2 border-indigo-200 hover:border-indigo-300 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Palette className="w-4 h-4 text-indigo-600" />
                      <span>🎨 스티커 캔버스에서 더 꾸미기</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
