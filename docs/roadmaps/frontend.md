# Frontend roadmap

Baseline: 2026-10-23 · Source commit: `21ff26dcce02bfae7e158ceeab363b608a1500f9`

## Goal and tracking

Deliver a responsive storefront with working collection filters, a reliable purchase journey, and an admin workspace for orders, newsletter subscribers, and customer contact.

This is a source review, not a browser or production validation. **Present** means implementation exists; **Partial** means important behavior is missing; **Planned** means no complete implementation was found. Check a milestone only after its acceptance checks pass. P0 blocks a reliable or protected commerce workflow; P1 completes the requested experience; P2 improves maintainability and scale.

Related work: [Backend](backend.md) owns APIs, persistence, and delivery; [Libraries](lib.md) owns shared contracts and services. These are parts of one Next.js application, not separate deployed services.

## Current architecture

| Layer | Technology and responsibility | Evidence |
| --- | --- | --- |
| Routing and rendering | Next.js 16.2.7 App Router, React 19.2.4, TypeScript; server components load catalog/admin data directly through Prisma | `src/app/layout.tsx`, `src/app/[category]/page.tsx`, `src/app/admin/(protected)/page.tsx` |
| Presentation | Tailwind CSS 4; responsive grids, mobile navigation, cart drawer, product purchase sheet; Next Image and Google Fonts | `src/app/globals.css`, `src/components/Header.tsx`, `src/components/sections/productpage/MobilePurchaseBar.tsx` |
| Cart | Zustand 5 persisted browser state; Header renders the active cart and POSTs product IDs/quantities to checkout | `src/store/cartStore.tsx`, `src/components/Header.tsx` |
| Catalog | PostgreSQL-backed collection and product server pages, ingredient details, approved reviews | `src/app/[category]/page.tsx`, `src/app/[category]/[slug]/page.tsx` |
| Newsletter | React `useActionState` form → server action → unique subscriber email | `src/components/sections/footer/EmailCapture.tsx`, `src/app/actions/newsletter.ts` |
| Admin | Protected layout; dashboard, latest orders, printable packing slips, customer aggregation, analytics, product management | `src/app/admin/(protected)/` |

Current purchase flow: product → persisted cart → `/api/checkout` → hosted Stripe Checkout → configured `/success` redirect. No success page exists in this checkout. Admin screens depend on database orders that the current Stripe webhook does not write.

## Objective status

| Objective | Status | What exists and what remains |
| --- | --- | --- |
| Responsive brand/storefront pages | Present, unverified | Home/about sections, collection grid, responsive Header/Footer, mobile product sheet. Browser/device and accessibility checks remain. Mobile hero requests `heroMuted.mP4`, while the asset is `heroMuted.mp4`. |
| Collection filtering and sorting | Partial | Category query works; Filter button has no handler and sort select has no form/change behavior. Query always sorts by creation date. |
| Product detail and cart | Partial | Approved review display, ingredients, add/remove/quantity controls, persisted cart and checkout errors exist. Purchase components do not receive inventory; quantities are not capped in the store. |
| Completed purchase experience | Partial | Redirect to Stripe exists; `/success` page, confirmed-order display, and confirmed-purchase cart cleanup are missing. |
| Recent purchases in admin | Partial | Dashboard loads latest 5 orders; Orders loads latest 100 with items and stored label links. Payment-to-database integration is missing. |
| All newsletter signups in admin | Partial | Customers merges users, orders, and subscribers; supports search, newsletter filter, sort, 25-row pagination. Pagination builds `/admin/customer` instead of existing `/admin/customers`. |
| Contact customers by email/text | Planned | Contact fields are displayed, but no compose/send workflow or contact action links were found. Phone data alone is not SMS marketing consent. |
| Shipping fulfillment UI | Partial | Stored label/tracking display and packing-slip print page exist; no admin UI calls `/api/shippo` for rates or label purchase. |
| Reliable analytics UI | Partial | Rich dashboard queries exist, but event collection is disconnected; reports cannot yet establish a complete funnel. |

Product links currently use `/products/{slug}` while the page lives at `/[category]/[slug]` and queries only by slug. That URL can resolve through the dynamic route; it is a canonical/category consistency issue, not proof that every product link returns 404. Missing products currently render a message rather than invoking `notFound()`.

## Delivery milestones

### F1 — Reliable purchase journey · P0 · Partial

