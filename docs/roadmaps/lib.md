# Shared libraries roadmap

Baseline: 2026-10-23 · Source commit: `21ff26dcce02bfae7e158ceeab363b608a1500f9`

## Goal and tracking

Give the [frontend](frontend.md) and [backend](backend.md) a consistent foundation for database access, admin authorization, analytics identity, payments, shipping and customer communication. Existing code lives in `src/lib`; proposed services below are an incremental design, not files already implemented.

**Present** = implementation found; **Partial** = incomplete contract/integration; **Planned** = proposed. P0 protects correctness and authorization, P1 supports requested capabilities, P2 reduces maintenance/operational cost. All milestone boxes remain open until their acceptance checks have evidence. This roadmap is based on source inspection, not new runtime tests.

## Existing library inventory

| File | Responsibility / technology | Status and limits |
| --- | --- | --- |
| `src/lib/prisma.ts` | Generated Prisma 7 client with `@prisma/adapter-pg` and PostgreSQL connection string | Present. Client is created at module evaluation; no explicit development hot-reload singleton or central configuration validation. Generated client is ignored and must be produced by setup. |
| `src/lib/stripe.ts` | Stripe 22 SDK instance | Partial. Initialized at import using a non-null assertion on `STRIPE_SECRET_KEY`; missing configuration can fail module loading. Webhook and shipping routes instantiate their own Stripe clients. |
| `src/lib/admin-auth.ts` | `jose` HS256 JWT creation/verification, Next cookies, redirect guard | Partial. HttpOnly/SameSite cookie, production Secure flag and 8-hour expiration exist. Guard is used by protected layout, not current product actions or Shippo endpoint. No shared API-oriented unauthorized response or role/user model beyond a shared admin role. |
| `src/lib/analytics/getVisitor.ts` | Resolve visitor cookie through Prisma | Present. Returns null before initialization; does not coordinate client events or establish a canonical ingestion contract. |
| `src/lib/analytics/session.ts` | Reuse visitor-owned session within 30-minute inactivity; close expired session and create a new one | Partial. Checks visitor ownership and refreshes activity; creates sessions without source/medium/campaign/referrer/landingPage and has no concurrent-initialization strategy. |

Related shared state/helpers outside `lib`: `src/store/cartStore.tsx` is persisted Zustand browser state; `src/components/AnalyticsTracker.tsx` exports an untyped-by-contract event sender; category/product helpers target absent APIs and have no discovered callers. `src/components/utils.tsx` is currently empty. Admin pages duplicate formatting and successful-order status lists. Do not treat browser cart prices or client analytics as payment authority.

## Architecture boundaries

| Proposed module | Owns | Callers and contracts |
| --- | --- | --- |
| `lib/config.ts` and provider factories | Validate required settings when a capability is invoked; construct server-only clients | Checkout/webhooks/shipping/messaging receive typed configuration outcomes; optional service absence does not crash unrelated pages. |
| `lib/auth/` (or expanded `admin-auth.ts`) | Session verification plus action/API guards | Every protected read/mutation checks authorization at its entry point; redirect for pages and explicit unauthorized response for APIs. |
| `lib/analytics/` | Shared event types, validated payloads, identity/session attribution | Browser imports only safe event types/constants; server-only modules own cookies/database writes. |
| `lib/orders/` | Checkout snapshots, totals/status rules, fulfillment transactions and idempotency | Checkout and webhook call the same domain operations; admin reads the same status semantics. |
| `lib/shipping/` | Typed Shippo adapter, parcel/rate validation and label-attempt reconciliation | Backend owns purchase and persistence; frontend receives safe rate/label DTOs. |
| `lib/catalog/`, `lib/customers/` | Query contracts, product URLs/filter parsing, contact normalization and bounded audience queries | Server pages/actions share validated inputs without importing database/client secrets into browser bundles. |
| `lib/messaging/` | Resend/SMS adapters, eligibility, templates, message ledger/outbox | Authorized backend endpoints request sends; workers handle retry/delivery; admin sees safe delivery state. |
| `lib/format.ts` | Pure money/date formatting with explicit currency/timezone | Storefront/admin share display utilities; accounting and price authority remain server-side. |

