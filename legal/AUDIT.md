# Audit of the AssistSec legal drafts

**Scope:** the three draft documents and their README.
**Status: all 20 findings applied.** This file is kept as the record of what was found and what
changed, not as a list of open work.
**Method:** mechanical checks (cross-references, duplicated clauses, defined-term usage, placeholder
registers, enforceability language, invented facts) plus a clause-by-clause read for internal
contradictions and gaps against the task specification.
**Standing caveat:** this is a drafting audit, not a legal opinion. Every finding below is about
consistency, structure and completeness. Whether any clause holds up under Dutch law remains a
question for counsel, exactly as the drafts themselves say.

| Document                                      | Words | Placeholders | `[LEGAL REVIEW]` flags |
| --------------------------------------------- | ----- | ------------ | ---------------------- |
| 01 — Liability and Risk Allocation Terms      | 4,392 | 25           | 12                     |
| 02 — Mutual NDA                               | 2,653 | 20           | 7                      |
| 03 — Authorization and Indemnification Letter | 2,522 | 15           | 4                      |
| README                                        | 1,224 | 2            | 2                      |

**Outcome:** all twenty findings have been applied to the drafts.

| Measure                            | Before | After |
| ---------------------------------- | ------ | ----- |
| Findings open                      | 20     | 0     |
| Placeholders                       | 62     | 59    |
| `[LEGAL REVIEW]` flags             | 30     | 24    |
| Instruments carrying the indemnity | 2      | 1     |
| Documents with no precedence rule  | 5      | 0     |

Consolidating the AI-provider and retention questions into Schedules A and B removed eight duplicate
placeholders; the new language and retest clauses added five, which were previously unasked
questions rather than answered ones.

---

## HIGH — structural · all applied

### H1. The indemnity is signed twice, and nothing says which copy wins

01 §12 and 03 §11 contain the same indemnity. A diff after normalising defined terms shows them
substantively identical: same four triggers, same _opzet / bewuste roekeloosheid_ carve-out. The
only differences are that 01 calls the Customer's statements **warranties** and 03 calls them
**representations**, and the section cross-references differ.

Two signed instruments carrying one obligation is a drift hazard — the next edit will land in one
and not the other — and the two documents are already inconsistent on what the Customer's statements
are called. 03 §11.3 leaves precedence on liability as a placeholder; 01 §1.2 flags precedence as a
legal-review item but sets none.

**Applied.** Keep the indemnity in 01 only. Replace 03 §11 with a one-paragraph incorporation by
reference: _"The indemnification and liability provisions of the Liability and Risk Allocation Terms
dated ____ apply to this engagement."_ Pick one word — _warranties_ — and use it in both.

### H2. No document establishes the order of precedence

The set is five instruments: general terms (missing), 01, 02, 03 and a DPA (conditional). Nothing
ranks them. 01 §1.2 says the relationship with the general terms "must be settled"; 03 §11.3 asks
AssistSec to fill in which document prevails on liability alone. That leaves scope, confidentiality
and data protection with no conflict rule at all.

**Applied.** One precedence clause in 01 §1, mirrored by reference in 02 and 03. A defensible default
for a service provider: engagement-specific letter (03) → 01 → NDA (02) → general terms, with the DPA
prevailing on personal-data matters only. Whatever the order, it must exist.

### H3. The insurance clause can read as "zero liability if the insurer declines"

01 §13.5: _"Where insurance responds, AssistSec's liability is in any event limited to the amount
actually paid out under the policy plus any applicable deductible."_

As drafted, if the insurer refuses the claim — cyber excluded, AI-assisted testing not covered,
premium lapsed, notification late — the amount "actually paid out" is nil. Read alongside the cap in
§13.1 the clause is ambiguous about which limit applies, and read alone it is the kind of provision
Dutch courts strike as unreasonably onerous. The `[LEGAL REVIEW]` note beneath it flags coverage
scope but not this reading.

**Applied.** Either delete the payout limitation and let the §13.1 cap stand alone, or make it a
_floor_: _"…limited to the greater of (a) the amount paid out under the policy and (b) the cap in
§13.1."_ Add the zero-payout reading to the review note.

### H4. Retests are described but never authorised

01 §9.5 says a "Resolved" status is not AssistSec's confirmation _"unless AssistSec has performed and
reported a retest."_ 01 §4.2.1 lists resolution tracking as part of subscriptions. But:

- 03 §12.1 says the authorization _expires at the end of the testing window_ (one-off) — so a retest
  after the window is testing without authorization, which is the exact exposure Document 03 exists
  to prevent;
