import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

export const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not found in .env" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const tools = [{ googleSearch: {} }];

    const config = {
      thinkingConfig: { thinkingBudget: -1 },
      tools,
      responseMimeType: "text/plain",
    };

    const contents = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-pro",
      config,
      contents,
    });

    let finalText = "";

    for await (const chunk of response) {
      if (chunk?.text) {
        finalText += chunk.text;
      }
    }

    if (!finalText) {
      return res.status(500).json({ error: "Empty response from Gemini API" });
    }

    return res.status(200).json({ message: finalText }); // <- match frontend `res.data.message`
  } catch (error) {
    console.error("❌ Error generating content:", error);
    return res.status(500).json({
      error: error?.message || "Internal Server Error",
    });
  }
};