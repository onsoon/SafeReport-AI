import { create } from "zustand";
import { ProcessedDataSet, ReportTemplate, GeneratedReport, MaskingRule } from "../types";
import { DEFAULT_MASKING_RULES } from "../utils/maskingEngine";

export type WizardStep = 1 | 2 | 3 | 4;

interface ReportStoreState {
  currentStep: WizardStep;
  dataset: ProcessedDataSet | null;
  maskingRules: MaskingRule[];
  selectedTemplate: ReportTemplate | null;
  customPrompt: string;
  departmentName: string;
  authorName: string;
  isGenerating: boolean;
  generatedReport: GeneratedReport | null;
  generationError: string | null;

  // Actions
  setStep: (step: WizardStep) => void;
  setDataset: (dataset: ProcessedDataSet) => void;
  updateMaskingRule: (ruleId: string, enabled: boolean) => void;
  setSelectedTemplate: (template: ReportTemplate) => void;
  setCustomPrompt: (prompt: string) => void;
  setDepartmentName: (dept: string) => void;
  setAuthorName: (author: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setGeneratedReport: (report: GeneratedReport | null) => void;
  setGenerationError: (error: string | null) => void;
  resetWizard: () => void;
}

export const useReportStore = create<ReportStoreState>((set) => ({
  currentStep: 1,
  dataset: null,
  maskingRules: DEFAULT_MASKING_RULES,
  selectedTemplate: null,
  customPrompt: "",
  departmentName: "행정안전부 디지털정부국",
  authorName: "김행정 주무관",
  isGenerating: false,
  generatedReport: null,
  generationError: null,

  setStep: (step) => set({ currentStep: step }),

  setDataset: (dataset) => set({ dataset }),

  updateMaskingRule: (ruleId, enabled) =>
    set((state) => ({
      maskingRules: state.maskingRules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled } : rule
      ),
    })),

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),

  setDepartmentName: (dept) => set({ departmentName: dept }),

  setAuthorName: (author) => set({ authorName: author }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setGeneratedReport: (report) => set({ generatedReport: report, isGenerating: false }),

  setGenerationError: (error) => set({ generationError: error, isGenerating: false }),

  resetWizard: () =>
    set({
      currentStep: 1,
      dataset: null,
      selectedTemplate: null,
      customPrompt: "",
      generatedReport: null,
      generationError: null,
    }),
}));
