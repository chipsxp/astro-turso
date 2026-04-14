# Etsy Open API v3 Reference Index

Purpose: quick navigation map for agent coders using the full scraped reference.
Primary source file: [etsy-open-api-v3-reference-scrape.md](etsy-open-api-v3-reference-scrape.md)

Notes:

- Local links below jump to the scraped file line anchors for faster investigation.
- Source links point to Etsy docs pages directly.
- If the scrape file is regenerated, line anchors may shift.

## Core Essentials

- Overview: [Scrape overview](etsy-open-api-v3-reference-scrape.md#L36) | Source: https://developers.etsy.com/documentation/
- Authentication (OAuth2 + PKCE): [Auth section](etsy-open-api-v3-reference-scrape.md#L163) | Source: https://developers.etsy.com/documentation/essentials/oauth2/
- Auth step 1 (authorization code): [Step 1](etsy-open-api-v3-reference-scrape.md#L183)
- Auth step 2 (grant access): [Step 2](etsy-open-api-v3-reference-scrape.md#L209)
- Auth step 3 (token exchange): [Step 3](etsy-open-api-v3-reference-scrape.md#L237)
- Request standards: [Request standards](etsy-open-api-v3-reference-scrape.md#L524) | Source: https://developers.etsy.com/documentation/essentials/requests
- URL syntax and pagination: [URL syntax](etsy-open-api-v3-reference-scrape.md#L613) | Source: https://developers.etsy.com/documentation/essentials/urlsyntax
- Definitions (states, money object, order status): [Definitions](etsy-open-api-v3-reference-scrape.md#L85) | Source: https://developers.etsy.com/documentation/essentials/definitions
- Rate limits: [Rate limits](etsy-open-api-v3-reference-scrape.md#L413) | Source: https://developers.etsy.com/documentation/essentials/rate-limits
- Webhooks: [Webhooks](etsy-open-api-v3-reference-scrape.md#L672) | Source: https://developers.etsy.com/documentation/essentials/webhooks
- Full API reference dump: [Reference section](etsy-open-api-v3-reference-scrape.md#L990) | Source: https://developers.etsy.com/documentation/reference/

## Feature-Oriented Shortcuts

- Listings lifecycle and inventory: [Listings tutorial](etsy-open-api-v3-reference-scrape.md#L2367) | Source: https://developers.etsy.com/documentation/tutorials/listings
- Listing state model: [Listing lifecycle and state](etsy-open-api-v3-reference-scrape.md#L2387)
- Inventory updates: [Updating inventory](etsy-open-api-v3-reference-scrape.md#L2509)
- Variation handling: [Handling variations](etsy-open-api-v3-reference-scrape.md#L2536)
- Custom variations: [Custom variations](etsy-open-api-v3-reference-scrape.md#L2560)
- Shop setup and management: [Shop management tutorial](etsy-open-api-v3-reference-scrape.md#L3711) | Source: https://developers.etsy.com/documentation/tutorials/shopmanagement
- Payments and transaction flow: [Payments tutorial](etsy-open-api-v3-reference-scrape.md#L2927) | Source: https://developers.etsy.com/documentation/tutorials/payments
- Fulfillment and shipping: [Fulfillment tutorial](etsy-open-api-v3-reference-scrape.md#L1852) | Source: https://developers.etsy.com/documentation/tutorials/fulfillment
- Shipping carriers and tracking: [Carrier tracking details](etsy-open-api-v3-reference-scrape.md#L1897)

## Personalization Migration Cluster

- Migration overview: [Multi personalization migration guide](etsy-open-api-v3-reference-scrape.md#L3002) | Source: https://developers.etsy.com/documentation/tutorials/personalization-migration
- Timeline: [Timeline](etsy-open-api-v3-reference-scrape.md#L3040)
- Integration stages: [Integration stages](etsy-open-api-v3-reference-scrape.md#L3044)
- Endpoint migration path: [Endpoint migration](etsy-open-api-v3-reference-scrape.md#L3068) | Source: https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration
- Endpoint migration examples: [Endpoint migration examples](etsy-open-api-v3-reference-scrape.md#L3176)
- Multiple + new question type support: [New question types](etsy-open-api-v3-reference-scrape.md#L3249)
- New question type examples: [Support period examples](etsy-open-api-v3-reference-scrape.md#L3359)

## Webhooks Quick Map

- Verification rationale: [Why verify signatures](etsy-open-api-v3-reference-scrape.md#L726)
- Signature inputs: [What you need](etsy-open-api-v3-reference-scrape.md#L734)
- Incoming request headers: [Incoming request shape](etsy-open-api-v3-reference-scrape.md#L740)
- Signature computation: [Compute and verify signature](etsy-open-api-v3-reference-scrape.md#L750)
- Replay attack guard: [Prevent replay attacks](etsy-open-api-v3-reference-scrape.md#L776)
- Portal setup: [Access portal](etsy-open-api-v3-reference-scrape.md#L796)
- Endpoint configuration: [Configure subscription](etsy-open-api-v3-reference-scrape.md#L812)
- Unsubscribe/delete/disable: [Unsubscribe workflows](etsy-open-api-v3-reference-scrape.md#L832)
- Retry behavior: [Delivery schedule](etsy-open-api-v3-reference-scrape.md#L906)

## Agent Research Workflow

1. Start in Core Essentials to confirm auth, request syntax, and limits.
2. Jump to Feature-Oriented Shortcuts for implementation details by feature.
3. Use Personalization Migration Cluster only if personalization fields are in scope.
4. Use Webhooks Quick Map when event-driven sync is required.
5. For endpoint payload deep dives, use Full API reference dump.

## Source Page Index (Direct Etsy Links)

- https://developers.etsy.com/documentation/
- https://developers.etsy.com/documentation/reference/
- https://developers.etsy.com/documentation/essentials/oauth2/
- https://developers.etsy.com/documentation/essentials/requests
- https://developers.etsy.com/documentation/essentials/urlsyntax
- https://developers.etsy.com/documentation/essentials/definitions
- https://developers.etsy.com/documentation/essentials/rate-limits
- https://developers.etsy.com/documentation/essentials/webhooks
- https://developers.etsy.com/documentation/tutorials/overview/
- https://developers.etsy.com/documentation/tutorials/quickstart/
- https://developers.etsy.com/documentation/tutorials/listings
- https://developers.etsy.com/documentation/tutorials/fulfillment
- https://developers.etsy.com/documentation/tutorials/shopmanagement
- https://developers.etsy.com/documentation/tutorials/payments
- https://developers.etsy.com/documentation/tutorials/migration
- https://developers.etsy.com/documentation/tutorials/third-variation
- https://developers.etsy.com/documentation/tutorials/personalization-migration
- https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration
- https://developers.etsy.com/documentation/tutorials/personalization/endpoint-migration-examples
- https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support
- https://developers.etsy.com/documentation/tutorials/personalization/multiple-and-new-question-type-support-examples
- https://developers.etsy.com/documentation/get-help/
