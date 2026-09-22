import React from 'react';
import { Sparkles, Key, Video, Wand2, Palette } from 'lucide-react';

interface HeaderProps {
  activeTab: 'analyze' | 'thumbnail' | 'editor';
  onTabChange: (tab: 'analyze' | 'thumbnail' | 'editor') => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  videoLoaded: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenApiKeyModal,
  hasApiKey,
  videoLoaded,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b-2 border-amber-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => onTabChange('analyze')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-400 via-amber-400 to-yellow-300 flex items-center justify-center text-white shadow-md shadow-rose-200/50 transform hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl select-none">🎬</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-neutral-900">
                  키즈 튜브 스튜디오
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  어린이용 🌟
                </span>
              </div>
              <p className="text-xs text-neutral-500 hidden sm:block font-medium">
                영상 분석 · 자동 키프레임 · AI 썸네일 추천 · 스티커 꾸미기
              </p>
            </div>
          </div>

          {/* Right Action: API Key Button */}
          <div className="flex items-center gap-2">
            <button
              id="open-api-key-header-btn"
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all shadow-xs ${
                hasApiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-current" />
              <span>{hasApiKey ? 'AI 열쇠 켜짐' : 'AI 열쇠 설정'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 sm:gap-3 mt-3 pt-2 border-t border-neutral-100 overflow-x-auto no-scrollbar">
          <button
            id="tab-analyze-btn"
            onClick={() => onTabChange('analyze')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'analyze'
                ? 'bg-amber-400 text-neutral-900 shadow-md shadow-amber-200'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>1. 내 영상 분석</span>
            {videoLoaded && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            id="tab-thumbnail-btn"
            onClick={() => onTabChange('thumbnail')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'thumbnail'
                ? 'bg-rose-400 text-white shadow-md shadow-rose-200'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>2. AI 썸네일 추천</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/30 font-extrabold uppercase">
              Gemini
            </span>
          </button>

          <button
            id="tab-editor-btn"
            onClick={() => onTabChange('editor')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>3. 자막·스티커 스튜디오</span>
          </button>
        </div>
      </div>
    </header>
  );
};
