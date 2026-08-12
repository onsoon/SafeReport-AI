// AI API Providers supported
export type ApiProvider = "google" | "openai" | "anthropic" | "upstage";

export interface ApiKeyConfig {
  provider: ApiProvider;
  apiKey: string;
  model: string;
  isSavedLocally: boolean;
  lastTestedAt?: string;
  isValid?: boolean;
}

export type MaskingCategory =
  | "rrn" // 주민등록번호
  | "phone" // 전화번호/휴대전화
  | "email" // 이메일
  | "address" // 주소
  | "driver_license" // 운전면허번호
  | "bank_account" // 계좌번호/카드번호
  | "name" // 이름/성명
  | string; // 커스텀 사용자 정의 카테고리 ID

export interface MaskingRule {
  id: string;
  name: string;
  description: string;
  patternName: string;
  enabled: boolean;
  maskingCharacter: string;
  replacementExample: string;
  isCustom?: boolean;
  regexPattern?: string; // 정규식 패턴 문자열
}

export interface DetectedPII {
  id: string;
  rowIdx: number;
  colName: string;
  category: MaskingCategory;
  categoryName: string;
  originalValue: string;
  maskedValue: string;
}

export interface MaskingStats {
  totalRows: number;
  totalCols: number;
  piiCount: number;
  countsByCategory: Record<string, number>;
  riskScore: "안전" | "주의" | "경고" | "위험";
}

export interface DataColumn {
  key: string;
  name: string;
  type: "text" | "number" | "date";
  hasPII: boolean;
  detectedTypes: MaskingCategory[];
}

export interface ProcessedDataSet {
  fileName: string;
  fileSize: number;
  uploadTime: string;
  columns: DataColumn[];
  headers: string[];
  rawRows: Record<string, any>[];
  maskedRows: Record<string, any>[];
  detectedPIIs: DetectedPII[];
  stats: MaskingStats;
}

export interface ReportTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: "사업성과" | "민원분석" | "예산집행" | "정책제안" | "감사보고";
  description: string;
  recommendedFor: string;
  defaultPrompt: string;
  iconName: string;
}

export interface ReportGenerationRequest {
  templateId: string;
  templateTitle: string;
  datasetName: string;
  maskedDataSummary: string;
  customInstructions: string;
  departmentName: string;
  authorName: string;
  reportDate: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  docNumber: string;
  department: string;
  author: string;
  date: string;
  summary2Sentences: string[]; // 📊 현황요약 2문장
  keyFindings3Items: string[];  // 🚨 주요특이사항 3가지
  recommendations2Items: string[]; // 💡 권고조치 2가지
  fullHtmlContent: string;
  rawText: string;
  generatedAt: string;
  provider: ApiProvider;
  model: string;
}
