import React, { useState } from "react";
import { Upload, FileSpreadsheet, Sparkles, AlertCircle, ArrowRight, Database, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { useReportStore } from "../store/useReportStore";
import { processDataSet, SAMPLE_PUBLIC_DATASETS } from "../utils/maskingEngine";

export const WizardStep1Upload: React.FC = () => {
  const { setDataset, setStep, maskingRules } = useReportStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });

        if (!jsonData || jsonData.length === 0) {
          throw new Error("업로드된 파일에 데이터가 존재하지 않습니다.");
        }

        const processed = processDataSet(jsonData, file.name, file.size, maskingRules);
        setDataset(processed);
        setIsLoading(false);
        setStep(2); // Auto move to Step 2
      } catch (err: any) {
        setErrorMessage(err.message || "파일 처리 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage("파일을 읽는 중 오류가 발생했습니다.");
      setIsLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSampleLoad = (sampleIndex: number) => {
    setIsLoading(true);
    const sample = SAMPLE_PUBLIC_DATASETS[sampleIndex];
    setTimeout(() => {
      const processed = processDataSet(sample.data, sample.name, 1024 * 45, maskingRules);
      setDataset(processed);
      setIsLoading(false);
      setStep(2);
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <span className="busan-badge">Step 1. 데이터 보안 업로드</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          분석할 행정 데이터를 업로드하세요
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          업로드된 파일은 외부 서버로 전송되지 않고 **100% 사용자의 브라우저 메모리** 상에서만 안전하게 파싱 및 비식별화 처리됩니다.
        </p>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsHovered(true);
        }}
        onDragLeave={() => setIsHovered(false)}
        onDrop={handleDrop}
        className={`busan-card border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
          isHovered
            ? "border-busan-secondary bg-cyan-50/50 scale-[1.01]"
            : "border-slate-300 hover:border-busan-primary bg-white"
        }`}
      >
        <input
          type="file"
          id="fileInput"
          accept=".xlsx, .xls, .csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
        <label htmlFor="fileInput" className="cursor-pointer space-y-4 block">
          <div className="w-16 h-16 bg-blue-50 text-busan-primary rounded-2xl mx-auto flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-9 h-9 text-busan-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              엑셀(.xlsx, .xls) 또는 CSV 파일을 이곳에 드래그하거나 클릭하세요
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              최대 지원 용량: 50MB | 지원 포맷: Excel Workbook, CSV
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-busan-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-busan-primary-dark transition-all">
            <Upload className="w-4 h-4" />
            <span>컴퓨터에서 파일 선택</span>
          </div>
        </label>
      </div>

      {isLoading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-3 text-xs text-busan-primary font-bold animate-pulse">
          <div className="w-4 h-4 border-2 border-busan-primary border-t-transparent rounded-full animate-spin" />
          <span>브라우저 메모리에서 개인정보 항목 스캔 및 파싱을 진행하고 있습니다...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pre-loaded Public Datasets */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-busan-primary" />
          <h3 className="text-sm font-bold text-slate-800">
            실습 및 검증용 공공 데이터 샘플 선택
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_PUBLIC_DATASETS.map((sample, idx) => (
            <div
              key={idx}
              onClick={() => handleSampleLoad(idx)}
              className="busan-card p-4 hover:border-busan-secondary cursor-pointer flex items-start space-x-3 bg-white"
            >
              <div className="p-2.5 bg-cyan-50 rounded-lg text-busan-secondary shrink-0">
                <Sparkles className="w-5 h-5 text-busan-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{sample.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{sample.description}</p>
                <div className="mt-2 text-[10px] text-busan-primary font-bold flex items-center space-x-1">
                  <span>샘플 데이터 로드하기</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
