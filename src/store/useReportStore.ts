import { create } from "zustand";
import { ProcessedDataSet, ReportTemplate, GeneratedReport, MaskingRule } from "../types";
import { DEFAULT_MASKING_RULES, processDataSet } from "../utils/maskingEngine";

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
  addCustomMaskingRule: (newRule: Omit<MaskingRule, "id">) => void;
  removeMaskingRule: (ruleId: string) => void;
  setSelectedTemplate: (template: ReportTemplate) => void;
  setCustomPrompt: (prompt: string) => void;
  setDepartmentName: (dept: string) => void;
  setAuthorName: (author: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setGeneratedReport: (report: GeneratedReport | null) => void;
  setGenerationError: (error: string | null) => void;
  resetWizard: () => void;
}

export const useReportStore = create<ReportStoreState>((set, get) => ({
  currentStep: 1,
  dataset: null,
  maskingRules: DEFAULT_MASKING_RULES,
  selectedTemplate: null,
  customPrompt: "",
  departmentName: "부산광역시 디지털행정담당관",
  authorName: "김부산 주무관",
  isGenerating: false,
  generatedReport: null,
  generationError: null,

  setStep: (step) => set({ currentStep: step }),

  setDataset: (dataset) => set({ dataset }),

  updateMaskingRule: (ruleId, enabled) => {
    const updatedRules = get().maskingRules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled } : rule
    );
    const currentDataset = get().dataset;
    if (currentDataset && currentDataset.rawRows) {
      const reprocessed = processDataSet(
        currentDataset.rawRows,
        currentDataset.fileName,
        currentDataset.fileSize,
        updatedRules
      );
      set({ maskingRules: updatedRules, dataset: reprocessed });
    } else {
      set({ maskingRules: updatedRules });
    }
  },

  addCustomMaskingRule: (newRuleData) => {
    const id = `custom_${Date.now()}`;
    const newRule: MaskingRule = {
      ...newRuleData,
      id,
      isCustom: true,
      enabled: true,
    };
    const updatedRules = [...get().maskingRules, newRule];
    const currentDataset = get().dataset;
    if (currentDataset && currentDataset.rawRows) {
      const reprocessed = processDataSet(
        currentDataset.rawRows,
        currentDataset.fileName,
        currentDataset.fileSize,
        updatedRules
      );
      set({ maskingRules: updatedRules, dataset: reprocessed });
    } else {
      set({ maskingRules: updatedRules });
    }
  },

  removeMaskingRule: (ruleId) => {
    const updatedRules = get().maskingRules.filter((r) => r.id !== ruleId);
    const currentDataset = get().dataset;
    if (currentDataset && currentDataset.rawRows) {
      const reprocessed = processDataSet(
        currentDataset.rawRows,
        currentDataset.fileName,
        currentDataset.fileSize,
        updatedRules
      );
      set({ maskingRules: updatedRules, dataset: reprocessed });
    } else {
      set({ maskingRules: updatedRules });
    }
  },

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
