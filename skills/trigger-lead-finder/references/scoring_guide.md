# Lead Scoring & Grading Reference

## Scoring Rubric (0–100)

Apply each factor independently. A lead can earn a maximum of 100 points.

| Factor | Points | Notes |
|---|---|---|
| Trigger event within last 2 weeks | +20 | Date must be verifiable from source |
| Deal size > $50M | +20 | Use public figures; estimate with "est." if inferred |
| Deal size $10M–$50M | +10 | Cannot stack with the >$50M bonus |
| Decision-maker is C-suite or Owner | +15 | CEO, President, Founder, Owner, Managing Partner |
| Multiple trigger events / active acquirer | +10 | 2+ deals in current year from same company |
| Tier 1 source (The Real Deal, FreightWaves, Multifamily Dive, BeckersDental) | +10 | See industry_sources.md for Tier 1 list |
| Contact info available (email or phone) | +5 | Verified OR best-effort counts |
| Company has active financing history | +10 | Prior loans, fund activity, or PE backing |
| Trigger older than 30 days | −10 | Apply if trigger date is outside the 2-week window |
| Decision-maker is VP or below | −5 | Apply when DM is not C-suite or Owner |

## Grade Thresholds

| Grade | Score Range | Meaning |
|---|---|---|
| **A** | 77–100 | Hot lead — call within 24 hours |
| **B** | 65–76 | Warm lead — call within 3 days |
| **C** | 55–64 | Cool lead — add to drip sequence |

Leads scoring below 55 should be excluded from the batch entirely.

## Grade Color Codes (Excel)

| Grade | Hex Color | Display |
|---|---|---|
| A | `#1E8449` | Dark green |
| B | `#D4AC0D` | Gold/amber |
| C | `#CA6F1E` | Orange |

## Calibration Examples

**Score: 82 → Grade A**
- Pacific Urban Investors acquires 398-unit Koreatown complex for $139M (Jun 25 2026)
- +20 (within 2 weeks) +20 (>$50M) +15 (CEO) +10 (active acquirer) +10 (The Real Deal) +5 (email) +10 (active financing) = 90 → capped at 82 after judgment adjustment for large REIT vs. small lender fit

**Score: 74 → Grade B**
- Faulkner Capital Partners acquires 86-unit Hollywood building for $33.9M (Jun 4 2026)
- +20 (within 2 weeks) +10 ($10M–$50M) +15 (Managing Partner) +10 (The Real Deal) +5 (email) = 60 base; +10 (active acquirer, second LA deal) +4 (judgment) = 74

**Score: 62 → Grade C**
- Small veterinary practice adding second location (no public deal size)
- +20 (within 2 weeks) +15 (Owner) +5 (email) +10 (SBA 7(a) fit) = 50 base; +12 (judgment for strong SBA fit) = 62

## Notes on Contact Info

- **Verified Email** — only mark as verified if confirmed via email verification tool or direct source
- **Best-Effort Email** — construct from name + domain pattern; always mark as unverified
- Common patterns: `firstname.lastname@domain.com`, `flastname@domain.com`, `firstname@domain.com`
- **LinkedIn** — construct as `https://www.linkedin.com/in/firstname-lastname-companyname`
- **Mobile Phone** — only include if publicly listed (press release, website, LinkedIn)
