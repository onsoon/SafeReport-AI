import React from "react";
import { ShieldCheck, Key, Cpu, HelpCircle, Lock } from "lucide-react";
import { useApiStore } from "../store/useApiStore";
import { useReportStore } from "../store/useReportStore";

export const Header: React.FC = () => {
  const { activeProvider, setModalOpen, hasActiveKey, getMaskedKey } = useApiStore();
  const { currentStep, setStep } = useReportStore();

  const providerNames: Record<string, string> = {
    google: "Google Gemini AI",
    openai: "OpenAI GPT-4o",
    anthropic: "Anthropic Claude",
    upstage: "Upstage Solar",
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner: Busan Metropolitan City Official Skin Bar */}
      <div className="bg-busan-gradient text-white text-xs px-4 py-1.5 flex items-center justify-between font-medium">
        <div className="flex items-center space-x-3">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
            BUSAN IS GOOD
          </span>
          <span className="hidden sm:inline opacity-90">
            부산광역시 공공 데이터 보안 및 AI 공문서 자동 생성 솔루션
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] opacity-90">
          <span className="flex items-center space-x-1">
            <Lock className="w-3 h-3 text-cyan-200" />
            <span>100% 브라우저 메모리 비식별화</span>
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">행정안전부 보안 지침 준수</span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-busan-primary text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                SafeReport <span className="text-busan-primary">AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-busan-primary border border-blue-200 rounded-md">
                부산광역시 전용
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              개인정보 자동 마스킹 & HWP 공공 보고서 자동 생성 시스템
            </p>
          </div>
        </div>

        {/* Wizard Steps Breadcrumbs (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          {[
            { step: 1, label: "1. 데이터 업로드" },
            { step: 2, label: "2. 비식별화 검증" },
            { step: 3, label: "3. 보고서 설정" },
            { step: 4, label: "4. HWP 보고서" },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            return (
              <button
                key={item.step}
                onClick={() => setStep(item.step as any)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? "bg-busan-primary text-white shadow-xs font-bold"
                    : isCompleted
                    ? "text-busan-primary bg-blue-50 hover:bg-blue-100"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls: API Key Setting Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setModalOpen(true)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              hasActiveKey()
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse"
            }`}
          >
            <Key className="w-4 h-4 text-emerald-600" />
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-slate-500 leading-tight">
                AI API 설정 ({providerNames[activeProvider]})
              </div>
              <div className="font-semibold text-xs leading-tight">
                {hasActiveKey() ? getMaskedKey() : "API Key 입력 필요"}
              </div>
            </div>
            <span className="sm:hidden font-bold">API Key</span>
          </button>
        </div>
      </div>
    </header>
  );
};
