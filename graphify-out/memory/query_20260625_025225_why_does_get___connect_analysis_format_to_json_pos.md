---
type: "query"
date: "2026-06-25T02:52:25.885422+00:00"
question: "Why does GET() connect Analysis Format to Json Post, Slug Tsx, Extension Info, Eventformmanager Closepreview, Json Post 2, Categoryinputerror Constructor, Getclientip Isratelimited?"
contributor: "graphify"
source_nodes: ["GET()", "extension_info()", "EventFormManager", "getClientIp()"]
---

# Q: Why does GET() connect Analysis Format to Json Post, Slug Tsx, Extension Info, Eventformmanager Closepreview, Json Post 2, Categoryinputerror Constructor, Getclientip Isratelimited?

## Answer

GET() in src/pages/api/sales/[slug].ts acts as a high-degree bridge (63 edges). Most links are INFERRED cross-file calls, especially to devtools/use-railway analyzers, while only a smaller subset are EXTRACTED local API-route calls (json/getClientIp/rate-limit). So the connection cluster is mostly semantic overlap from extraction, not direct runtime coupling.

## Source Nodes

- GET()
- extension_info()
- EventFormManager
- getClientIp()