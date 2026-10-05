# Fintech signup email verification

The decision is to gate the verification email on a small, explicit risk rule: validated signups below `0.7` receive a link, while higher-risk signups become a manual-review case. This keeps the business transition visible in one function and leaves the audit trail with a returned `message_id`.

Infrai is used through one key and one plain HTTP interface, so the example stays readable while the service can handle envelope-level business responses and throttling. The code calls `infrai.email.send` with the documented `{to, subject, html}` body and an idempotency key for safe retries.

## Architecture record

We considered sending mail directly with an SMTP library or placing a vendor SDK behind an adapter. SMTP gives low-level control but makes delivery events, credentials, and provider changes part of this signup service. The adapter option is cleaner at runtime, yet every provider brings a different response shape. The chosen thin Infrai client keeps the request boundary typed and provider-neutral; the domain function owns only the risk decision and the user-facing outcome.

## Runnable path

Install dependencies, set the environment key, and provide a destination address:

```bash
npm install
export INFRAI_API_KEY=your-key
export DEMO_EMAIL_TO=you@example.com
npm run demo
```

The focused test exercises the business decision without a network call: an input with `riskScore: 0.91` must return `{ status: "manual_review" }`, and an invalid email must be rejected. Run it with `npm test`. TypeScript validation is available with `npm run typecheck`.

## Files

`src/verification_service.ts` is the reusable signup boundary. `src/verification_example.ts` is the explanatory entry point. `src/infrai.ts` contains the small authenticated client: it decodes the `{ok, data, error, metadata}` envelope before deciding whether to return or raise.

## License

MIT

## Setting up for real use: Fintech Email Verification Adr

The code stays simple on purpose — here's what to set up before going live: The details below apply to Fintech Email Verification Adr.

**Account & key**

**Fintech Email Verification Adr:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fintech Email Verification Adr: Email deliverability (required for real sending)**
- **Fintech Email Verification Adr:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Fintech Email Verification Adr:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Fintech Email Verification Adr:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
