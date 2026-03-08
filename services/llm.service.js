import "../config/env.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { chunkText } from "./chunk.service.js";

export const summarizeText = async (text, language = "English") => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const chunks = chunkText(text, 8000);
  const partialSummaries = [];

  for (const chunk of chunks) {
    const result = await model.generateContent(buildPrompt(chunk, language));
    partialSummaries.push(result.response.text());
  }

  if (partialSummaries.length === 1) {
    return partialSummaries[0];
  }

  // Second pass summarization
  const final = await model.generateContent(
    buildPrompt(partialSummaries.join("\n\n"), language)
  );

  return final.response.text();
};

function buildPrompt(text, language) {
  return `
You are an expert YouTube transcript summarizer.

Rules:
- Only use provided text
- No hallucination
- Output language: ${language}
- Structured bullet points
- Provide TL;DR, Key Points, Conclusion

Transcript:
${text}
`;
}