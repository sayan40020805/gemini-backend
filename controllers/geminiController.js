export const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Allow a quick 'mock' mode for local testing without a real API key.
    // Can be enabled with header 'X-Use-Mock: true', query ?mock=true, or env APIREELLM_USE_MOCK=true
    const useMock =
      req.headers["x-use-mock"] === "true" ||
      req.query?.mock === "true" ||
      process.env.APIREELLM_USE_MOCK === "true";

    if (useMock) {
      // Return a mock response based on the prompt
      const mockText = `Mock response to "${prompt}": Hello! This is a simulated response from apifreellm AI. In a real scenario, I would provide a detailed answer to your question.`;
      return res.status(200).json({ message: mockText });
    }

    try {
      const response = await fetch('https://apifreellm.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt })
      });

      const data = await response.json();

      if (data.status === 'success') {
        return res.status(200).json({ message: data.response });
      } else {
        console.error("❌ apifreellm API error:", data.error);
        // Fallback to mock response when API fails
        console.log("🔄 Falling back to mock response due to API error");
        const mockText = `Mock response to "${prompt}": Hello! This is a simulated response from apifreellm AI. In a real scenario, I would provide a detailed answer to your question.`;
        return res.status(200).json({ message: mockText });
      }
    } catch (apiErr) {
      console.error("❌ apifreellm client error:", apiErr);
      // Fallback to mock response when API fails
      console.log("🔄 Falling back to mock response due to API error");
      const mockText = `Mock response to "${prompt}": Hello! This is a simulated response from apifreellm AI. In a real scenario, I would provide a detailed answer to your question.`;
      return res.status(200).json({ message: mockText });
    }
  } catch (error) {
    console.error("❌ Error generating content:", error);
    return res.status(500).json({
      error: error?.message || "Internal Server Error",
    });
  }
};
