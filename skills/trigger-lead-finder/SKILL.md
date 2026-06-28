---
name: trigger-lead-finder
description: Research and compile trigger-based commercial finance loan leads (bridge loans, equipment financing, SBA 7(a)/504, construction loans, working capital) from recent business news. Use when the user asks to "find leads," "pull new leads," "find me X leads like these," or wants a batch of outbound commercial finance prospects sourced from real, recent trigger events (acquisitions, fund launches, expansions, franchise openings, DSO mergers, fleet additions, construction groundbreakings). Outputs a formatted, scored, deduplicated Excel workbook matching the Scorpion Global Solutions master lead list structure. Always sources from events within the last 2 weeks unless the user specifies otherwise.
---

# Trigger-Based Commercial Finance Lead Finder

## Overview

This skill produces batches of trigger-based commercial finance loan leads by researching real, recent business events and formatting them into a scored Excel workbook. Each lead must have a verifiable trigger event (acquisition, fund launch, expansion, merger, franchise opening, groundbreaking) from a named news source.

The full workflow has four phases:

1. **Ingest** — read the user's existing master list (if provided) to extract company names and avoid duplicates
2. **Research** — search for trigger events across all target industries within the requested date window
3. **Compile** — score, grade, and format leads into Excel using `scripts/build_leads_excel.py`
4. **Deliver** — attach the Excel file with a summary

---

## Phase 1 — Ingest Existing List

If the user provides an existing leads file:

- Read it with Python (`openpyxl`) to extract all company names into a deduplication set
- Note the column structure so the output file matches exactly
- Store company names in a Python `set` (case-insensitive) for O(1) lookup during Phase 3

If no file is provided, skip deduplication and proceed directly to research.

---

## Phase 2 — Research Trigger Events

### Target Industries & Loan Products

| Industry | Loan Product |
|---|---|
| Multifamily / commercial RE acquisition | Bridge / Commercial RE |
| Multifamily / commercial RE construction | Construction / Bridge |
| Trucking / logistics fleet expansion | Equipment Financing |
| Waste / refuse hauling fleet | Equipment Financing |
| Auto dealership acquisition | Equipment Financing / Floor Plan |
| Fitness franchise opening | SBA 7(a) / Equipment Financing |
| Dental / DSO merger or de novo | SBA 7(a) / SBA 504 |
| Veterinary practice expansion | SBA 7(a) / Term Loan |
| Optometry practice expansion | SBA 7(a) / Equipment Financing |
| Restaurant franchise expansion | SBA 7(a) / Construction |
| General contractor (commercial) | Construction / SBA 504 |
| CNC / metal fabrication | Equipment Financing / SBA 504 |
| Medical supply / distribution | Equipment Financing / SBA 504 |
| Build-to-rent / SFR | Bridge / Construction |

### Search Strategy

Use `search` tool with `type=news` and `time=past_month` (or `time=past_week` for tighter windows). Run multiple parallel searches across source categories:

**Multifamily / Commercial RE:**
- `"apartment acquisition" multifamily 2026`
- `"construction loan" multifamily groundbreaking 2026`
- `"bridge loan" apartment value-add acquisition`
- Key sources: therealdeal.com, multifamilydive.com, multihousingnews.com, globest.com, bisnow.com

**Equipment / Fleet:**
- `trucking logistics acquisition fleet expansion 2026`
- `waste hauling acquisition fleet 2026`
- Key sources: freightwaves.com, truckinginfo.com, wastedive.com

**Healthcare / Dental / Vet:**
- `DSO merger dental acquisition 2026`
- `veterinary practice acquisition expansion 2026`
- Key sources: beckersdental.com, drbicuspid.com, groupdentistrynow.com

**Franchise / Restaurant:**
- `franchise expansion new locations 2026`
- `SBA loan franchise opening buildout 2026`
- Key sources: inc.com, qsrmagazine.com, prnewswire.com

**Construction / Manufacturing:**
- `commercial construction groundbreaking awarded contract 2026`
- `SBA 504 manufacturing expansion 2026`
- Key sources: constructiondive.com, abc.org, wbd.org

### Extracting Lead Details

For each trigger event, extract:
- **Company name** — exact legal or DBA name
- **Decision-maker** — CEO, President, Owner, Managing Partner, or equivalent
- **Title** — exact title
- **Industry / Asset** — specific asset class or business type
- **Location** — City, State
- **Loan product fit** — from the table above
- **Trigger event** — 1–2 sentences including date, deal size if public, and why it signals a financing need
- **Est. deal size** — dollar range from public sources; append "est." if inferred
- **Source URL** — direct link to the news article

**Quality rules:**
- Every lead must have a named, verifiable trigger event with a source URL — never fabricate
- Best-effort emails follow `firstname.lastname@domain.com` or `flastname@domain.com` — always mark as unverified
- LinkedIn URLs follow `https://www.linkedin.com/in/firstname-lastname-company`

---

## Phase 3 — Compile and Score

### Scoring Rubric (0–100)

| Factor | Points |
|---|---|
| Trigger event within the last 2 weeks | +20 |
| Deal size > $50M | +20 |
| Deal size $10M–$50M | +10 |
| Decision-maker is C-suite or Owner | +15 |
| Multiple trigger events / active acquirer | +10 |
| Source is Tier 1 (The Real Deal, FreightWaves, Multifamily Dive, BeckersDental) | +10 |
| Contact info available (email or phone) | +5 |
| Company has active financing history | +10 |
| Deduct: trigger older than 30 days | −10 |
| Deduct: decision-maker is VP or below | −5 |

**Grade thresholds:** A = 77–100 · B = 65–76 · C = 55–64

### Deduplication

Before adding any lead, check the company name (case-insensitive) against the deduplication set from Phase 1. Skip duplicates silently.

### Excel Generation

Use `scripts/build_leads_excel.py` to produce the workbook. The script accepts a Python list of lead tuples and an output path. See the script's docstring for the exact tuple schema.

The script produces a two-tab workbook:
- **Tab 1 — Leads** — all leads with headers, color-coded grade badges, alternating row fills, auto-filter, frozen header
- **Tab 2 — Summary** — batch stats (total, grade breakdown, loan product breakdown, date range, source list)

**Column order (must match master file):**

```
Company | Decision-Maker | Title | Industry/Asset | Location |
Loan Product Fit | Trigger Event | Est. Deal Size | Lead Score |
Grade | Verified Email | Email Status | Best-Effort Email |
LinkedIn | Mobile Phone | Other Public Contact | Source
```

---

## Phase 4 — Deliver

Send the Excel file as an attachment with a summary message containing:
- Total leads and grade breakdown table
- Loan product breakdown table
- Top 5 hottest leads to call first (Grade A, highest score)
- Trigger date range and source list

---

## Re-running the Skill

To generate a new batch:
1. Provide the updated master list (or the previous output file) for deduplication
2. Specify the count (default: 100) and date window (default: last 2 weeks)
3. Optionally restrict to specific industries or loan products

The skill always starts fresh research — it never reuses leads from previous batches.
