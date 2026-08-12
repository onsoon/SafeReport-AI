import React, { useState } from "react";
import { Sparkles, FileText, Key, Send, AlertTriangle, Building, User, Calendar, CheckCircle2, RefreshCw } from "lucide-react";
import { useReportStore } from "../store/useReportStore";
import { useApiStore } from "../store/useApiStore";
import { generateReportFromLLM } from "../utils/generateReport";
import { ReportTemplate } from "../types";

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "business_performance",
    title: "공공사업 추진 성과 및 집계 보고서",
    subtitle: "사업별 수혜자, 지원 규모 및 사업 완료 통계",
    category: "사업성과",
    description: "지원사업 신청자 및 예산 집행 데이터 기반 공공 성과 보고서",
    recommendedFor: "소상공인 지원, 주민복지사업, 시정 핵심 과제",
    defaultPrompt: "사업별 신청 건수, 승인율, 지역별 지원 집계 수치를 도표 형태로 요약하여 행정안전부 제출 양식으로 작성하세요.",
    iconName: "FileText",
  },
  {
    id: "complaint_analysis",
    title: "시민 민원동향 분석 및 대응방안 보고서",
    subtitle: "민원 유형, 처리 시간, 처리 결과 및 불만 요인 분석",
    category: "민원분석",
    description: "공공시설 및 시민 서비스 관련 접수 민원 데이터 종합 분석",
    recommendedFor: "교통, 환경위생, 공공체육시설, 도로정비 민원",
    defaultPrompt: "주요 민원 분야별 발생 빈도 및 긴급 대응이 필요한 사안을 구분하고, 단기/중장기 민원 개선 대책을 포함하세요.",
    iconName: "FileText",
  },
  {
    id: "budget_execution",
    title: "공공 예산 집행 실태 및 집계 보고서",
    subtitle: "월별 예산 집행률 및 이월 예산 분석",
    category: "예산집행",
    description: "부서별 예산 집행 내역 및 집행율 현황 분석",
    recommendedFor: "재정집행, 사업비 지출, 감사 지적 예방",
    defaultPrompt: "예산 집행 잔액 및 불용율 위험 항목을 지정하고 집행 신속화 권고사항을 작성하세요.",
    iconName: "FileText",
  },
];

export const WizardStep3Generate: React.FC = () => {
  const {
    dataset,
    selectedTemplate,
    setSelectedTemplate,
    customPrompt,
    setCustomPrompt,
    departmentName,
    setDepartmentName,
    authorName,
    setAuthorName,
    isGenerating,
    setIsGenerating,
    setGeneratedReport,
    setGenerationError,
    generationError,
    setStep,
  } = useReportStore();

  const { activeProvider, keys, getActiveKeyConfig, setModalOpen, hasActiveKey } = useApiStore();
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(
    selectedTemplate?.id || REPORT_TEMPLATES[0].id
  );

  const activeConfig = getActiveKeyConfig();

  const handleStartGeneration = async () => {
    if (!dataset) return;

    // Check if key is required
    if (!hasActiveKey() && activeProvider !== "google") {
      setGenerationError("선택하신 LLM 서비스를 사용하기 위해 API Key 설정이 필요합니다.");
      setModalOpen(true);
      return;
    }

    const template = REPORT_TEMPLATES.find((t) => t.id === currentTemplateId) || REPORT_TEMPLATES[0];
    setSelectedTemplate(template);
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Build dataset summary
      const topRowsSample = dataset.maskedRows.slice(0, 10);
      const datasetSummary = `
[데이터셋명]: ${dataset.fileName}
[전체 데이터 행 수]: ${dataset.stats.totalRows}행
[전체 개인정보 마스킹 건수]: ${dataset.stats.piiCount}건 (RRN: ${dataset.stats.countsByCategory.rrn}, 전화: ${dataset.stats.countsByCategory.phone}, 주소: ${dataset.stats.countsByCategory.address})
[마스킹 처리된 샘플 수치 요약]:
${JSON.stringify(topRowsSample, null, 2)}
      `;

      const result = await generateReportFromLLM(
        {
          templateId: template.id,
          templateTitle: template.title,
          datasetName: dataset.fileName,
          maskedDataSummary: datasetSummary,
          customInstructions: customPrompt || template.defaultPrompt,
          departmentName: departmentName || "부산광역시 행정자치국",
          authorName: authorName || "김행정 주무관",
          reportDate: new Date().toLocaleDateString("ko-KR"),
        },
        {
          provider: activeProvider,
          apiKey: activeConfig.apiKey,
          model: activeConfig.model,
        }
      );

      setGeneratedReport(result);
      setIsGenerating(false);
      setStep(4); // Move to Step 4 Result View
    } catch (err: any) {
      setGenerationError(err.message || "AI 보고서 생성 중 오류가 발생했습니다.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-1">
        <span className="busan-badge">Step 3. AI 보고서 양식 및 지시사항 설정</span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          공공 보고서 생성 양식 및 작성자 정보
        </h2>
        <p className="text-xs text-slate-500">
          비식별화된 통계 데이터를 바탕으로 부산광역시 표준 공문서 서식 HWP 보고서를 자동 생성합니다.
        </p>
      </div>

      {/* API Key Missing Warning Banner */}
      {!hasActiveKey() && activeProvider !== "google" && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">API Key가 설정되어 있지 않습니다:</span> {activeProvider.toUpperCase()} 서비스로 보고서를 생성하기 위해 상단 [AI API 설정]에서 API Key를 입력해주세요.
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 ml-2"
          >
            Key 입력하기
          </button>
        </div>
      )}

      {/* Template Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-800">
          1. 보고서 양식 템플릿 선택
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REPORT_TEMPLATES.map((tmpl) => {
            const isSelected = currentTemplateId === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setCurrentTemplateId(tmpl.id)}
                className={`busan-card p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "border-busan-primary bg-blue-50/60 ring-2 ring-busan-primary/20"
                    : "bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-busan-primary border rounded">
                    {tmpl.category}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-busan-primary" />}
                </div>
                <h3 className="text-xs font-bold text-slate-900">{tmpl.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tmpl.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department & Author Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800">2. 공문서 결재선 및 작성 정보</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Building className="w-3.5 h-3.5 text-busan-primary" />
              <span>소속 부서명</span>
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="예: 부산광역시 디지털도시혁신실 데이터기획과"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-busan-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-busan-primary" />
              <span>작성자 및 직급</span>
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="예: 김행정 주무관"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-busan-primary"
            />
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            3. 공무원 추가 지시사항 및 강조 포인트 (선택)
          </label>
          <textarea
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="예: 소상공인 난방비 지원사업 항목 중 연간 집행률 수치와 미집행 사유 분석을 강조하여 작성해 주세요."
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-busan-primary"
          />
        </div>
      </div>

      {generationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{generationError}</span>
        </div>
      )}

      {/* Start Button */}
      <div className="text-center pt-2">
        <button
          onClick={handleStartGeneration}
          disabled={isGenerating}
          className="w-full sm:w-auto px-8 py-3.5 bg-busan-gradient text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 mx-auto disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
              <span>AI가 부산광역시 공문서 보고서를 작성 중입니다...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{activeProvider.toUpperCase()}로 HWP 공공 보고서 즉시 생성하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