Use `server-only` boundaries for secrets/database/provider modules where appropriate. Keep pure browser-safe contracts separate. Prefer a small extraction when a milestone needs it rather than introducing every module in advance. No additional backend framework is required by this design.

## Delivery milestones

### L1 — Configuration, database and authorization · P0 · Partial

- [ ] **L1.1 Database lifecycle.** Adopt a development-safe Prisma client lifecycle and validate database configuration without exposing values. Preserve generated-client output conventions. Accept: repeated development reloads do not accumulate unintended pools; missing database settings produce a useful diagnostic; production queries still work. Supports all backend milestones.
- [ ] **L1.2 Capability-scoped configuration.** Replace import-time Stripe initialization with a shared lazy factory and explicit unavailable-service errors; reuse it across checkout/webhook/shipping. Centralize required/optional names and safe diagnostics. Accept: a missing payment key does not crash catalog/admin module loading; calling checkout returns a controlled unavailable result; secrets never reach client bundles/logs.
- [ ] **L1.3 Shared authorization guards.** Separate cookie verification from redirect behavior; provide page/action/API entry-point helpers and apply them to product actions and shipping. Remove login debug output about entered/password matching and add a login throttling strategy. Accept: valid, absent, tampered and expired sessions have explicit results; unauthorized direct mutations never reach Prisma/provider calls. Coordinates B0.

### L2 — Analytics identity and event contract · P1 · Partial

- [ ] **L2.1 One typed event vocabulary.** Share allowlisted event names and payload contracts, including top-level product identity and bounded metadata; distinguish browser engagement events from trusted server purchase events. Resolve `NEWSLETTER_CLICK` versus schema-supported `NEWSLETTER_SIGNUP`. Accept: invalid types are rejected and valid clients compile against the same contract. Coordinates B2/F3.5.
- [ ] **L2.2 Session and attribution service.** Capture validated first-touch UTM/referrer/landing information; define initialization ordering and deduplication; preserve visitor ownership and 30-minute inactivity behavior. Accept: new, active, expired, foreign-session and concurrent-init cases have meaningful tests; attribution survives checkout linkage.
- [ ] **L2.3 Trustworthy recording helpers.** Add server helpers for purchase/signup events within the relevant durable workflow, avoiding duplicate events on webhook retry or duplicate signup. Accept: replayed completion does not inflate conversion metrics; a rejected signup does not count as a successful signup.

### L3 — Orders and money contracts · P0 · Planned

- [ ] **L3.1 Standardize commerce types.** Define order/payment/fulfillment states, currency and integer minor-unit amounts, product snapshots, and success predicates. Replace repeated status arrays after choosing canonical states and accounting for existing data. Accept: dashboard/customer/analytics revenue use the same paid/refund rules and known fixtures agree. Coordinates B1/F3.1.
- [ ] **L3.2 Transactional fulfillment service.** Extract signature-verified event processing into an idempotent order operation with unique event/session keys, inventory concurrency protection, user/visitor/session links and persisted address. Use Prisma transactions only for local state; use durable attempts/outbox for external side effects. Accept: concurrent/replayed events cannot double-create orders, decrement stock twice, or enqueue duplicate confirmations.
- [ ] **L3.3 Safe checkout and lookup DTOs.** Share cart validation, typed errors and public confirmation shapes without trusting client prices or exposing arbitrary customers' session data. Accept: malformed cart, unknown product, excessive stock request and unauthorized confirmation lookup have deliberate outcomes; frontend can render pending/paid/error states safely.

### L4 — Shipping service and provider adapter · P1 · Planned

