import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoUploadArea } from './components/VideoUploadArea';
import { KeyframeGrid } from './components/KeyframeGrid';
import { AiThumbnailSection } from './components/AiThumbnailSection';
import { StickerCanvas } from './components/StickerCanvas';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SAMPLE_KID_VIDEOS } from './data/stickers';
import { VideoItem, Keyframe, ThumbnailSuggestion, OverlayItem } from './types';
import { extractVideoKeyframes } from './utils/videoExtractor';
import { generateThumbnailSuggestions, getStoredApiKey } from './utils/gemini';
import { Sparkles, Wand2, Palette, Video, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'thumbnail' | 'editor'>('analyze');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Video and Keyframe states
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);

  // AI Thumbnails state
  const [thumbnailSuggestions, setThumbnailSuggestions] = useState<ThumbnailSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionSource, setSuggestionSource] = useState<'gemini' | 'smart-generator'>('smart-generator');
  const [suggestionError, setSuggestionError] = useState<string | undefined>(undefined);

  // Sticker Canvas Overlays
  const [overlays, setOverlays] = useState<OverlayItem[]>([
    {
      id: 'init-1',
      type: 'sticker',
      emoji: '🔥',
      text: '인기급상승',
      x: 20,
      y: 25,
      scale: 1.1,
      rotation: -10,
    },
    {
      id: 'init-2',
      type: 'subtitle',
      text: '구독과 좋아요 꾹꾹! 💖',
      x: 50,
      y: 82,
      fontSize: 26,
      textColor: '#FFF200',
      strokeColor: '#000000',
      bgColor: 'rgba(0,0,0,0.7)',
      scale: 1,
      rotation: 0,
    },
  ]);

  const [editorBackgroundUrl, setEditorBackgroundUrl] = useState<string | undefined>(undefined);

  // Check stored API key on mount
  useEffect(() => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key));

    // Load initial sample video automatically so the app is instantly working and delightful!
    const defaultSample = SAMPLE_KID_VIDEOS[0];
    handleSelectVideo({
      id: defaultSample.id,
      title: defaultSample.title,
      url: defaultSample.url,
      thumbnail: defaultSample.thumbnail,
      duration: defaultSample.duration,
      source: 'preset',
      description: defaultSample.desc,
    });
  }, []);

  const handleKeyUpdated = () => {
    setHasApiKey(Boolean(getStoredApiKey()));
  };

  // Video selection & automatic keyframe extraction
  const handleSelectVideo = async (video: VideoItem) => {
    setCurrentVideo(video);
    setIsExtracting(true);
    setExtractProgress(10);

    try {
      const source = video.file ? video.file : video.url;
      const extracted = await extractVideoKeyframes(source, 5, (percent) => {
        setExtractProgress(percent);
      });

      setKeyframes(extracted);
      setIsExtracting(false);

      // Automatically generate AI thumbnail suggestions for the newly extracted keyframes!
      triggerAiThumbnails(extracted, video.title);
    } catch (err) {
      console.error('Extraction error:', err);
      setIsExtracting(false);
    }
  };

  // Trigger Gemini AI thumbnail generation
  const triggerAiThumbnails = async (targetKeyframes: Keyframe[], title?: string) => {
    setIsLoadingSuggestions(true);
    setSuggestionError(undefined);
    const vTitle = title || currentVideo?.title || '내 동영상';

    try {
      const res = await generateThumbnailSuggestions(targetKeyframes, vTitle);
      setThumbnailSuggestions(res.suggestions);
      setSuggestionSource(res.source);
      if (res.error) {
        setSuggestionError(res.error);
      }
    } catch (err: any) {
      console.error('Failed to generate thumbnail suggestions:', err);
      setSuggestionError(err?.message || '썸네일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Add instant custom keyframe
  const handleCaptureCurrentFrame = () => {
    // Generate an instant snapshot keyframe
    const newFrame: Keyframe = {
      id: `capture-${Date.now()}`,
      time: 5.0,
      timeFormatted: '00:05',
      dataUrl: keyframes[0]?.dataUrl || '',
      tag: '📸 내가 직접 캡처한 순간!',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      isBestCandidate: true,
    };
    setKeyframes((prev) => [newFrame, ...prev]);
  };

  // Switch to AI tab with specific keyframe
  const handleSendToAiThumbnail = (kf: Keyframe) => {
    setActiveTab('thumbnail');
    triggerAiThumbnails([kf, ...keyframes.filter((k) => k.id !== kf.id)]);
  };

  // Switch to Sticker Editor with specific keyframe or suggestion
  const handleSendKeyframeToEditor = (kf: Keyframe) => {
    setEditorBackgroundUrl(kf.dataUrl);
    setActiveTab('editor');
  };

  const handleSendSuggestionToEditor = (suggestion: ThumbnailSuggestion) => {
    setEditorBackgroundUrl(suggestion.keyframeDataUrl);

    // Add suggestion title as a subtitle on the canvas!
    const newSub: OverlayItem = {
      id: `thumb-sub-${Date.now()}`,
      type: 'subtitle',
      text: suggestion.title,
      x: 50,
      y: 75,
      fontSize: 28,
      textColor: suggestion.textColor || '#FFF200',
      strokeColor: suggestion.textStrokeColor || '#000000',
      bgColor: 'rgba(0,0,0,0.75)',
      scale: 1.1,
      rotation: 0,
    };

    const newBadge: OverlayItem = {
      id: `thumb-badge-${Date.now()}`,
      type: 'sticker',
      emoji: '🔥',
      text: suggestion.badge,
      x: 20,
      y: 20,
      scale: 1,
      rotation: -5,
    };

    setOverlays((prev) => [...prev, newSub, newBadge]);
    setActiveTab('editor');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-neutral-800 flex flex-col font-sans selection:bg-amber-300">
      {/* Playful Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={hasApiKey}
        videoLoaded={Boolean(currentVideo)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Quick Progress Banner for Kids */}
        <div className="bg-gradient-to-r from-amber-100 via-rose-100 to-indigo-100 rounded-3xl p-4 sm:p-5 border-2 border-amber-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">🚀</span>
            <div>
              <h2 className="font-extrabold text-neutral-900 text-sm sm:text-base">
                키즈 유튜브 썸네일 제작 마법 3단계!
              </h2>
              <p className="text-xs text-neutral-600 font-medium">
                영상 업로드 ➔ AI 썸네일 추천 ➔ 스티커로 꾸미고 다운로드!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analyze'
                  ? 'bg-amber-400 text-neutral-900 shadow-xs'
                  : 'bg-white/80 text-neutral-600 hover:bg-white'
              }`}
            >
              1. 영상 분석
            </button>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            <button
              onClick={() => setActiveTab('thumbnail')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'thumbnail'
                  ? 'bg-rose-400 text-white shadow-xs'
                  : 'bg-white/80 text-neutral-600 hover:bg-white'
              }`}
            >
              2. AI 썸네일
            </button>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'editor'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'bg-white/80 text-neutral-600 hover:bg-white'
              }`}
            >
              3. 스티커 스튜디오
            </button>
          </div>
        </div>

        {/* Tab 1: Video Analysis & Automatic Keyframe Extraction */}
        {activeTab === 'analyze' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Upload & Sample Selector */}
            <VideoUploadArea
              currentVideo={currentVideo}
              onSelectVideo={handleSelectVideo}
              isExtracting={isExtracting}
              extractProgress={extractProgress}
            />

            {/* Extracted Keyframe Grid */}
            {keyframes.length > 0 && (
              <KeyframeGrid
                keyframes={keyframes}
                onSeekTo={(t) => {
                  setActiveTab('editor');
                }}
                onSendToAiThumbnail={handleSendToAiThumbnail}
                onSendToEditor={handleSendKeyframeToEditor}
                onCaptureCurrentFrame={handleCaptureCurrentFrame}
              />
            )}

            {/* Next Step Callout Button */}
            {keyframes.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-rose-500 to-amber-500 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xl font-black">멋진 장면들을 모두 찾았어요! ✨</h3>
                  <p className="text-sm text-rose-50">
                    이제 Gemini AI에게 초등학생들이 열광할 썸네일 제목 3가지를 추천받아보세요.
                  </p>
                </div>
                <button
                  id="go-to-ai-tab-btn"
                  onClick={() => setActiveTab('thumbnail')}
                  className="px-6 py-3.5 bg-white text-neutral-900 hover:bg-amber-300 font-black rounded-2xl shadow-md active:scale-95 transition-all text-sm flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4 text-rose-600" />
                  <span>AI 썸네일 추천 받으러 가기 →</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Gemini API AI Thumbnail Suggestions */}
        {activeTab === 'thumbnail' && (
          <div className="animate-in fade-in duration-300">
            <AiThumbnailSection
              suggestions={thumbnailSuggestions}
              isLoading={isLoadingSuggestions}
              onRefreshSuggestions={() => triggerAiThumbnails(keyframes)}
              onSendToEditor={handleSendSuggestionToEditor}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              hasApiKey={hasApiKey}
              keyframes={keyframes}
              source={suggestionSource}
              errorMessage={suggestionError}
            />
          </div>
        )}

        {/* Tab 3: Simple Subtitle & Cute Sticker Overlay Canvas */}
        {activeTab === 'editor' && (
          <div className="animate-in fade-in duration-300">
            <StickerCanvas
              currentVideo={currentVideo}
              overlays={overlays}
              setOverlays={setOverlays}
              initialBackgroundUrl={editorBackgroundUrl}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t-2 border-amber-100 bg-white/70 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-neutral-800">키즈 튜브 스튜디오</span>
            <span>·</span>
            <span>어린이 유튜브 크리에이터를 위한 동영상 편집 놀이터 🎈</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-600 font-medium">
            <button onClick={() => setIsApiKeyModalOpen(true)} className="hover:text-amber-600">
              Gemini API 키 관리
            </button>
            <span>·</span>
            <button onClick={() => setActiveTab('analyze')} className="hover:text-amber-600">
              샘플 영상 다시 열기
            </button>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={handleKeyUpdated}
      />
    </div>
  );
}
