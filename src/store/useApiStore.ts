import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ApiProvider, ApiKeyConfig } from "../types";

interface ApiStoreState {
  activeProvider: ApiProvider;
  keys: Record<ApiProvider, ApiKeyConfig>;
  isModalOpen: boolean;

  // Actions
  setActiveProvider: (provider: ApiProvider) => void;
  setApiKey: (provider: ApiProvider, key: string, model?: string) => void;
  setSelectedModel: (provider: ApiProvider, model: string) => void;
  clearApiKey: (provider: ApiProvider) => void;
  setModalOpen: (open: boolean) => void;
  getActiveKeyConfig: () => ApiKeyConfig;
  getMaskedKey: (provider?: ApiProvider) => string;
  hasActiveKey: () => boolean;
  testKeyConnection: (provider: ApiProvider) => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_MODELS: Record<ApiProvider, string> = {
  google: "gemini-3.6-flash",
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-20241022",
  upstage: "solar-pro",
};

const INITIAL_KEYS: Record<ApiProvider, ApiKeyConfig> = {
  google: {
    provider: "google",
    apiKey: "",
    model: DEFAULT_MODELS.google,
    isSavedLocally: false,
  },
  openai: {
    provider: "openai",
    apiKey: "",
    model: DEFAULT_MODELS.openai,
    isSavedLocally: false,
  },
  anthropic: {
    provider: "anthropic",
    apiKey: "",
    model: DEFAULT_MODELS.anthropic,
    isSavedLocally: false,
  },
  upstage: {
    provider: "upstage",
    apiKey: "",
    model: DEFAULT_MODELS.upstage,
    isSavedLocally: false,
  },
};

export const useApiStore = create<ApiStoreState>()(
  persist(
    (set, get) => ({
      activeProvider: "google",
      keys: INITIAL_KEYS,
      isModalOpen: false,

      setActiveProvider: (provider: ApiProvider) => {
        set({ activeProvider: provider });
      },

      setApiKey: (provider: ApiProvider, apiKey: string, model?: string) => {
        const trimmedKey = apiKey.trim();
        set((state) => ({
          keys: {
            ...state.keys,
            [provider]: {
              ...state.keys[provider],
              apiKey: trimmedKey,
              model: model || state.keys[provider].model || DEFAULT_MODELS[provider],
              isSavedLocally: trimmedKey.length > 0,
              isValid: trimmedKey.length > 0 ? true : undefined,
            },
          },
        }));
      },

      setSelectedModel: (provider: ApiProvider, model: string) => {
        set((state) => ({
          keys: {
            ...state.keys,
            [provider]: {
              ...state.keys[provider],
              model,
            },
          },
        }));
      },

      clearApiKey: (provider: ApiProvider) => {
        set((state) => ({
          keys: {
            ...state.keys,
            [provider]: {
              ...state.keys[provider],
              apiKey: "",
              isSavedLocally: false,
              isValid: undefined,
              lastTestedAt: undefined,
            },
          },
        }));
      },

      setModalOpen: (open: boolean) => {
        set({ isModalOpen: open });
      },

      getActiveKeyConfig: () => {
        const state = get();
        return state.keys[state.activeProvider] || INITIAL_KEYS[state.activeProvider];
      },

      getMaskedKey: (provider?: ApiProvider) => {
        const state = get();
        const targetProvider = provider || state.activeProvider;
        const key = state.keys[targetProvider]?.apiKey;
        if (!key) return "설정된 키 없음";
        if (key.length <= 8) return "••••••••";
        return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
      },

      hasActiveKey: () => {
        const state = get();
        const activeConfig = state.keys[state.activeProvider];
        // Google can fallback to server environment key if empty
        if (state.activeProvider === "google") return true;
        return Boolean(activeConfig && activeConfig.apiKey.trim().length > 0);
      },

      testKeyConnection: async (provider: ApiProvider) => {
        const state = get();
        const targetConfig = state.keys[provider];
        const keyToTest = targetConfig.apiKey;

        if (!keyToTest && provider !== "google") {
          return { success: false, message: "테스트할 API Key가 입력되지 않았습니다." };
        }

        try {
          // Send request to test health
          const res = await fetch("/api/generate-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider,
              apiKey: keyToTest,
              model: targetConfig.model,
              prompt: "API 연동 테스트: '연동 성공' 메시지만 1문장으로 반환하세요.",
            }),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            set((prevState) => ({
              keys: {
                ...prevState.keys,
                [provider]: {
                  ...prevState.keys[provider],
                  isValid: true,
                  lastTestedAt: new Date().toLocaleTimeString("ko-KR"),
                },
              },
            }));
            return { success: true, message: "API Key 연결이 정상적으로 완료되었습니다." };
          } else {
            throw new Error(data.error || "연결 테스트 실패");
          }
        } catch (err: any) {
          set((prevState) => ({
            keys: {
              ...prevState.keys,
              [provider]: {
                ...prevState.keys[provider],
                isValid: false,
                lastTestedAt: new Date().toLocaleTimeString("ko-KR"),
              },
            },
          }));
          return { success: false, message: err.message || "연결 테스트 중 오류가 발생했습니다." };
        }
      },
    }),
    {
      name: "safereport-api-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeProvider: state.activeProvider,
        keys: state.keys,
      }),
    }
  )
);
