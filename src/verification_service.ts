import { z } from "zod";
import { randomUUID } from "node:crypto";
import { infrai, type EmailResult } from "./infrai.js";

export const signupSchema = z.object({ email: z.string().email(), riskScore: z.number().min(0).max(1), userId: z.string().min(1) });
export type SignupRequest = z.infer<typeof signupSchema>;
export type VerificationDecision = { status: "verification_sent" | "manual_review"; messageId?: string; reason: string };

export async function handleSignup(input: unknown): Promise<VerificationDecision> {
  const request = signupSchema.parse(input);
  if (request.riskScore >= 0.7) return { status: "manual_review", reason: "risk threshold requires review" };
  const result: EmailResult = await infrai.email.send({
    to: request.email,
    subject: "Verify your fintech account",
    html: `<p>Confirm your email to activate user ${request.userId}.</p>`,
  }, `signup-verification-${request.userId}-${randomUUID()}`);
  return { status: "verification_sent", messageId: result.message_id, reason: "risk score is below the review threshold" };
}
