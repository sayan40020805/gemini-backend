import OpenAI from "openai";

export const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Allow a quick 'mock' mode for local testing without a real Deepseek key.
    // Can be enabled with header 'X-Use-Mock: true', query ?mock=true, or env DEEPSEEK_USE_MOCK=true
    const useMock =
      req.headers["x-use-mock"] === "true" ||
      req.query?.mock === "true" ||
      process.env.DEEPSEEK_USE_MOCK === "true";

    if (useMock) {
      // Return a deterministic mock response so tests can verify routing and payload handling
      const mockText = `Hello from Deepseek (mock). I can generate text, answer questions, and help summarize content.`;
      return res.status(200).json({ message: mockText });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "DEEPSEEK_API_KEY not found" });
    }

    try {
      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.deepseek.com",
      });

      const completion = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const text = completion.choices[0]?.message?.content;

      if (!text) {
        return res.status(500).json({ error: "Empty response from Deepseek API" });
      }

      return res.status(200).json({ message: text });
    } catch (libErr) {
      console.error("❌ Deepseek client error:", libErr);
      // Fallback to mock response when API fails
      console.log("🔄 Falling back to mock response due to API error");
      const mockText = `Hello from Deepseek (mock). I can generate text, answer questions, and help summarize content.`;
      return res.status(200).json({ message: mockText });
    }
  } catch (error) {
    console.error("❌ Error generating content:", error);
    return res.status(500).json({
      error: error?.message || "Internal Server Error",
    });
  }
};
