import React from 'react';
import { Sparkles, Camera, Play, Wand2, Download, Palette, CheckCircle2 } from 'lucide-react';
import { Keyframe } from '../types';

interface KeyframeGridProps {
  keyframes: Keyframe[];
  onSeekTo: (time: number) => void;
  onSendToAiThumbnail: (keyframe: Keyframe) => void;
  onSendToEditor: (keyframe: Keyframe) => void;
  onCaptureCurrentFrame: () => void;
  selectedKeyframeId?: string;
}

export const KeyframeGrid: React.FC<KeyframeGridProps> = ({
  keyframes,
  onSeekTo,
  onSendToAiThumbnail,
  onSendToEditor,
  onCaptureCurrentFrame,
  selectedKeyframeId,
}) => {
  const handleDownloadKeyframe = (kf: Keyframe) => {
    const a = document.createElement('a');
    a.href = kf.dataUrl;
    a.download = `kids-frame-${kf.timeFormatted.replace(':', 'm')}s.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-neutral-200/80 shadow-xs space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📸</span>
            <h3 className="text-lg sm:text-xl font-black text-neutral-900">
              자동 추출된 주요 장면 ({keyframes.length}개)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
              베스트 컷 🌟
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
            영상 속에서 가장 재미있고 표정이 살아있는 순간들을 AI가 자동으로 골라냈어요!
          </p>
        </div>

        {/* Live capture button */}
        <button
          id="instant-capture-frame-btn"
          onClick={onCaptureCurrentFrame}
          className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-2xl text-xs sm:text-sm transition-all flex items-center gap-2 active:scale-95 shadow-xs"
        >
          <Camera className="w-4 h-4 text-amber-500" />
          <span>지금 화면 즉시 캡처</span>
        </button>
      </div>

      {/* Grid of Keyframes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {keyframes.map((kf, index) => {
          const isSelected = selectedKeyframeId === kf.id;
          return (
            <div
              key={kf.id}
              className={`group relative rounded-3xl overflow-hidden border-3 transition-all flex flex-col justify-between bg-white shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-amber-400 ring-4 ring-amber-100 scale-[1.01]'
                  : 'border-neutral-200 hover:border-amber-300'
              }`}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                <img
                  src={kf.dataUrl}
                  alt={`장면 ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Timestamp Badge */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-xs text-white text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                  <span>⏱️</span>
                  <span>{kf.timeFormatted}</span>
                </div>

                {/* Tag Badge */}
                <div
                  className={`absolute top-2.5 left-2.5 px-3 py-1 rounded-xl text-xs font-extrabold border shadow-xs ${kf.color}`}
                >
                  {kf.tag}
                </div>

                {/* Best Candidate Star */}
                {kf.isBestCandidate && (
                  <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-white shadow-md animate-bounce">
                    <Sparkles className="w-4 h-4 text-neutral-900" />
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3.5 sm:p-4 bg-neutral-50/60 border-t border-neutral-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <span>장면 #{index + 1}</span>
                  {kf.isBestCandidate && (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> 썸네일 강력 추천!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSeekTo(kf.time)}
                    className="px-3 py-2 bg-white hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl border border-neutral-200 text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>재생 이동</span>
                  </button>

                  <button
                    onClick={() => onSendToAiThumbnail(kf)}
                    className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs shadow-rose-200 transition-all active:scale-95"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>AI 썸네일</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSendToEditor(kf)}
                    className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <Palette className="w-3 h-3 text-indigo-500" />
                    <span>스티커 꾸미기</span>
                  </button>

                  <button
                    onClick={() => handleDownloadKeyframe(kf)}
                    className="py-1.5 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-[11px] font-semibold flex items-center justify-center transition-colors"
                    title="프레임 이미지 저장"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
