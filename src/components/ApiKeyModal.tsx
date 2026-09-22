import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, Sparkles, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { getStoredApiKey, saveStoredApiKey, removeStoredApiKey, SUPPORTED_GEMINI_MODELS } from '../utils/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredApiKey(apiKey);
    setSaveSuccess(true);
    onKeyUpdated();
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClear = () => {
    removeStoredApiKey();
    setApiKey('');
    setTestResult(null);
    onKeyUpdated();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('API 키를 먼저 입력해주세요!');
      setTestResult('error');
      return;
    }

    setTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      const cleanKey = apiKey.trim();
      let connected = false;
      let lastErrMsg = '';

      for (const model of SUPPORTED_GEMINI_MODELS) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;
          
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': cleanKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Respond with OK' }] }],
            }),
          });

          if (res.ok) {
            connected = true;
            break;
          } else {
            const errorData = await res.json().catch(() => ({}));
            lastErrMsg = errorData?.error?.message || `HTTP ${res.status}`;
          }
        } catch (e: any) {
          lastErrMsg = e?.message || '네트워크 오류';
        }
      }

      if (!connected) {
        throw new Error(lastErrMsg || 'API 키 검증 실패. 키와 권한을 확인해주세요.');
      }

      setTestResult('success');
      saveStoredApiKey(cleanKey);
      onKeyUpdated();
    } catch (err: any) {
      setTestResult('error');
      setErrorMessage(err?.message || '연결에 실패했습니다. 키를 다시 확인해주세요.');
    } finally {
      setTesting(false);
    }
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-xs">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
              AI 열쇠 (Gemini API 키) 설정
            </h2>
            <p className="text-sm text-neutral-500 font-medium">
              더 똑똑하고 창의적인 썸네일 제목을 추천받을 수 있어요!
            </p>
          </div>
        </div>

        {/* Safe notice for parents & kids */}
        <div className="mb-5 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs sm:text-sm text-amber-900">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p>
              입력한 API 키는 내 컴퓨터의 웹 브라우저(localStorage)에만 안전하게 저장되며 외부 서버로 전송되지 않습니다.
            </p>
            <p className="mt-1 text-xs text-amber-800 font-semibold">
              💡 최신 Google AI Studio 키(<code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">AQ...</code> 또는 <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">AIzaSy...</code>) 모두 그대로 사용할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-neutral-700">
              Google AI Studio API 키 입력
            </label>
            <span className="text-[11px] font-medium text-neutral-500">
              AQ... 또는 AIzaSy... 시작
            </span>
          </div>
          <div className="relative">
            <input
              id="gemini-api-key-input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AQ... 또는 AIzaSy... 형식의 키를 붙여넣으세요"
              className="w-full px-4 py-3.5 pr-12 rounded-2xl border-2 border-neutral-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none text-sm font-mono transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
              aria-label="키 보이기/숨기기"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Test connection results */}
          {testResult === 'success' && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <Check className="w-4 h-4" /> Gemini AI 연결에 성공했습니다! 훌륭해요!
            </div>
          )}
          {testResult === 'error' && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          <button
            id="save-api-key-btn"
            onClick={handleSave}
            className="flex-1 px-5 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-neutral-900 font-bold rounded-2xl shadow-sm hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-900" /> 저장 완료!
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> 키 저장하기
              </>
            )}
          </button>

          <button
            id="test-api-key-btn"
            onClick={handleTestKey}
            disabled={testing}
            className="px-4 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-2xl transition-colors disabled:opacity-50 text-sm"
          >
            {testing ? '연결 확인 중...' : '연결 테스트'}
          </button>

          {apiKey && (
            <button
              id="clear-api-key-btn"
              onClick={handleClear}
              className="px-3.5 py-3.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors text-sm"
              title="저장된 키 삭제"
            >
              삭제
            </button>
          )}
        </div>

        {/* Free API Key Guide Link & Tips */}
        <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-500">
          <div className="flex items-center justify-between">
            <span>API 키가 아직 없으신가요?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-bold underline underline-offset-2"
            >
              Google AI Studio에서 무료로 받기
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[11px] text-neutral-400 leading-tight">
            * 복사 시 키 앞뒤에 공백이나 숨은 글자가 포함되지 않았는지 확인해주세요.
          </p>
        </div>
      </div>
    </div>
  );
};
