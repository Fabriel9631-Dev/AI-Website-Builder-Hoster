import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateWebsiteCode(
  prompt: string,
  keywords: string,
  audience: string,
  feedback?: string,
  existingCode?: string
): Promise<string> {
  const systemInstruction = `You are an expert web developer. Generate a single-page website layout using Tailwind CSS classes.
  Include meta tags for SEO using the provided keywords and audience.
  Include placeholder content for 'About Us', 'Services', and 'Contact' sections.
  Use relevant placeholder images from https://picsum.photos/seed/{keyword}/{width}/{height}.
  If feedback is provided, modify the existing code based on that feedback.
  Return only the HTML code within a div.`;

  const userPrompt = feedback
    ? `Modify the existing website based on this feedback: ${feedback}. Original prompt: ${prompt}. Keywords: ${keywords}. Audience: ${audience}. Existing code: ${existingCode}`
    : `Generate a website for: ${prompt}. Keywords: ${keywords}. Audience: ${audience}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
    },
  });
  return response.text || "";
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
      },
    },
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return "";
}
