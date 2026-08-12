import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, Eye, EyeOff, Sliders, ArrowRight, ArrowLeft, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useReportStore } from "../store/useReportStore";
import { processDataSet } from "../utils/maskingEngine";
import { exportMaskedDataToExcel, exportMaskedDataToCSV, exportMaskedDataToOriginalFormat } from "../utils/fileExporter";

export const WizardStep2Masking: React.FC = () => {
  const { dataset, setDataset, setStep, maskingRules, updateMaskingRule } = useReportStore();
  const [showRawData, setShowRawData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!dataset) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-slate-600">업로드된 데이터가 없습니다.</p>
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 bg-busan-primary text-white rounded-xl text-xs font-bold"
        >
          데이터 업로드 단계로 이동
        </button>
      </div>
    );
  }

  const handleRuleToggle = (ruleId: string, enabled: boolean) => {
    updateMaskingRule(ruleId, enabled);
    // Re-evaluate dataset with updated rules
    const updatedRules = maskingRules.map((r) => (r.id === ruleId ? { ...r, enabled } : r));
    const reProcessed = processDataSet(dataset.rawRows, dataset.fileName, dataset.fileSize, updatedRules);
    setDataset(reProcessed);
  };

  const riskColors = {
    안전: "bg-emerald-100 text-emerald-800 border-emerald-300",
    주의: "bg-blue-100 text-blue-800 border-blue-300",
    경고: "bg-amber-100 text-amber-800 border-amber-300",
    위험: "bg-rose-100 text-rose-800 border-rose-300",
  };

  const filteredRows = (showRawData ? dataset.rawRows : dataset.maskedRows).filter((row) => {
    if (!searchQuery) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="busan-badge">Step 2. 실시간 개인정보 마스킹 검증</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {dataset.fileName} 데이터 비식별화 결과
          </h2>
          <p className="text-xs text-slate-500">
            총 {dataset.stats.totalRows}행 {dataset.stats.totalCols}열 | 감지된 개인정보 건수:{" "}
            <span className="font-bold text-rose-600">{dataset.stats.piiCount}건</span>
          </p>
        </div>

        {/* Risk Badge & Download & Step Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 ${
              riskColors[dataset.stats.riskScore]
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>위험도: {dataset.stats.riskScore}</span>
          </div>

          {/* Masked File Download Action Group */}
          <button
            onClick={() => exportMaskedDataToOriginalFormat(dataset)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            title="업로드했던 원본 포맷으로 마스킹 파일 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            <span>🔒 마스킹 원본파일 다운로드</span>
          </button>

          <button
            onClick={() => setStep(1)}
            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>이전</span>
          </button>
          <button
            onClick={() => setStep(3)}
            className="px-4 py-2 text-xs font-bold text-white bg-busan-primary hover:bg-busan-primary-dark rounded-xl shadow-md flex items-center space-x-1.5"
          >
            <span>다음: 보고서 설정</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Masking Rules Configuration Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-busan-primary" />
            <h3 className="text-xs font-extrabold text-slate-800">
              개인정보 항목별 마스킹 토글 및 비식별화 규칙
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            각 마스킹 규칙을 켜거나 꺼서 비식별화 수준을 제어하세요.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {maskingRules.map((rule) => {
            const count = dataset.stats.countsByCategory[rule.id] || 0;
            return (
              <div
                key={rule.id}
                onClick={() => handleRuleToggle(rule.id, !rule.enabled)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  rule.enabled
                    ? "bg-blue-50/60 border-busan-primary/40 text-busan-primary"
                    : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold truncate">{rule.name}</span>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => handleRuleToggle(rule.id, e.target.checked)}
                    className="w-3.5 h-3.5 accent-busan-primary rounded"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span>감지: {count}건</span>
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {rule.replacementExample}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Table Comparison View */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
        {/* Table Controls Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                showRawData
                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              {showRawData ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showRawData ? "원본 데이터 보기 (마스킹 해제)" : "마스킹 데이터 보기 (안전)"}</span>
            </button>
            <span className="text-xs text-slate-500">
              {showRawData ? "⚠️ 원본 상태에서는 개인정보가 노출됩니다." : "🔒 비식별화가 완료된 마스킹 상태입니다."}
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => exportMaskedDataToExcel(dataset)}
              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
              title="마스킹 처리된 데이터를 .xlsx 엑셀 파일로 다운로드"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>.XLSX</span>
            </button>
            <button
              onClick={() => exportMaskedDataToCSV(dataset)}
              className="px-2.5 py-1.5 bg-cyan-50 text-busan-primary hover:bg-cyan-100 border border-cyan-300 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
              title="마스킹 처리된 데이터를 .csv 파일로 다운로드"
            >
              <FileText className="w-3.5 h-3.5 text-busan-primary" />
              <span>.CSV</span>
            </button>
            <input
              type="text"
              placeholder="데이터 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 text-xs p-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-busan-primary"
            />
          </div>
        </div>

        {/* Scrollable Data Table */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                {dataset.columns.map((col) => (
                  <th key={col.key} className="p-3 min-w-[120px] whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span>{col.name}</span>
                      {col.hasPII && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="PII 포함 필드" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredRows.slice(0, 20).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-blue-50/30">
                  <td className="p-3 text-center text-slate-400 font-mono text-[10px]">
                    {rIdx + 1}
                  </td>
                  {dataset.headers.map((h) => {
                    const val = String(row[h] ?? "");
                    const isMaskedValue = val.includes("*");
                    return (
                      <td
                        key={h}
                        className={`p-3 whitespace-nowrap font-mono ${
                          isMaskedValue && !showRawData
                            ? "bg-blue-50/70 text-busan-primary font-bold"
                            : ""
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 border-t text-right text-[11px] text-slate-500">
          표시 중: 상위 20개 행 (전체 {filteredRows.length}행 중)
        </div>
      </div>
    </div>
  );
};
