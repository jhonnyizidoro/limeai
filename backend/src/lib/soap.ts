import OpenAI from "openai";

import env from "../env.ts";

const openai = new OpenAI({ apiKey: env.openAiKey });

const SYSTEM_PROMPT = `You are a clinical documentation assistant. Convert the raw clinical note into a structured SOAP note.

Format your response exactly as:
S (Subjective): <patient's symptoms and complaints in their own words>
O (Objective): <measurable findings, vitals, observations>
A (Assessment): <diagnosis or clinical impression>
P (Plan): <treatment plan, medications, follow-up>

Be concise. If information for a section is not present in the note, write "Not documented."`;

export async function structureAsSOAP(rawText: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: rawText },
    ],
  });

  return response.choices[0]?.message.content ?? rawText;
}
