import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, Youtube, CheckCircle2, Tag, FileText, ExternalLink, RefreshCw, Clock, Video, ListOrdered } from 'lucide-react';
import { YouTubeUploadKit, Keyframe } from '../types';

interface YouTubeKitSectionProps {
  kit: YouTubeUploadKit;
  videoTitle: string;
  keyframes?: Keyframe[];
  isLoading?: boolean;
  onRefreshKit?: () => void;
}

export const YouTubeKitSection: React.FC<YouTubeKitSectionProps> = ({
  kit,
  videoTitle,
  keyframes = [],
  isLoading = false,
  onRefreshKit,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editableDesc, setEditableDesc] = useState(kit.description);

  // Sync description when kit changes (e.g. after AI re-analysis)
  useEffect(() => {
    setEditableDesc(kit.description);
  }, [kit.description]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const tagsCommaSeparated = kit.tags.join(', ');
  const hashtagsJoined = kit.hashtags.join(' ');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wide">
                <Youtube className="w-4 h-4 text-yellow-300" />
                <span>YouTube Studio 업로드 원스톱 패키지</span>
              </div>
              {kit.isAiGenerated && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/30 border border-emerald-300/40 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                  <span>실제 영상 프레임 시각 분석 완료 ({kit.analyzedKeyframeCount || keyframes.length}개 장면)</span>
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              실제 영상 분석 기반 유튜브 SEO & 업로드 패키지 🚀
            </h2>
            <p className="text-white/95 text-sm max-w-2xl font-medium leading-relaxed">
              AI가 업로드된 영상의 프레임과 타임스탬프를 직접 분석하여, 유튜브 알고리즘 노출과 시청자 클릭(CTR)을 극대화하는 맞춤형 제목, 설명, 태그를 완성했습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onRefreshKit && (
              <button
                id="refresh-ai-seo-btn"
                onClick={onRefreshKit}
                disabled={isLoading}
                className="px-4 py-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white font-extrabold rounded-2xl border border-white/40 shadow-xs active:scale-95 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                title="실제 영상 프레임을 다시 분석하여 새 SEO 패키지를 생성합니다"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-300' : 'text-white'}`} />
                <span>{isLoading ? '영상 정밀 분석 중...' : 'AI 맞춤 SEO 다시 생성'}</span>
              </button>
            )}

            <a
              id="youtube-studio-external-link"
              href="https://studio.youtube.com"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3.5 bg-white text-neutral-900 hover:bg-yellow-300 font-extrabold rounded-2xl shadow-md active:scale-95 transition-all text-sm flex items-center gap-2 shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              <span>YouTube Studio 바로가기</span>
            </a>
          </div>
        </div>
      </div>

      {/* AI Video Content Summary Card */}
      {kit.videoSummary && (
        <div className="bg-amber-50/90 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-neutral-900 flex items-center justify-center shrink-0 shadow-xs">
            <Video className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase">
                AI 시각 분석 리포트
              </span>
              <span className="text-xs text-neutral-500 font-semibold">
                영상: &ldquo;{videoTitle}&rdquo;
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-neutral-900 leading-snug">
              {kit.videoSummary}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column: Titles & SEO Tags */}
        <div className="space-y-6">
          {/* 1. Recommended YouTube Titles */}
          <div className="bg-white rounded-3xl p-6 border-3 border-amber-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-sm">
                  1
                </span>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg">
                    영상 분석 기반 클릭률(CTR) UP 추천 제목
                  </h3>
                  <p className="text-xs text-neutral-500">원하는 제목의 [복사] 버튼을 누르면 클립보드에 복사됩니다.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {kit.titles.map((title, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-50 hover:bg-amber-50/70 border-2 border-neutral-200/80 hover:border-amber-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {idx === 0 ? '🔥 충격/호기심 유발' : idx === 1 ? '👑 대결/스토리형' : '🌈 힐링/명장면형'}
                    </span>
                    <p className="text-sm font-bold text-neutral-900 truncate">{title}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(title, `title-${idx}`)}
                    className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl border border-neutral-200 text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    {copiedKey === `title-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>복사</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. SEO Tags */}
          <div className="bg-white rounded-3xl p-6 border-3 border-amber-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
                  2
                </span>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg">
                    영상 맞춤 검색 최적화(SEO) 태그 ({kit.tags.length}개)
                  </h3>
                  <p className="text-xs text-neutral-500">YouTube Studio 동영상 세부정보의 [태그] 란에 바로 붙여넣으세요.</p>
                </div>
              </div>

              <button
                onClick={() => handleCopy(tagsCommaSeparated, 'tags-all')}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-neutral-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all shrink-0"
              >
                {copiedKey === 'tags-all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-900" />
                    <span>태그 전체 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Tag className="w-3.5 h-3.5" />
                    <span>태그 전체 복사 (쉼표 구분)</span>
                  </>
                )}
              </button>
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {kit.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-amber-100 border border-neutral-200 text-xs font-bold text-neutral-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Hashtags */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
              <div className="text-xs font-bold text-neutral-600 truncate">
                추천 해시태그: <span className="text-rose-600">{hashtagsJoined}</span>
              </div>
              <button
                onClick={() => handleCopy(hashtagsJoined, 'hashtags')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 shrink-0"
              >
                {copiedKey === 'hashtags' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>해시태그 복사</span>
              </button>
            </div>
          </div>

          {/* 3. Actual Video Chapters Breakdown */}
          {kit.chapters && kit.chapters.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border-3 border-amber-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-black text-sm">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg">
                      실제 영상 타임스탬프 챕터 ({kit.chapters.length}개)
                    </h3>
                    <p className="text-xs text-neutral-500">실제 영상 키프레임 시간대에 맞춰 자동 생성된 구간별 제목입니다.</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleCopy(
                      kit.chapters!.map((c) => `${c.time} ${c.title}`).join('\n'),
                      'chapters-copy'
                    )
                  }
                  className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  {copiedKey === 'chapters-copy' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>챕터만 복사</span>
                </button>
              </div>

              <div className="space-y-2">
                {kit.chapters.map((chapter, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2.5 py-1 rounded-lg bg-violet-100 text-violet-800 font-black font-mono">
                        {chapter.time}
                      </span>
                      <span className="font-bold text-neutral-800 truncate">{chapter.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Description & YouTube Checklist */}
        <div className="space-y-6">
          {/* 4. Video Description */}
          <div className="bg-white rounded-3xl p-6 border-3 border-amber-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  3
                </span>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg">
                    동영상 설명란(Description) 본문
                  </h3>
                  <p className="text-xs text-neutral-500">실제 영상 내용, 타임스탬프, 구독/댓글 유도 문구가 포함되어 있습니다.</p>
                </div>
              </div>

              <button
                onClick={() => handleCopy(editableDesc, 'desc')}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0"
              >
                {copiedKey === 'desc' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">설명문 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>설명란 복사</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={editableDesc}
              onChange={(e) => setEditableDesc(e.target.value)}
              rows={11}
              className="w-full p-4 rounded-2xl bg-neutral-50 border-2 border-neutral-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none text-xs sm:text-sm font-sans leading-relaxed text-neutral-800 resize-none transition-all"
            />
          </div>

          {/* 5. YouTube Creator Checklist */}
          <div className="bg-white rounded-3xl p-6 border-3 border-amber-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-sm">
                4
              </span>
              <div>
                <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg flex items-center gap-2">
                  유튜브 업로드 & 시청자층(댓글/알림) 필수 체크리스트
                </h3>
                <p className="text-xs text-neutral-500">댓글 활성화와 알고리즘 성장을 위한 필수 점검 사항입니다.</p>
              </div>
            </div>

            <div className="space-y-3">
              {kit.kidFriendlyChecklist.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-neutral-900">{item.title}</p>
                    <p className="text-neutral-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
