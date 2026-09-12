import { handleSignup } from "./verification_service.js";

const email = process.env.DEMO_EMAIL_TO;
if (!email) throw new Error("DEMO_EMAIL_TO is required");
const decision = await handleSignup({ email, riskScore: 0.18, userId: "demo-user" });
console.log(decision);
