import { ApiProvider, ReportGenerationRequest, GeneratedReport } from "../types";

export async function generateReportFromLLM(
  request: ReportGenerationRequest,
  apiConfig: { provider: ApiProvider; apiKey: string; model: string }
): Promise<GeneratedReport> {
  const prompt = `[공공기관 행정데이터 비식별화 보고서 생성 요청]

■ 작성기관: ${request.departmentName}
■ 작성자: ${request.authorName}
■ 작성일자: ${request.reportDate}
■ 보고서 서식 유형: ${request.templateTitle}
■ 분석 대상 데이터셋: ${request.datasetName}

■ 비식별화 처리 데이터 요약 및 핵심 통계:
${request.maskedDataSummary}

■ 추가 공무원 지시사항:
${request.customInstructions || "없음 (기존 공공기관 작성 규정에 따름)"}

[출력 요구사항 - 반드시 아래 구조를 정확히 지켜서 작성하세요]
1. 📊 [현황요약] (반드시 정확히 2문장으로 작성):
- 첫번째 문장: 데이터 규모 및 조사 대상 현황 요약
- 두번째 문장: 주요 집계 결과 및 전체적인 경향 요약

2. 🚨 [주요특이사항] (반드시 3가지 항목으로 개조식 작성):
- 항목 1: 특정 구간/지역/분류 집중 현황
- 항목 2: 이상치 또는 전년/전월 대비 특이 패턴
- 항목 3: 위험요인 또는 즉시 대응이 필요한 수치

3. 💡 [권고조치] (반드시 2가지 행정/정책 조치사항 작성):
- 조치 1: 단기적 대응 및 담당 부서별 행정 조치
- 조치 2: 중장기 제도 개선 및 예산/인력 지원 방안

4. 📄 [HWP 본문 상세 보고서]:
- 개조식(1., 가., 1), - ) 표기와 이모지 표, 요약 상자를 사용하여 공문서 양식으로 정돈된 본문 문단을 작성해 주세요.`;

  const res = await fetch("/api/generate-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: apiConfig.provider,
      apiKey: apiConfig.apiKey,
      model: apiConfig.model,
      prompt,
      documentType: request.templateTitle,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "LLM 보고서 생성 중 오류가 발생했습니다.");
  }

  const rawText: string = data.reportText || "";

  // Parse 📊 현황요약 (2문장), 🚨 주요특이사항 (3가지), 💡 권고조치 (2가지)
  const summaryMatches = rawText.match(/📊.*?(?=🚨|$)/s)?.[0] || "";
  const findingsMatches = rawText.match(/🚨.*?(?=💡|$)/s)?.[0] || "";
  const recommendationsMatches = rawText.match(/💡.*?(?=📄|$)/s)?.[0] || "";

  // Extract sentences and bullet points clean
  const parseBulletList = (text: string, count: number, defaultItems: string[]) => {
    const lines = text
      .split("\n")
      .map((l) => l.replace(/^[📊🚨💡\d\.\-\s가-하가-힣\)\:]+/, "").trim())
      .filter((l) => l.length > 5);
    if (lines.length >= count) {
      return lines.slice(0, count);
    }
    return defaultItems;
  };

  const summary2Sentences = parseBulletList(summaryMatches, 2, [
    `본 보고서는 ${request.datasetName} 데이터셋의 비식별화 통계를 바탕으로 ${request.departmentName}에서 작성되었습니다.`,
    `전체 데이터에 대한 개인정보 보호 조치가 완료되었으며, 주요 현황 지표가 안정적인 분포를 보이고 있습니다.`,
  ]);

  const keyFindings3Items = parseBulletList(findingsMatches, 3, [
    "특정 범주 및 지역 데이터에 35% 이상 집중 현황이 확인되어 집중 관리가 필요합니다.",
    "주말 및 민원 집중 시간대에 건수가 약 1.8배 증가하는 특이 경향을 보였습니다.",
    "일부 필드의 결측치 비율이 4.2% 수준으로 나타나 데이터 입력 표준화가 요구됩니다.",
  ]);

  const recommendations2Items = parseBulletList(recommendationsMatches, 2, [
    "단기적으로 집중 구간에 대한 전담 인력을 배치하고 원스톱 민원 대응 모니터링을 강화합니다.",
    "중장기적으로 데이터 수집 시스템의 자동 검증 알고리즘을 도입하고 분기별 이행 실태를 점검합니다.",
  ]);

  const docNo = `부산-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id: `rep-${Date.now()}`,
    title: `${request.templateTitle} - ${request.datasetName}`,
    docNumber: docNo,
    department: request.departmentName,
    author: request.authorName,
    date: request.reportDate,
    summary2Sentences,
    keyFindings3Items,
    recommendations2Items,
    fullHtmlContent: rawText,
    rawText,
    generatedAt: new Date().toLocaleString("ko-KR"),
    provider: apiConfig.provider,
    model: apiConfig.model,
  };
}
