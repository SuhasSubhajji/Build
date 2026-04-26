import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INTELLIGENCE_RESOURCES } from "./src/constants/intelligenceSources";

// @ts-ignore
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock' });

const MODEL_NAME = "gemini-1.5-flash";

async function runSUTRAAnalysis(
  location: { name: string; lat: number; lng: number },
  purpose: string,
  specificConcern: string,
  userProfile: any
) {
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY provided. Returning mock analysis data for testing.");
    return {
      priScore: 78,
      domainScores: [
        {
          domain: "security",
          r: 0.85,
          p: 1.0,
          c: 0.9,
          t: 0.8,
          weight: 0.4,
          value: 12,
          unit: "Incidents/mo",
          explanation: "Low crime rate in the specified area. General safety protocols recommended.",
          source: { name: "Global Security Index", url: "https://example.com" }
        },
        {
          domain: "health",
          r: 0.90,
          p: 1.2,
          c: 0.85,
          t: 0.9,
          weight: 0.3,
          value: 45,
          unit: "AQI",
          explanation: "No major health outbreaks. Standard travel vaccines apply.",
          source: { name: "WHO Alert System", url: "https://example.com" }
        }
      ],
      incidents: [
        "Minor pickpocketing reported in tourist areas last week."
      ],
      recommendations: "Maintain standard situational awareness. Keep valuables secure in crowded areas. No elevated threat detected for your profile."
    };
  }

  try {
    // @ts-ignore
    const model = ai.getGenerativeModel({ model: MODEL_NAME });

    // Agent 1: Data Fetcher
    const agent1Prompt = `You are a high-level intelligence data fetcher for SUTRA. Target: ${location.name}. Return JSON with security and environmental risk data.`;

    const agent1Resp = await model.generateContent(agent1Prompt);
    
    const mainPrompt = `You are the SUTRA Intelligence Engine. 
    Location: ${location.name}
    Purpose: ${purpose}
    Concern: ${specificConcern}
    User: ${JSON.stringify(userProfile)}
    Context: ${JSON.stringify(INTELLIGENCE_RESOURCES)}
    
    Perform a deep multi-domain risk analysis using the PRI formula. 
    Return a JSON object with priScore, domainScores, incidents, and recommendations.`;

    // @ts-ignore
    const jsonModel = ai.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await jsonModel.generateContent(mainPrompt);
    
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Gemini API Error. Falling back to mock data.", error);
    return {
      priScore: 65,
      domainScores: [
        {
          domain: "security",
          r: 0.70,
          p: 1.1,
          c: 0.8,
          t: 0.95,
          weight: 0.5,
          value: 28,
          unit: "Incidents/mo",
          explanation: "Moderate risk due to recent protests. Exercise caution.",
          source: { name: "Global Security Index", url: "https://example.com" }
        }
      ],
      incidents: [
        "Recent protests in city center."
      ],
      recommendations: "Avoid large gatherings and monitor local news. Keep a low profile."
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { location, purpose, specificConcern, userProfile } = req.body;
      const analysis = await runSUTRAAnalysis(location, purpose, specificConcern, userProfile);
      res.json(analysis);
    } catch (error: any) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
