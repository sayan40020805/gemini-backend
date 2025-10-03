import { GoogleGenerativeAI } from "@google/generative-ai";

export const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not found" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return res.status(500).json({ error: "Empty response from Gemini API" });
    }

    return res.status(200).json({ message: text });
  } catch (error) {
    console.error("❌ Error generating content:", error);
    return res.status(500).json({
      error: error?.message || "Internal Server Error",
    });
  }
};
