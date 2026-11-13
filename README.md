# IdentityGen

IdentityGen is an offline-first web application that generates random test identities—including first names, last names, Gmail addresses, and custom-length passwords—directly in the browser.

## What It Does

- Generates random or gender-specific (`Random`, `Female`, `Male`) test profiles completely client-side with zero network calls.
- Produces Gmail address variations with optional numeric suffixes and dot/reversed name formats.
- Generates customizable passwords (6–64 characters, with quick `12`, `16`, and `20` presets) and supports one-click copy for individual fields or the full identity block.
- Stores the last 20 generated identities in a local memory bank with batch generation (`+5`, `+10`, `+20`) and export to `JSON`, `CSV`, or `TXT`.
- Includes persistent Silver (light) and Graphite (dark) finishes plus keyboard shortcuts (`Space` to generate, `C` to copy all, `1–5` to copy fields).