- [ ] **L4.1 Replace provider `any` types.** Define and validate Shippo shipment/rate/transaction responses; centralize parcel units, HTTP timeout/error mapping and decimal-to-minor-unit cost conversion. The installed Shippo SDK is not currently used by the route, which calls REST directly; choose one supported adapter. Accept: malformed/failed provider responses become typed outcomes rather than property-access errors. Coordinates B3.
- [ ] **L4.2 Order-bound label operations.** Expose getRates(order, parcel), purchaseLabel(attempt), and reconcileAttempt semantics with authorized callers and persisted provider identifiers. Accept: a timeout after remote purchase reconciles before another purchase; staff can retrieve an existing label after refresh. Provider idempotency capabilities must be confirmed rather than assumed.
- [ ] **L4.3 Label/tracking DTOs.** Keep packing slips, purchased postage, payment status and shipment tracking distinct; validate safe provider URLs before rendering. Accept: frontend receives only fields needed for rates, printing and tracking; provider errors do not leak raw customer data.

### L5 — Catalog and audience query contracts · P1 · Partial

- [ ] **L5.1 Collection filter parser.** Define allowed sort keys, price range and availability inputs; produce Prisma predicates server-side and serializable URL state client-side. Keep deterministic ordering. Accept: valid filter combinations match fixtures; invalid/range-reversed values have documented defaults; frontend controls and server queries agree. Coordinates F2.
- [ ] **L5.2 Product URL and shared display helpers.** Choose one category/slug URL builder and money/date formatting policy. Replace inconsistent links and repeated formatting as touched. Accept: all audited product links follow canonical routes and cents/currency/timezone display consistently.
- [ ] **L5.3 Customer identity and query service.** Extract normalized email/phone matching and user/order/subscriber aggregation; define duplicate/conflicting identity handling and pagination semantics. Accept: a subscriber who later purchases is represented correctly; newsletter-only and phone-only records remain visible; every page is reachable. Coordinates F3.2/B4.4.

### L6 — Email/text delivery foundation · P1 · Planned

- [ ] **L6.1 Provider-neutral message contract.** Define channel, purpose (transactional/marketing), recipient eligibility, template/content, delivery ID/status and idempotency key. Reuse Resend for email; choose an SMS provider separately. Accept: customer endpoints cannot bypass channel permission/suppression by choosing a different template. Coordinates B4/F3.3.
- [ ] **L6.2 Durable delivery and retry.** Add message/outbox records and provider adapters; record failures/delivery updates with bounded retry and reconciliation. Extract owner order email HTML into a reusable escaped template. Accept: retries do not send duplicate completed messages; order persistence survives provider downtime; status callbacks update the correct message.
- [ ] **L6.3 Subscription/opt-out helpers.** Model channel-specific consent evidence, suppression and unsubscribe, validate provider callbacks and re-check eligibility when queued messages execute. Accept: a contact opting out after enqueue is excluded from marketing delivery; purchase contact information alone does not grant marketing permission.

### L7 — Verification and cleanup · P2 · Planned

- [ ] **L7.1 Focused tests.** Select a TypeScript-compatible runner and PostgreSQL integration fixtures; cover session expiry/ownership, money/filter parsing, identity merging, auth denial, webhook concurrency and delivery deduplication. Use stubs or provider test mode; avoid live payments/postage/messages. No test runner or test script is declared currently.
- [ ] **L7.2 Remove stale paths after caller audit.** Consolidate absent-API helpers, competing cart/dashboard implementations and duplicated provider initialization when their replacements are accepted. Accept: imports/build/type checks pass and documented architecture matches actual call sites.
- [ ] **L7.3 Safe diagnostics.** Log structured operation/order/provider IDs and classified failures; redact credentials, full addresses and message bodies. Accept: a failed payment/label/send can be traced without exposing customer content.

## Progress log

| Date | Milestone | Change / evidence | Remaining blocker | Owner / PR |
| --- | --- | --- | --- | --- |
| 2026-10-23 | Baseline | All current `src/lib` modules and their principal callers reviewed | Shared order/shipping/messaging services not yet implemented; no new runtime validation | Unassigned |

Keep this inventory and the relevant milestone synchronized with implementation PRs. Record test names/results and commit/PR links before checking acceptance boxes. Prior onboarding failures are described in the backend roadmap; they are not substituted for current validation.
