import React, { useState } from 'react';
import { X, Check, Sparkles, AlertCircle, ShieldCheck, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { testAiLiveConnection } from '../utils/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);

    const result = await testAiLiveConnection();
    setTestResult(result);
    setTesting(false);
  };

  return (
    <div
      id="api-key-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="api-key-modal-card"
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-200 text-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-api-key-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 flex items-center gap-2">
              AI 스마트 엔진 연결 상태
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              하온이와 리호의 전용 스튜디오 AI 상시 연결 안내
            </p>
          </div>
        </div>

        {/* Main Status Badge */}
        <div className="mb-5 p-5 bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-3xl border-2 border-emerald-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold text-sm sm:text-base text-emerald-900">
                AI 스마트 엔진 상시 연결됨 (정상)
              </span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900">
              Gemini 3.6 Flash
            </span>
          </div>

          <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
            하온이와 리호를 위해 <strong>전용 AI 키가 서버에 고정</strong>되어 있습니다. 
            스마트폰, 태블릿, 다른 컴퓨터 등 어떤 기기에서 접속하셔도 별도로 키를 입력할 필요 없이 바로 사용 가능합니다.
          </p>
        </div>

        {/* Key Security Notice */}
        <div className="mb-5 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-start gap-3 text-xs text-neutral-600">
          <Lock className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-bold text-neutral-800">안전한 보안 모드 작동 중</p>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              다른 사람이 볼 수 없도록 실제 API 키 문자열은 안전하게 보호되며, 연결 활성화 상태만 표시됩니다.
            </p>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`mb-4 p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-in fade-in duration-200 ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p>{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="test-ai-connection-btn"
            onClick={handleTestKey}
            disabled={testing}
            className="flex-1 px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                <span>AI 응답 속도 확인 중...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AI 연결 상태 테스트</span>
              </>
            )}
          </button>

          <button
            id="close-modal-confirm-btn"
            onClick={onClose}
            className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl text-xs sm:text-sm transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
