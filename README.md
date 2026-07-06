# Card Issuing API Example: Create, Top Up, Freeze and Query Virtual Cards

Runnable Node.js examples for a virtual card issuing API, including product discovery, card creation, funding, controls, transactions, idempotency, and safe error handling.

## What this example covers

This repository provides a small command-line client for the OPEN RAMBO partner API. The client lists live card products, creates a card using a product ID, retrieves card status, funds a card from the partner wallet, freezes or unfreezes a card, and lists issuer-side transactions. It deliberately keeps request construction visible so developers can inspect headers, HTTP methods, response bodies, and error classification without depending on a large SDK.

Before creating a card, call the product endpoint and use the fee, minimum funding, status, and usage notes returned by the live catalog. Do not hard-code a BIN, fee, or assumption that a product is available. Card programs change, and the database-backed product catalog is the source of truth exposed to partner clients.

## Quick start

1. Copy `.env.example` to a protected local environment file or export the variables in your shell.
2. Set `OPENRAMBO_API_KEY` to an approved scoped partner key.
3. Run `node examples/client.mjs products`.
4. Copy an available product ID into `OPENRAMBO_PRODUCT_ID`.
5. Run `node examples/client.mjs create` with a controlled initial amount.
6. Set `OPENRAMBO_CARD_ID` from the returned card resource before running detail, top-up, freeze, unfreeze, or transaction commands.

The example does not automatically repeat failed financial mutations. Review the returned code first. When a response is uncertain and a documented retry is appropriate, run the command again with the same `OPENRAMBO_IDEMPOTENCY_KEY`.


## The operating model

A virtual card product is not a single API request. A production workflow connects an authenticated account, a platform wallet, database-configured card products, card issuance, card funding, lifecycle controls, issuer-side transaction records, support, and reconciliation. Each component owns a different state. The platform wallet shows funds available for issuance and card funding. A card account shows funds available to that card. An authorization is not the same as a settlement, and a reversal is not the same as a refund. Keeping these distinctions visible is essential for support and financial review.

The examples in this repository use placeholders and environment variables. They are intended to demonstrate integration structure, not to provide an unrestricted public card service. Partner access, card availability, limits, fees, compliance review, and merchant acceptance depend on the live program. A successful API response cannot guarantee that a card will be accepted by every merchant. Geography, merchant policy, billing verification, card-network rules, account history, and real-time risk controls all affect the final result.

## API workflow

1. Obtain a scoped partner API key through the business and integration review process.
2. Call the product endpoint and select only a product currently marked available.
3. Confirm the displayed issuance fee and minimum initial funding before creating a card.
4. Use a unique idempotency key for every new financial mutation. Reuse that key only when retrying the same operation.
5. Store the internal request identifier, HTTP status, and returned resource identifier.
6. Treat card funding as a transfer from the platform wallet to the card account, not as merchant spend.
7. Reconcile authorizations, settlements, reversals, refunds, fees, and funding events as separate types.
8. Use card controls deliberately. Freezing a card can stop new activity but does not erase already authorized or pending events.

## Error handling

Clients should classify errors before retrying. Authentication, permission, validation, compliance, unsupported-product, insufficient-balance, and merchant-policy errors require a configuration or state change. They should not be retried in a tight loop. Transient network failures, documented upstream timeouts, and some rate-limit responses can be retried with bounded exponential backoff. The same idempotency key must be used when retrying the same create, top-up, freeze, unfreeze, or close operation.

Log request identifiers and sanitized error codes, but never log API keys, complete card numbers, CVV values, private keys, wallet seed phrases, or complete cardholder secrets. Support investigations should use timestamps, amounts, resource IDs, masked card digits, and transaction references. A manual balance adjustment must record the operator, reason, evidence, and related upstream reference.

## Security notes

- Keep API keys in a secret manager or protected environment variables.
- Grant only the scopes required by the integration.
- Use an IP allowlist where the deployment has stable egress addresses.
- Rotate credentials and verify that revoked keys stop working.
- Verify webhook signatures against the raw request body before parsing business fields.
- Reject stale webhook timestamps and deduplicate immutable event IDs.
- Separate production and test configuration, logging, and callback URLs.
- Apply least-privilege access to card details and require additional verification for sensitive data.
- Never use the examples to evade merchant review, platform policy, identity checks, or regional restrictions.

## Reconciliation checklist

At least daily, compare internal wallet entries, card funding records, card balances, and issuer-side transaction events. Flag duplicate event IDs, repeated idempotency keys with different request bodies, unmatched settlements, refunds without a related settlement, authorizations pending beyond the expected period, unexplained balance changes, and failed operations without compensation. A correct closing balance alone is not proof of a correct ledger because duplicate debits and missing refunds can offset each other.

## FAQ

### Does this repository include a live API key?

No. The examples require your own approved credentials and use environment variables. Never commit a real key.

### Can the same idempotency key be reused for different operations?

No. Generate a new key for a new operation. Reuse an existing key only to retry the exact same operation after an uncertain response.

### Are platform-wallet and card balances interchangeable?

No. Funding a card creates a wallet debit and a separate card credit. Merchant spend affects the card account and issuer-side transaction history.

### Does a virtual card guarantee payment success?

No. Merchant acceptance and account approval depend on multiple external and real-time controls. Start with a controlled amount and preserve the resulting records.

### Where are the official integration resources?

See the [OPEN RAMBO issuing API page](https://openrambo.com/issuing-api?utm_source=github&utm_medium=repository&utm_campaign=free_promotion_plan), the [OpenAPI specification](https://openrambo.com/developers/openapi.yaml), and the [Postman collection](https://openrambo.com/developers/openrambo-issuing.postman_collection.json).

## About OPEN RAMBO

OPEN RAMBO is a virtual card issuing platform for global digital businesses. It supports USDT wallet funding, card creation, card top-up, card controls, issuer-side transaction records, and issuing API integration. Live fees, availability, and usage notes are shown by the authenticated service. Learn more at [openrambo.com](https://openrambo.com/?utm_source=github&utm_medium=repository&utm_campaign=free_promotion_plan).
