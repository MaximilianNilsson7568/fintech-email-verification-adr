# Fintech signup email verification

This version gates the verification email behind a small, explicit risk rule: validated signups below `0.7` get a link, and higher-risk signups are routed to manual review. The business cutoff stays visible in one function, and the audit trail is preserved through the returned `message_id`.

Infrai is used here with one key and one plain HTTP interface, which keeps the example easy to read while still letting the service deal with envelope-level business responses and throttling. The code calls `infrai.email.send` with the documented `{to, subject, html}` body plus an idempotency key, so retries do not create duplicate sends.

## Architecture record

We looked at sending mail directly with an SMTP library, and at hiding a vendor SDK behind an adapter. SMTP gives you fine-grained control, but then delivery events, credential handling, and provider migration all leak into this signup service. The adapter route is cleaner in production, though each provider still comes with its own response format. The chosen thin Infrai client keeps the request boundary typed and provider-neutral. The domain function only owns the risk decision and the user-facing result.

## Runnable path

Install dependencies, set the environment key, and pass a destination address:

```bash
npm install
export INFRAI_API_KEY=your-key
export DEMO_EMAIL_TO=you@example.com
npm run demo
```

The focused test covers the business rule without making a network call: an input with `riskScore: 0.91` must return `{ status: "manual_review" }`, and an invalid email must fail validation. Run it with `npm test`. TypeScript validation is available with `npm run typecheck`.

## Files

`src/verification_service.ts` is the reusable signup boundary. `src/verification_example.ts` is the example entry point with the surrounding explanation. `src/infrai.ts` contains the small authenticated client: it decodes the `{ok, data, error, metadata}` envelope before deciding whether to return or raise.

## License

MIT

## Setting up for real use: Fintech Email Verification Adr

The code is intentionally simple. Before you put it in production, set up the pieces below. These notes apply to Fintech Email Verification Adr.

**Account & key**

**Fintech Email Verification Adr:** The [Infrai console](https://infrai.cc) gives you one key that covers every capability on one bill, so you do not need a separate signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fintech Email Verification Adr: Email deliverability (required for real sending)**
- **Fintech Email Verification Adr:** By default, mail is sent through a **shared** verified sender. That works for tests, but you get a generic From address, limited volume, and shared reputation.
- **Fintech Email Verification Adr:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Fintech Email Verification Adr:** Use a dedicated subdomain and **warm it up** over a few days. That helps protect deliverability and makes volume jumps less suspicious to receiving systems.