- [ ] **F1.1 Route and asset correctness.** Choose canonical `/{category}/{slug}` URLs; validate category/slug pairing, provide real 404s, repair the mobile hero filename, and audit linked privacy/terms routes. Accept: collection links and mobile video load; invalid products/categories return 404; required footer links resolve.
- [ ] **F1.2 Inventory-aware cart.** Pass stock into purchase controls and reconcile persisted cart items with server prices/availability. Accept: sold-out products cannot be added; quantity limits explain the remaining stock; server 409 responses offer recovery without losing the cart. Backend remains authoritative.
- [ ] **F1.3 Confirmed return from Stripe.** Add a success screen using a server-verified session/order lookup, a pending state for webhook delay, and safe confirmation-based cart cleanup. Accept: paid, delayed-webhook, canceled, failed, and manually entered return URLs behave correctly; a query parameter alone never proves payment. Depends on B1 and L3.
- [ ] **F1.4 Functional regression coverage.** Add browser coverage using Playwright (proposed; not installed) for collection → product → cart → Stripe test checkout → admin order visibility. Accept: a test payment produces one visible order; no live payment is required.

### F2 — Working collection discovery · P1 · Partial

- [ ] **F2.1 URL-backed filters and sort.** Add a small client filter panel using App Router navigation; read validated `searchParams` in the server page and translate them to Prisma `where`/`orderBy`. Initial filters: price range and in-stock; initial sort: price ascending/descending and newest. Define Featured explicitly or remove it until a ranking exists. Accept: combined filters change products/counts, invalid inputs have safe defaults, reload/back/share preserve state, and Clear resets it. Depends on L5.
- [ ] **F2.2 Mobile and accessible filter panel.** Use an accessible dialog/sheet on narrow screens with labeled controls, keyboard access, Escape, focus containment/return, applied filters, and a no-results state. Accept: keyboard and touch users can apply/remove multiple filters without losing context.
- [ ] **F2.3 Bounded result loading.** Add deterministic ordering and pagination when the catalog grows. Accept: filters/sort survive pagination and matching products are not silently omitted.

### F3 — Admin order and audience workspace · P1 · Partial

- [ ] **F3.1 Recent-purchase views.** Connect to persisted paid orders; show consistent payment and fulfillment states, customer, totals, items, and a packing-slip link. Add order search/status filters and pagination beyond the current 100-row limit. Accept: a webhook-created order appears on both dashboard and Orders with matching totals. Depends on B1/L3.
- [ ] **F3.2 Complete newsletter directory.** Repair `/admin/customers` pagination, preserve query/filter/sort, and test email normalization and merging. Show subscription state separately from purchase history. Accept: more than 25 subscribers remain reachable; newsletter-only contacts remain visible; duplicate identities are handled predictably. Depends on B4/L5.
- [ ] **F3.3 Customer contact controls.** Add individual email/text compose, recipient/channel selection, preview, explicit send, and delivery status. Show unavailable phone/permission states; add audience messaging only after individual sending works. Accept: selected eligible recipients match the send request; failures can be retried without duplicates; opted-out contacts cannot receive marketing. Depends on B4/L6. Provider and sender identity remain to be selected for SMS.
- [ ] **F3.4 Fulfillment controls.** Add parcel entry → rate selection → price confirmation → label purchase → print/tracking. Disable duplicate purchase while pending and allow re-opening an existing label. Accept: authorized staff can create one test label and reopen it after refresh. Depends on B3/L4.
- [ ] **F3.5 Trustworthy analytics presentation.** Surface metric definitions, reporting window/timezone, and unavailable data states; reconcile revenue with paid orders. Accept: a known browse/cart/purchase journey yields expected metrics. Depends on B2/L2.

### F4 — Responsive quality and maintainability · P2 · Partial

- [ ] **F4.1 Device/accessibility pass.** Validate at 375, 768, and 1440px; test menu/cart/product sheets for focus, scroll lock, close behavior, and overlapping fixed elements. Include loading/error/empty states and reduced-motion/media behavior. Accept: no unintended page overflow or unreachable purchase/contact actions.
- [ ] **F4.2 Remove competing implementations deliberately.** Confirm no callers before retiring the async client `sections/Cart.tsx`, legacy Dashboard, and helpers targeting absent category/product/review APIs. Keep Header as the active cart until replaced. Accept: one documented implementation per responsibility and no stale imports.
- [ ] **F4.3 Metadata and performance.** Replace placeholder page metadata, add product metadata, measure image/video/font loading and layout shift on representative devices. Accept: useful shared product previews and documented performance results.

## Progress log

| Date | Milestone | Change / evidence | Remaining blocker | Owner / PR |
| --- | --- | --- | --- | --- |
| 2026-10-23 | Baseline | Source inspection completed; roadmap created | No new browser validation; prior onboarding had Prisma/font network blockers | Unassigned |

For every update, change the status table, check only accepted milestones, and append a dated row with PR/commit and validation evidence. No percentage is assigned to unvalidated UI.
