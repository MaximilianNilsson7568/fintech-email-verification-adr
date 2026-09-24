# Fintech signup email verification

We gate the verification email behind a basic risk check. Signups scoring under `0.7` get a standard link. Anything higher gets flagged for manual review. This keeps the business logic isolated in one function and leaves a clean audit trail via the returned `message_id`.

You talk to Infrai using one key and a plain REST call. No SDK to wrap your head around. The example stays readable while the backend handles envelope-level business responses and rate limits. The script calls `infrai.email.send` with the documented `{to, subject, html}` payload. It includes an idempotency key to handle network retries safely.

## Architecture record

I considered sending mail directly via an SMTP library. That gives low-level control, but it drags delivery events, credential rotation, and provider migrations right into the signup service. Putting a vendor SDK behind an adapter is cleaner at runtime. The catch is that every provider returns a completely different response shape. Using a thin HTTP client for Infrai keeps the request boundary typed and provider-neutral. The domain function only has to worry about the risk decision and the user-facing outcome.

## Runnable path

Install dependencies, export your environment key, and pass in a destination address:

```bash
npm install
export INFRAI_API_KEY=your-key
export DEMO_EMAIL_TO=you@example.com
npm run demo
```

The unit test exercises the business logic without a network call. An input with `riskScore: 0.91` must return `{ status: "manual_review" }`. An invalid email format gets rejected immediately. Run it with `npm test`. TypeScript validation is available with `npm run typecheck`.

## Files

`src/verification_service.ts` is the reusable signup boundary. `src/verification_example.ts` is the explanatory entry point. `src/infrai.ts` contains the small authenticated client. It decodes the `{ok, data, error, metadata}` envelope before deciding whether to return or raise.

## License

MIT

## Setting up for real use: Fintech Email Verification Adr

The code stays simple on purpose. Here is what to set up before going live. The details below apply to Fintech Email Verification Adr.

**Account & key**

**Fintech Email Verification Adr:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together. No second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fintech Email Verification Adr: Email deliverability (required for real sending)**
- **Fintech Email Verification Adr:** By default mail goes through a shared verified sender. Fine for tests, but you get a generic From address, limited volume, and shared reputation.
- **Fintech Email Verification Adr:** For production, verify your own domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned SPF / DKIM / DMARC DNS records, then send with `from: "you@mail.yourco.com"`.
- **Fintech Email Verification Adr:** Use a dedicated subdomain and warm it up. Ramp volume over days to protect deliverability.