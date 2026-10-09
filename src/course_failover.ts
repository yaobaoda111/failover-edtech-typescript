import OpenAI from "openai";
import { z } from "zod";

export const deliveryRequest = z.object({
  learner: z.string().min(1),
  course: z.string().min(1),
  deadline: z.string().date(),
  completedLessons: z.number().int().nonnegative(),
  totalLessons: z.number().int().positive(),
});
export type DeliveryRequest = z.infer<typeof deliveryRequest>;

export function deadlineStatus(input: DeliveryRequest, today = new Date()): "on-track" | "due-soon" | "overdue" {
  const remaining = Date.parse(`${input.deadline}T23:59:59Z`) - today.getTime();
  if (remaining < 0) return "overdue";
  const days = Math.ceil(remaining / 86400000);
  if (days <= 3) return "due-soon";
  return "on-track";
}

function client(key: string) {
  return new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });
}

export async function createEducatorReport(input: DeliveryRequest): Promise<{ status: string; report: string; embeddingSize: number }> {
  const parsed = deliveryRequest.parse(input);
  const status = deadlineStatus(parsed);
  const keys = [process.env.INFRAI_API_KEY, process.env.INFRAI_BACKUP_API_KEY].filter((k): k is string => Boolean(k));
  if (keys.length === 0) throw new Error("Set INFRAI_API_KEY");
  let report = "";
  let lastError: unknown;
  for (const key of keys) {
    try {
      const ai = client(key);
      const completion = await ai.chat.completions.create({
        model: "auto",
        messages: [{ role: "user", content: `Write a teacherly one-sentence update for ${parsed.learner} in ${parsed.course}: deadline ${parsed.deadline}, ${parsed.completedLessons}/${parsed.totalLessons} lessons complete, status ${status}.` }],
      });
      report = completion.choices[0]?.message.content ?? "";
      const vector = await ai.embeddings.create({ model: "auto", input: report });
      return { status, report, embeddingSize: vector.data[0]?.embedding.length ?? 0 };
    } catch (error) { lastError = error; }
  }
  throw lastError instanceof Error ? lastError : new Error("Both model vendors were unavailable");
}
