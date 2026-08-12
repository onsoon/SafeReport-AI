import React from "react";
import { Header } from "./components/Header";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { WizardStep1Upload } from "./components/WizardStep1Upload";
import { WizardStep2Masking } from "./components/WizardStep2Masking";
import { WizardStep3Generate } from "./components/WizardStep3Generate";
import { WizardStep4Result } from "./components/WizardStep4Result";
import { useReportStore } from "./store/useReportStore";
import { ShieldCheck, Lock, FileSpreadsheet, Sparkles, Building2 } from "lucide-react";

export default function App() {
  const { currentStep } = useReportStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FA] text-[#1A1D20]">
      {/* Busan Metropolitan City Skin Header */}
      <Header />

      {/* API Key Modal */}
      <ApiKeyModal />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Step Content */}
        {currentStep === 1 && <WizardStep1Upload />}
        {currentStep === 2 && <WizardStep2Masking />}
        {currentStep === 3 && <WizardStep3Generate />}
        {currentStep === 4 && <WizardStep4Result />}
      </main>

      {/* Busan Metropolitan City Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-busan-primary text-white flex items-center justify-center font-bold text-sm">
              B
            </div>
            <div>
              <div className="font-bold text-slate-200">
                부산광역시 SafeReport AI 비식별화 및 공문서 생성 시스템
              </div>
              <div className="text-[11px] text-slate-500">
                Busan is Good | 100% 브라우저 메모리 로컬 처리로 개인정보 전송 및 유출 위험 차단
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>클라이언트 단 메모리 비식별화</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HWP/HWPX 공공 표준 양식 지원</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
