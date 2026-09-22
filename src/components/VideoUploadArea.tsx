import React, { useRef, useState } from 'react';
import { Upload, Film, Sparkles, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import { SAMPLE_KID_VIDEOS } from '../data/stickers';
import { VideoItem } from '../types';

interface VideoUploadAreaProps {
  currentVideo: VideoItem | null;
  onSelectVideo: (video: VideoItem) => void;
  isExtracting: boolean;
  extractProgress: number;
}

export const VideoUploadArea: React.FC<VideoUploadAreaProps> = ({
  currentVideo,
  onSelectVideo,
  isExtracting,
  extractProgress,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const videoItem: VideoItem = {
      id: `upload-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      url: objectUrl,
      source: 'upload',
      file,
      resolution: 'Uploaded Video',
      description: '내 컴퓨터에서 직접 올린 동영상',
    };
    onSelectVideo(videoItem);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov'))) {
      processSelectedFile(file);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Box */}
      <div
        id="video-drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-3xl border-4 border-dashed p-6 sm:p-8 text-center transition-all ${
          isDragOver
            ? 'border-amber-500 bg-amber-50 scale-[1.01]'
            : 'border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-50/40'
        } shadow-sm`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleFileChange}
          className="hidden"
          id="video-file-input"
        />

        <div className="max-w-xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-xs transform hover:rotate-6 transition-transform">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2">
            동영상을 이곳에 쏙 넣어보세요!
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 mb-6 font-medium">
            스마트폰으로 찍은 영상이나 MP4, MOV 파일을 끌어다 놓거나 아래 버튼을 눌러주세요.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              id="select-local-video-btn"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-neutral-900 font-extrabold rounded-2xl shadow-md shadow-amber-200 hover:shadow-lg active:scale-95 transition-all text-sm sm:text-base flex items-center gap-2.5"
            >
              <Film className="w-5 h-5 text-neutral-900" />
              <span>내 영상 파일 선택하기</span>
            </button>
          </div>

          {currentVideo && (
            <div className="mt-5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>현재 선택된 영상: {currentVideo.title}</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="ml-2 text-xs text-emerald-700 underline font-semibold flex items-center gap-1 hover:text-emerald-900"
              >
                <RefreshCw className="w-3 h-3" /> 다른 영상으로 변경
              </button>
            </div>
          )}
        </div>

        {/* Keyframe extraction progress banner */}
        {isExtracting && (
          <div className="mt-6 pt-5 border-t border-amber-100 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-900 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                영상의 멋진 순간 5개를 찾는 중...
              </span>
              <span>{extractProgress}%</span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-3 overflow-hidden p-0.5 border border-amber-200">
              <div
                className="bg-gradient-to-r from-amber-400 to-rose-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${extractProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Preset Kids Samples */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-neutral-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="font-extrabold text-neutral-900 text-sm sm:text-base">
              파일이 없어도 괜찮아요! 재미있는 샘플 영상으로 바로 시작하기
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-600 hidden sm:inline-block">
            1초 만에 테스트 완료 🚀
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {SAMPLE_KID_VIDEOS.map((sample) => {
            const isSelected = currentVideo?.id === sample.id;
            return (
              <div
                key={sample.id}
                onClick={() =>
                  onSelectVideo({
                    id: sample.id,
                    title: sample.title,
                    url: sample.url,
                    thumbnail: sample.thumbnail,
                    duration: sample.duration,
                    source: 'preset',
                    description: sample.desc,
                  })
                }
                className={`group cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-300'
                    : 'border-neutral-200 bg-neutral-50/60 hover:border-amber-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-neutral-900 mb-2.5">
                    <img
                      src={sample.thumbnail}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-amber-400 text-neutral-900 shadow-xs">
                      {sample.badge}
                    </span>
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center shadow-md">
                        <Play className="w-5 h-5 fill-neutral-900 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 line-clamp-1 mb-1">
                    {sample.title}
                  </h4>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {sample.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">재생시간: 약 {Math.floor(sample.duration / 60)}분 {sample.duration % 60}초</span>
                  <span className={`font-bold ${isSelected ? 'text-amber-600' : 'text-neutral-500 group-hover:text-amber-600'}`}>
                    {isSelected ? '선택됨 ✓' : '영상 열기 →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
