import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Backend Gemini AI Proxy endpoint for SafeReport AI
  app.post("/api/generate-report", async (req, res) => {
    try {
      const { provider, apiKey, model, prompt, documentType } = req.body;

      // Determine API key to use: provided user key or server GEMINI_API_KEY
      const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;

      if (provider === "google" || !provider) {
        if (!effectiveApiKey) {
          return res.status(400).json({
            error: "Gemini API 키가 설정되지 않았습니다. 헤더의 [AI API 설정]에서 API Key를 입력하거나 process.env.GEMINI_API_KEY를 확인하세요.",
          });
        }

        const ai = new GoogleGenAI({
          apiKey: effectiveApiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const selectedModel = model || "gemini-3.6-flash";

        const systemInstruction = `당신은 대한민국 공공기관 행정 데이터 분석 및 공문서/보고서 작성 전문 AI 아키텍트입니다.
공무원이 제공한 비식별화된 데이터를 바탕으로 표준 공공기관 보고서 서식(HWP 스타일)을 생성합니다.
비전문가도 직관적으로 이해할 수 있는 명확하고 격식 있는 평이한 행정 용어로 작성하세요.

반드시 다음 공공 보고서 규칙을 준수하여 작성하세요:
1. 📊 [현황요약]: 핵심 데이터 및 실적 현황을 명확하게 2문장으로 요약
2. 🚨 [주요특이사항]: 특이 패턴, 집중 발생 구간, 이상 징후 또는 핵심 수치 3가지 명시
3. 💡 [권고조치]: 담당 공무원이 즉시 시행할 수 있는 구체적인 행정/정책 권고조치 2가지 제시
4. 문서 가독성을 높이기 위해 개조식 (1., 가., 1), - ) 표기와 이모지 아이콘을 적절히 활용
5. 표(Table) 형태의 통계 수치 및 요약 상자를 포함하여 공문서 양식 구조로 정돈하세요.`;

        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        return res.json({
          success: true,
          reportText: response.text,
          provider: "google",
          model: selectedModel,
        });
      } else if (provider === "openai") {
        // Direct call using fetch to OpenAI endpoint using user BYOK
        if (!apiKey) {
          return res.status(400).json({ error: "OpenAI API 키가 필요합니다." });
        }
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model || "gpt-4o",
            messages: [
              {
                role: "system",
                content: "당신은 대한민국 공공기관 행정 데이터 분석 및 공문서 작성 AI입니다.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
          }),
        });

        const openAiData = await openAiRes.json();
        if (!openAiRes.ok) {
          throw new Error(openAiData.error?.message || "OpenAI API 호출 실패");
        }

        return res.json({
          success: true,
          reportText: openAiData.choices?.[0]?.message?.content || "",
          provider: "openai",
          model: model || "gpt-4o",
        });
      } else if (provider === "anthropic") {
        if (!apiKey) {
          return res.status(400).json({ error: "Anthropic API 키가 필요합니다." });
        }
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: model || "claude-3-5-sonnet-20241022",
            max_tokens: 4000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const anthropicData = await anthropicRes.json();
        if (!anthropicRes.ok) {
          throw new Error(anthropicData.error?.message || "Anthropic API 호출 실패");
        }

        return res.json({
          success: true,
          reportText: anthropicData.content?.[0]?.text || "",
          provider: "anthropic",
          model: model || "claude-3-5-sonnet-20241022",
        });
      } else if (provider === "upstage") {
        if (!apiKey) {
          return res.status(400).json({ error: "Upstage Solar API 키가 필요합니다." });
        }
        const upstageRes = await fetch("https://api.upstage.ai/v1/solar/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model || "solar-pro",
            messages: [
              {
                role: "system",
                content: "당신은 대한민국 공공행정 문서 및 데이터 분석 전문가 AI입니다.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
          }),
        });

        const upstageData = await upstageRes.json();
        if (!upstageRes.ok) {
          throw new Error(upstageData.error?.message || "Upstage Solar API 호출 실패");
        }

        return res.json({
          success: true,
          reportText: upstageData.choices?.[0]?.message?.content || "",
          provider: "upstage",
          model: model || "solar-pro",
        });
      } else {
        return res.status(400).json({ error: "지원되지 않는 LLM 제공자입니다." });
      }
    } catch (error: any) {
      console.error("Report Generation API Error:", error);
      res.status(500).json({ error: error.message || "보고서 생성 중 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SafeReport AI] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
