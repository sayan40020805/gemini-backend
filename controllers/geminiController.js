import { GoogleGenerativeAI } from "@google/generative-ai";

export const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Allow a quick 'mock' mode for local testing without a real Gemini key.
    // Can be enabled with header 'X-Use-Mock: true', query ?mock=true, or env GEMINI_USE_MOCK=true
    const useMock =
      req.headers["x-use-mock"] === "true" ||
      req.query?.mock === "true" ||
      process.env.GEMINI_USE_MOCK === "true";

    if (useMock) {
      // Return a deterministic mock response so tests can verify routing and payload handling
      const mockText = `Hello from Gemini (mock). I can generate text, answer questions, and help summarize content.`;
      return res.status(200).json({ message: mockText });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not found" });
    }

    try {
      // Try different constructor shapes (library versions vary).
      let genAI;
      try {
        genAI = new GoogleGenerativeAI({ apiKey });
      } catch (e) {
        // Fallback to older/newer shape
        genAI = new GoogleGenerativeAI(apiKey);
      }

      // Attempt to obtain a model using a few common method names
      const getModelCandidates = [
        (g) => g.getGenerativeModel && g.getGenerativeModel({ model: "gemini-1.5-flash" }),
        (g) => g.getModel && g.getModel("gemini-1.5-flash"),
      ];

      let model = null;
      for (const fn of getModelCandidates) {
        try {
          model = fn(genAI);
          if (model) break;
        } catch (err) {
          // ignore and try next
        }
      }

      if (!model || typeof model.generateContent !== "function") {
        throw new Error(
          "Incompatible Google Generative AI client: required methods not found. Check package/version and usage docs."
        );
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = typeof response.text === "function" ? response.text() : String(response);

      if (!text) {
        return res.status(500).json({ error: "Empty response from Gemini API" });
      }

      return res.status(200).json({ message: text });
    } catch (libErr) {
      console.error("❌ Gemini client error:", libErr);
      // Return 502 to indicate upstream dependency problem and include a concise hint
      return res.status(502).json({
        error: "Gemini client error",
        detail: libErr?.message || String(libErr),
      });
    }
  } catch (error) {
    console.error("❌ Error generating content:", error);
    return res.status(500).json({
      error: error?.message || "Internal Server Error",
    });
  }
};