- 03 contains no retest window, no retest trigger, and the word "retest" does not appear in it;
- 01 never states whether a retest is included in a one-off engagement, priced separately, or
  available at all.

**Applied.** Add a retest block to 03 §4 (window, scope limited to previously reported findings, whether
the same Testing Conditions apply) and a sentence to 01 §4.1 stating whether one-off engagements
include a retest. For subscriptions, state that resolution verification happens within the next
scheduled scan.

---

## MEDIUM — consistency and drift · all applied

### M1. Defined terms are defined in 01 and then not used as defined terms in 03

| Term               | 01 (Cap / lower) | 03 (Cap / lower) |
| ------------------ | ---------------- | ---------------- |
| Authorized Targets | 14 / 0           | 0 / 7            |
| Testing Window     | 10 / 0           | 0 / 8            |
| Testing Conditions | 13 / 0           | 5 / 0            |

01 §2 defines these with initial capitals. 03 uses "authorized targets" and "testing window" as
ordinary words throughout, while capitalising "Testing Conditions". A reader — or a court — has no
signal that 03's "authorized targets" means the list in 03 §3 rather than anything the Customer
happens to have authorised in an email. 02 uses "customer portal" (3×) where 01 defines "Portal".

**Applied.** Add a definitions cross-reference at the top of 03 (_"Capitalised terms have the meaning
given in the Liability and Risk Allocation Terms"_) and capitalise consistently. Same for 02.

### M2. The AI-provider disclosure is asked for in three places

01 §6.4, 02 §8.3 and 03 §6.4(c) each contain a placeholder for the AI/LLM providers, their
locations, retention and training-use. That is three independent answers to one question, in three
documents signed at different times. When the provider list changes — and it will — the copies will
diverge, and the Customer will hold three inconsistent disclosures.

**Applied.** One schedule (_Schedule A — AI/LLM subprocessors_) attached to 01, with a version date.
02 and 03 reference it. This also matches how GDPR subprocessor lists are normally maintained.

### M3. The security-measures description is in two places

01 §10.2 and 02 §5.3 both recite: encryption at rest, RBAC, tenant isolation, MFA, audit logs. Both
carry a "reflects practices as at the date of these Terms" disclaimer. Same drift risk as M2, and
these are contractual statements about the product's implementation.

**Applied.** State it once in 02 (confidentiality is where it belongs); have 01 §10 reference it.

### M4. Four placeholders for what is probably one retention policy

- 02 §6.4 — deletion period for credentials and API keys
- 02 §11.1 — general return/deletion period
- 02 §11.4 — AssistSec's retention periods for engagement data, reports, evidence
- 01 §11.4 — the same retention periods again

AssistSec will answer these separately and they will not agree.

**Applied.** A single retention schedule (per data category: credentials, evidence, reports, portal
data, logs) attached to 02, referenced from 01 §11.4 and 02 §6.4/§11.1.

### M5. The subscription term is defined in two documents

01 §4.2.4 asks for "the subscription term, notice period and renewal mechanism" as standing terms.
03 §2 has a per-engagement fill-in "Subscription term: from ____ to ____". If a subscription is
governed by 01's standing term and 03's dates disagree, nothing says which controls.

**Applied.** 01 should hold the mechanism (notice, renewal); 03 should hold only the dates for this
engagement, and say it does.

### M6. The NDA has no entire-agreement clause, so a Customer-paper NDA could coexist

01 §1.3 rejects the Customer's own terms. 02 is silent. A Customer that has already sent its own NDA
during scoping — common — ends up with two confidentiality regimes and no rule between them.

**Applied.** Add to 02 §16: this Agreement supersedes any prior confidentiality agreement between the
Parties on the same subject.

### M7. Document language is never addressed

The task describes a _bilingual_ portal. The drafts are English only, with no prevailing-language
clause. A Dutch customer may reasonably expect a Dutch version; if one is later produced, there is
no rule on which prevails when the translations differ.

**Applied.** One clause in each document: _"This document is drawn up in English. If a Dutch translation
is provided, the [English / Dutch] text prevails."_ Which language prevails is a business decision.

### M8. NDA security obligations run one way

02 §5.3 describes AssistSec's controls in detail. Nothing describes how the **Customer** must
protect the reports it receives — documents containing exploitation paths against its own systems.
Obligation counts are balanced (_AssistSec shall_ 4×, _the Customer shall_ 2×, _the Recipient shall_
4×), but the security standard is asymmetric in the Customer's favour on the artefact the Customer
stores longest.

**Applied.** Add a Customer-side sentence to 02 §5: reports to be held on access-controlled systems and
not forwarded outside the need-to-know group. It is in the Customer's own interest.

### M9. The one-off cap has no aggregation rule

01 §13.2 states that for subscriptions "a series of connected events counts as a single event." No
equivalent for one-off engagements. A one-off test that causes three related outages could be argued
as three claims each carrying the full cap.

**Applied.** Move the connected-events sentence up so it applies to both models.

### M10. Who assesses whether a DPA is needed is stated differently in 01 and 03

01 §11.2: _"The parties shall assess…"_ 03 §7.7: the **Customer** represents that it _"has
assessed whether personal data may be processed."_ Same assessment, different owner. If personal
data turns up mid-engagement, each document points at a different party.

**Applied.** Make 03 §7.7 consistent with 01 §11.2 — a joint assessment, recorded in 03 §2 as a
checkbox with outcome.

---

## LOW — polish · all applied

- **L1** (applied) — The task's phrase for human oversight is "validating findings, **interpreting results**,
  determining severity, and approving customer-facing reports." 01 §3.1 uses it in full; 03 §6.4(a)
  drops "interpreting results." Align.
- **L2** (applied) — 03 §4 collects "AssistSec source IP addresses" but no document obliges AssistSec to test
  only from those addresses. The field is informational, not a term. Either add the obligation to
  01 §8.4 or label the field as such.
- **L3** (applied) — The critical-finding notification duty (03 §10.2) exists only in 03. 01 §9 should
  reference it so it survives as a standing term, not an engagement-by-engagement one.
- **L4** (applied) — 03's header flags that the signatory's authority may need evidence (KvK extract, power of
  attorney), but the signature block has no field for it. Add a line: _"Authority evidenced by:
  ☐ KvK extract dated ____ ☐ Power of attorney ☐ Not required."_
- **L5** (applied) — 01 §9.7 withholds internal materials "without limiting AssistSec's obligation to
  substantiate a Finding on reasonable request"; 02 §2.2(j) makes those materials AssistSec's
  Confidential Information. Not a contradiction — substantiation is not raw output — but one sentence
  in 01 §9.7 saying so would pre-empt the argument.
- **L6** (applied) — 01 §13.6 (claim notification period) and the `[LEGAL REVIEW]` beneath it are correct, but
  the register row for it (item 17) should say the placeholder interacts with Art. 6:89 BW so the
  lawyer sees the link without reading the clause.

---

## Verified clean

Checks that passed, listed so nobody re-runs them:

- **Section numbering** in 01 is contiguous 1–17; §15.3's survival references (5, 9.7, 10, 11, 12,
  13, 16, 17) all resolve.
