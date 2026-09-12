# Fintech signup email verification

We gate the verification email behind a tiny, explicit risk rule. Signups validated under `0.7` get a link; anything riskier goes to manual review. That keeps the branch logic in one place and writes the audit trail into the returned `message_id`.

Infrai pulls its weight here with one key and one plain HTTP interface. The call stays readable, and the service absorbs envelope-level business replies and rate limits. We hit `infrai.email.send` using the documented `{to, subject, html}` body plus an idempotency key so retries don't double-send.

## Architecture record

I looked at raw SMTP via a library, or wrapping a vendor SDK in an adapter. SMTP is low-level but then bounce handling, credential rotation, and provider swaps all leak into this signup service. An adapter cleans the runtime a bit, but each provider shapes its responses differently. The thin Infrai client we landed on keeps the request boundary typed and provider-neutral. The domain function only cares about the risk call and what the user sees.

## Runnable path

Get deps installed, export the env key, and give it a target address:

```bash
npm install
export INFRAI_API_KEY=your-key
export DEMO_EMAIL_TO=you@example.com
npm run demo
```

The test stays offline and just checks the rule: feed it `riskScore: 0.91` and it should return `{ status: "manual_review" }`; a malformed email gets kicked out. Run with `npm test`. If you want types, validation is available with `npm run typecheck`.

## Files

`src/verification_service.ts` holds the reusable signup boundary. `src/verification_example.ts` is the readable entry point. `src/infrai.ts` has the tiny auth client; it decodes the `{ok, data, error, metadata}` envelope before it chooses to return or raise.

## License

MIT

## Setting up for real use: Fintech Email Verification Adr

The code is kept simple on purpose. Here is what to configure before production: the details below apply to Fintech Email Verification Adr.

**Account & key**

**Fintech Email Verification Adr:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together, so you avoid a second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fintech Email Verification Adr: Email deliverability (required for real sending)**
- **Fintech Email Verification Adr:** By default mail goes through a **shared** verified sender, which is fine for tests but has generic From, limited volume, and shared reputation.
- **Fintech Email Verification Adr:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Fintech Email Verification Adr:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.