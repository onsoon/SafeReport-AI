import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import { useReportStore } from "../store/useReportStore";
import { processDataSet } from "../utils/maskingEngine";
import {
  exportMaskedDataToExcel,
  exportMaskedDataToCSV,
  exportMaskedDataToOriginalFormat,
} from "../utils/fileExporter";

export const WizardStep2Masking: React.FC = () => {
  const {
    dataset,
    setDataset,
    setStep,
    maskingRules,
    updateMaskingRule,
    addCustomMaskingRule,
    removeMaskingRule,
  } = useReportStore();

  const [showRawData, setShowRawData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Custom rule modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");
  const [rulePattern, setRulePattern] = useState("");
  const [ruleMaskChar, setRuleMaskChar] = useState("*");
  const [ruleExample, setRuleExample] = useState("");

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
  };

  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      alert("규칙 명칭을 입력해주세요.");
      return;
    }
    if (!rulePattern.trim()) {
      alert("정규식 패턴 또는 문자열 감지 패턴을 입력해주세요.");
      return;
    }

    addCustomMaskingRule({
      name: ruleName.trim(),
      description: ruleDesc.trim() || "사용자 지정 비식별화 규칙",
      patternName: rulePattern.trim(),
      enabled: true,
      maskingCharacter: ruleMaskChar || "*",
      replacementExample: ruleExample.trim() || "MASKED",
      isCustom: true,
      regexPattern: rulePattern.trim(),
    });

    // Reset Form & Close Modal
    setRuleName("");
    setRuleDesc("");
    setRulePattern("");
    setRuleMaskChar("*");
    setRuleExample("");
    setIsAddModalOpen(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-busan-primary" />
            <h3 className="text-xs font-extrabold text-slate-800">
              개인정보 항목별 마스킹 토글 및 비식별화 규칙
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-500 hidden md:inline">
              필요시 사용자 지정 비식별화 정규식 규칙을 추가하세요.
            </span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 bg-busan-primary text-white rounded-xl text-xs font-bold hover:bg-busan-primary-dark transition-all flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>규칙 직접 추가</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {maskingRules.map((rule) => {
            const count = dataset.stats.countsByCategory[rule.id] || 0;
            return (
              <div
                key={rule.id}
                className={`p-3.5 rounded-xl border relative transition-all ${
                  rule.enabled
                    ? "bg-blue-50/60 border-busan-primary/40 text-busan-primary shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-900">{rule.name}</span>
                      {rule.isCustom && (
                        <span className="text-[9px] font-extrabold bg-violet-100 text-violet-700 px-1.5 py-0.2 rounded-md border border-violet-200">
                          직접추가
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{rule.description}</p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {rule.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`'${rule.name}' 커스텀 규칙을 삭제하시겠습니까?`)) {
                            removeMaskingRule(rule.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="규칙 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => handleRuleToggle(rule.id, e.target.checked)}
                      className="w-4 h-4 accent-busan-primary rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-600">감지: {count}건</span>
                  <span
                    className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 max-w-[120px] truncate"
                    title={rule.patternName}
                  >
                    {rule.replacementExample}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-busan-primary/10 text-busan-primary flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">사용자 지정 비식별화 규칙 추가</h3>
                  <p className="text-[11px] text-slate-500">특정 사번, 차량번호, 기밀 문자열 패턴 등을 직접 마스킹합니다.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomRule} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  규칙 명칭 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 사업자등록번호, 사번(직원번호), 차량번호"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-busan-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  감지 패턴 (정규식/Regex) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: \b\d{3}-\d{2}-\d{5}\b (사업자번호) 또는 대외비"
                  value={rulePattern}
                  onChange={(e) => setRulePattern(e.target.value)}
                  className="w-full text-xs p-2.5 font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-busan-primary"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  자바스크립트 정규 표현식 패턴을 지원합니다. (예: <code className="bg-slate-100 px-1 font-bold">대외비</code>, <code className="bg-slate-100 px-1 font-bold">\b\d{'{4}'}-\d{'{4}'}\b</code>)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    마스킹 대체 기호
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="*"
                    value={ruleMaskChar}
                    onChange={(e) => setRuleMaskChar(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-busan-primary text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대체 예시
                  </label>
                  <input
                    type="text"
                    placeholder="예: 101-**-*****"
                    value={ruleExample}
                    onChange={(e) => setRuleExample(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-busan-primary font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  설명
                </label>
                <input
                  type="text"
                  placeholder="예: 3-2-5 자리 사업자등록번호 국세청 서식 마스킹"
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-busan-primary"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-busan-primary hover:bg-busan-primary-dark rounded-xl shadow-md flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>규칙 등록 및 즉시 마스킹</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