- **Out-of-scope lists** in 01 §3.3 and 03 §6.5 are identical in substance — twelve items, same
  order, prose vs. bullets only.
- **No unqualified enforceability claims.** One grep hit (02 line 213) is inside a `[LEGAL REVIEW]`
  paragraph saying the opposite.
- **No invented facts.** No KvK, VAT, address, telephone, insurer, policy, cap amount, retention
  period, subscription term or AI vendor appears anywhere. The only company facts used — the trading
  name, `assistsec.nl`, `contact@assistsec.nl`, `scanner.assistsec.nl` — come from
  `frontend/src/config/site.ts`.
- **Registers are complete.** All 62 placeholders map to a register row in their own document.
- **Every element the specification required is present** in the document it was required in —
  verified item by item for all three (12 elements for 01, 12 for 02, 17 for 03).
- **All four finding-lifecycle states** (Discovered, Validated, Confirmed, Resolved) are named in 01.
- **The "repeated authorized access" requirement** for subscriptions is stated in 01 §4.2.2 and
  03 §4.2.
- **The not-legal-advice banner** heads all three documents.
- **AI is never described as guaranteeing anything** — 01 §6.3 says the opposite explicitly.

---

## What remains

1. **Done** — all twenty findings applied.
2. AssistSec fills the 59 remaining blanks, including Schedule A (AI/LLM subprocessors, in Document 01) and Schedule B (Retention, in Document 02).
3. Confirm NDA §6.2 against the actual testing pipeline. It promises that credentials and API keys
   will not reach an external AI/LLM provider except where strictly necessary and agreed in writing —
   a claim about implementation, which a code change could quietly falsify.
4. Dutch counsel reviews, using the 24 `[LEGAL REVIEW]` flags as the agenda.

Counsel now receives one coherent set rather than reconciling it, which at lawyer's rates was the
cheapest fix available.
