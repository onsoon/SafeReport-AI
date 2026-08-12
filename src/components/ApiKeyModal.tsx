import React, { useState } from "react";
import { X, Key, CheckCircle2, AlertCircle, RefreshCw, ShieldAlert, Cpu } from "lucide-react";
import { useApiStore } from "../store/useApiStore";
import { ApiProvider } from "../types";

export const ApiKeyModal: React.FC = () => {
  const {
    isModalOpen,
    setModalOpen,
    activeProvider,
    setActiveProvider,
    keys,
    setApiKey,
    setSelectedModel,
    clearApiKey,
    testKeyConnection,
  } = useApiStore();

  const [inputKey, setInputKey] = useState("");
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isModalOpen) return null;

  const currentConfig = keys[activeProvider];

  const providers: { id: ApiProvider; name: string; desc: string; models: string[] }[] = [
    {
      id: "google",
      name: "Google Gemini",
      desc: "공공기관 권장 무료 및 고성능 AI 모델 (기본 제공)",
      models: ["gemini-3.6-flash", "gemini-2.5-pro"],
    },
    {
      id: "openai",
      name: "OpenAI",
      desc: "GPT-4o, GPT-4o-mini 모델 지원",
      models: ["gpt-4o", "gpt-4o-mini"],
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      desc: "Claude 3.5 Sonnet 행정 문서 특화 모델",
      models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
    },
    {
      id: "upstage",
      name: "Upstage Solar",
      desc: "대한민국 국산 LLM 대표 모델 (공공문서 이해 우수)",
      models: ["solar-pro", "solar-mini"],
    },
  ];

  const handleSave = () => {
    if (inputKey.trim()) {
      setApiKey(activeProvider, inputKey.trim());
      setInputKey("");
    }
    setTestResult({ success: true, message: "API Key 설정이 브라우저 로컬 저장소에 저장되었습니다." });
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    if (inputKey.trim()) {
      setApiKey(activeProvider, inputKey.trim());
    }
    const result = await testKeyConnection(activeProvider);
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-busan-gradient text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Key className="w-5 h-5 text-cyan-300" />
            <div>
              <h2 className="text-lg font-bold">사용자 지정 AI API Key 설정 (BYOK)</h2>
              <p className="text-xs text-blue-100">
                개인 또는 기관 보유 AI API Key를 안전하게 연동하여 사용합니다.
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Security Assurance Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-slate-700">
            <ShieldAlert className="w-5 h-5 text-busan-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-busan-primary">보안 및 저장 안내:</span> 입력한 API Key는 외부 서버에 저장되지 않고 공무원 사용자의 **브라우저 로컬 저장소(LocalStorage)**에만 안전하게 보관됩니다.
            </div>
          </div>

          {/* Provider Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              AI 모델 제공자 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {providers.map((p) => {
                const isActive = activeProvider === p.id;
                const hasKey = Boolean(keys[p.id]?.apiKey);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProvider(p.id);
                      setInputKey("");
                      setTestResult(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isActive
                        ? "border-busan-primary bg-blue-50/80 ring-2 ring-busan-primary/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isActive ? "text-busan-primary" : "text-slate-800"}`}>
                        {p.name}
                      </span>
                      {hasKey && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Provider Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {providers.find((p) => p.id === activeProvider)?.name} 상세 설정
                </h3>
                <p className="text-xs text-slate-500">
                  {providers.find((p) => p.id === activeProvider)?.desc}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-white border rounded-lg font-semibold text-slate-700">
                현재 키: {currentConfig.apiKey ? "등록됨" : "미등록"}
              </span>
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                사용 모델 선택
              </label>
              <select
                value={currentConfig.model}
                onChange={(e) => setSelectedModel(activeProvider, e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-busan-primary focus:outline-none"
              >
                {providers
                  .find((p) => p.id === activeProvider)
                  ?.models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
              </select>
            </div>

            {/* Key Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                API Key 입력 {activeProvider === "google" && "(기본 공용 키 사용 가능)"}
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={inputKey || currentConfig.apiKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder={
                    activeProvider === "google"
                      ? "Gemini API Key (미입력 시 기본 제공 서버 키 적용)"
                      : `${activeProvider.toUpperCase()} API Key를 입력하세요`
                  }
                  className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-busan-primary focus:outline-none font-mono"
                />
                {currentConfig.apiKey && (
                  <button
                    onClick={() => {
                      clearApiKey(activeProvider);
                      setInputKey("");
                    }}
                    className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                  testResult.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-busan-primary" : ""}`} />
            <span>{isTesting ? "연결 테스트 중..." : "API 연결 테스트"}</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all"
            >
              닫기
            </button>
            <button
              onClick={() => {
                handleSave();
                setModalOpen(false);
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-busan-primary hover:bg-busan-primary-dark rounded-xl shadow-md transition-all"
            >
              저장 및 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
