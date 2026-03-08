import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export async function generateWebsiteCodeCollaborative(
  prompt: string,
  keywords: string,
  audience: string,
  longThinking: boolean,
  fastMode: boolean,
  persona: string,
  codeStyle: string,
  feedback?: string,
  existingCode?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const systemInstruction = `You are an expert web developer. Generate a single-page website layout using Tailwind CSS classes.
  Persona: ${persona}.
  Code Style: ${codeStyle}.
  Include meta tags for SEO using the provided keywords and audience.
  Include placeholder content for 'About Us', 'Services', and 'Contact' sections.
  Use relevant placeholder images from https://picsum.photos/seed/{keyword}/{width}/{height}.
  Include a sitemap structure in the footer.
  Include a placeholder for Google Analytics script.
  If feedback is provided, modify the existing code based on that feedback.
  Return only the HTML code within a div.`;

  const userPrompt = feedback
    ? `Modify the existing website based on this feedback: ${feedback}. Original prompt: ${prompt}. Keywords: ${keywords}. Audience: ${audience}. Existing code: ${existingCode}`
    : `Generate a website for: ${prompt}. Keywords: ${keywords}. Audience: ${audience}.`;

  const thinkingConfig = fastMode 
    ? { thinkingLevel: ThinkingLevel.LOW } 
    : (longThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined);

  const modelName = fastMode ? "gemini-3-flash-preview" : "gemini-3.1-flash-lite-preview";

  // If fast mode, use single model for speed
  if (fastMode) {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: { systemInstruction, thinkingConfig },
    });
    return response.text || "";
  }

  // Otherwise, collaborative generation
  const [res1, res2] = await Promise.all([
    ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: userPrompt,
      config: { systemInstruction, thinkingConfig },
    }),
    ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: userPrompt,
      config: { systemInstruction, thinkingConfig },
    }),
  ]);

  return res1.text || res2.text || "";
}

export async function generateImage(prompt: string): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&nologo=true`;
}
