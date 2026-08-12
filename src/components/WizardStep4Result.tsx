import React, { useState } from "react";
import {
  Download,
  FileCode,
  FileText,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Building,
  User,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { useReportStore } from "../store/useReportStore";
import { exportToHWP, exportToHWPX, exportToText } from "../utils/hwpExporter";
import { exportMaskedDataToOriginalFormat } from "../utils/fileExporter";

export const WizardStep4Result: React.FC = () => {
  const { generatedReport, dataset, setStep } = useReportStore();
  const [copied, setCopied] = useState(false);

  if (!generatedReport) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-slate-600">생성된 보고서 결과가 없습니다.</p>
        <button
          onClick={() => setStep(3)}
          className="px-4 py-2 bg-busan-primary text-white rounded-xl text-xs font-bold"
        >
          보고서 설정 단계로 이동
        </button>
      </div>
    );
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedReport.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Step Header & Export Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="busan-badge">Step 4. HWP 공공 보고서 완성</span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            {generatedReport.title}
          </h2>
          <p className="text-xs text-slate-500">
            문서번호: {generatedReport.docNumber} | 생성일시: {generatedReport.generatedAt}
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {dataset && (
            <button
              onClick={() => exportMaskedDataToOriginalFormat(dataset)}
              className="px-3.5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all flex items-center space-x-1.5"
              title="마스킹 처리된 원본 데이터 다운로드"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>🔒 마스킹 데이터 다운로드</span>
            </button>
          )}

          <button
            onClick={() => exportToHWP(generatedReport)}
            className="px-4 py-2.5 bg-busan-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-busan-primary-dark transition-all flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-cyan-300" />
            <span>.HWP 다운로드</span>
          </button>

          <button
            onClick={() => exportToHWPX(generatedReport)}
            className="px-3.5 py-2.5 bg-busan-accent text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center space-x-1.5"
          >
            <FileCode className="w-4 h-4 text-purple-200" />
            <span>.HWPX 다운로드</span>
          </button>

          <button
            onClick={() => exportToText(generatedReport)}
            className="px-3 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span>.TXT</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-3 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "복사완료" : "복사"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1"
          >
            <Printer className="w-4 h-4" />
            <span>인쇄</span>
          </button>
        </div>
      </div>

      {/* Main Report Document View Sheet (Hwp Style) */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-lg max-w-4xl mx-auto space-y-6 printable-area">
        {/* Document Header Table */}
        <div className="border-b-2 border-busan-primary pb-4 text-center space-y-2">
          <div className="text-xs font-bold text-busan-primary tracking-wider">
            부산광역시 공공 데이터 분석 보고서
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{generatedReport.title}</h1>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">문서번호</span>
            <span className="font-bold text-slate-800">{generatedReport.docNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block">소속부서</span>
            <span className="font-bold text-slate-800">{generatedReport.department}</span>
          </div>
          <div>
            <span className="text-slate-500 block">작성자</span>
            <span className="font-bold text-slate-800">{generatedReport.author}</span>
          </div>
          <div>
            <span className="text-slate-500 block">작성일자</span>
            <span className="font-bold text-slate-800">{generatedReport.date}</span>
          </div>
        </div>

        {/* Mandatory Format Sections */}
        {/* 1) 📊 현황요약 (2문장) */}
        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
          <h3 className="text-xs font-extrabold text-busan-primary flex items-center space-x-1.5">
            <span>📊 1. 현황요약</span>
            <span className="text-[10px] font-normal text-slate-500">(핵심 데이터 2문장 요약)</span>
          </h3>
          <ol className="list-decimal pl-5 text-xs text-slate-800 space-y-1 font-medium">
            {generatedReport.summary2Sentences.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
        </div>

        {/* 2) 🚨 주요특이사항 (3가지) */}
        <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2">
          <h3 className="text-xs font-extrabold text-busan-accent flex items-center space-x-1.5">
            <span>🚨 2. 주요특이사항</span>
            <span className="text-[10px] font-normal text-slate-500">(주요 데이터 3가지 특이사항)</span>
          </h3>
          <ul className="list-disc pl-5 text-xs text-slate-800 space-y-1 font-medium">
            {generatedReport.keyFindings3Items.map((f, idx) => (
              <li key={idx}>{f}</li>
            ))}
          </ul>
        </div>

        {/* 3) 💡 권고조치 (2가지) */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
          <h3 className="text-xs font-extrabold text-emerald-800 flex items-center space-x-1.5">
            <span>💡 3. 권고조치</span>
            <span className="text-[10px] font-normal text-slate-500">(구체적 행정/정책 조치 2가지)</span>
          </h3>
          <ul className="list-disc pl-5 text-xs text-slate-800 space-y-1 font-medium">
            {generatedReport.recommendations2Items.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>

        {/* 4) Full Report Text Document Body */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-extrabold text-slate-900 border-l-4 border-busan-primary pl-2">
            📄 4. 세부 행정 보고서 본문
          </h3>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
            {generatedReport.fullHtmlContent}
          </div>
        </div>

        {/* Security Stamp Footer */}
        <div className="pt-6 border-t border-slate-200 text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs text-busan-primary font-bold bg-blue-50 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-busan-primary" />
            <span>부산광역시 SafeReport AI - 개인정보 비식별화 검증 완료</span>
          </div>
          <p className="text-[10px] text-slate-400">
            본 문서는 개인정보보호법에 의거하여 마스킹이 완료된 통계 데이터로 작성되었습니다.
          </p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => setStep(3)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>이전: 보고서 설정 수정</span>
        </button>

        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 bg-busan-primary hover:bg-busan-primary-dark text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-md"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>새로운 데이터 업로드</span>
        </button>
      </div>
    </div>
  );
};
