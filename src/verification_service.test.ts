import assert from "node:assert/strict";
import { handleSignup } from "./verification_service.js";

const reviewed = await handleSignup({ email: "person@example.com", riskScore: 0.91, userId: "u-9" });
assert.deepEqual(reviewed, { status: "manual_review", reason: "risk threshold requires review" });
await assert.rejects(() => handleSignup({ email: "bad", riskScore: 0.2, userId: "u-1" }));
console.log("verification decision test passed");
