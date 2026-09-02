# AssistSec — legal document drafts

**Status: DRAFT. None of these documents may be used with a customer until a qualified Dutch lawyer
has reviewed them.**

These are draft business documents, not legal advice. No clause here should be treated as valid or
enforceable on the basis that it reads as commercially reasonable.

## The set

| Document                                                                                        | Purpose                                                                              | Signed                                      |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| [01 — Liability and Risk Allocation Terms](01-liability-and-risk-allocation-terms.md)           | Standing terms: scope, testing limitations, customer responsibilities, liability cap | Once, per customer                          |
| [02 — Mutual NDA](02-mutual-nda.md)                                                             | Mutual confidentiality covering credentials, API keys, findings and reports          | Once, per customer — ideally before scoping |
| [03 — Authorization and Indemnification Letter](03-authorization-and-indemnification-letter.md) | Per-engagement authorization to test named targets                                   | Per engagement; once per subscription term  |

Intended order: **NDA → Liability Terms → Authorization Letter → testing begins.**

Document 03 is the operationally critical one. Unauthorized access to a computer system is a
criminal offence in the Netherlands under Article 138ab of the Dutch Criminal Code. The signed
authorization letter is what makes the testing lawful, and it must be in place before any testing
starts.

## Two documents these drafts assume but do not provide

- **General terms and conditions** (_algemene voorwaarden_) — referenced by Document 01, which does
  not attempt to replace them. How the two interact, and which prevails on conflict, is an open item.
- **Data Processing Agreement** (_verwerkersovereenkomst_) — required under Article 28(3) GDPR where
  AssistSec processes personal data on the Customer's behalf. The drafts deliberately do **not**
  decide whether one is needed for a given engagement; that is a legal determination on the facts.

## What was used as source

The business overview supplied for this task, plus company details already present in this
repository: the trading name **AssistSec**, the domain `assistsec.nl`, the contact address
`contact@assistsec.nl`, and the customer portal at `scanner.assistsec.nl`
(`frontend/src/config/site.ts`).

Nothing else was assumed. No KvK number, VAT number, registered address, telephone number,
signatory, insurance policy, liability cap, retention period, subscription term or AI/LLM vendor
appears anywhere in this repository, so every one of those is a placeholder.

## Placeholders

Every gap is marked `[TO BE COMPLETED BY ASSISTSEC]`, and each document ends with a register of its
own open items. To list them all:

```bash
grep -rn "TO BE COMPLETED BY ASSISTSEC" legal/
```

The information AssistSec must supply before these can be finalised:

- Full legal name and legal form
- KvK number
- VAT number
- Registered / business address
- Telephone number
- Name and position of the authorized signatory
- Professional and business liability insurance details
- Standard terms and conditions
- Applicable law and competent court
- The AI/LLM providers actually used, their processing locations, their retention behaviour, and
  whether submitted data may be used for model training
- Liability cap — amount and basis
- Retention periods for engagement data, reports, credentials and evidence
- Subscription term, notice period and renewal mechanism

## Points flagged for legal review

Marked `[LEGAL REVIEW]` in the text. To list them:

```bash
grep -rn "\[LEGAL REVIEW" legal/
```

The substantive ones:

| Issue                                     | Where          | Why it matters                                                                                               |
| ----------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| Liability cap and exclusions              | 01 §13         | The clause most likely to be tested in a dispute. Requires assessment under Art. 6:233, 6:248 and 6:89 BW    |
| _Opzet / bewuste roekeloosheid_ carve-out | 01 §13.4       | Dutch courts generally will not uphold an exclusion for intent or deliberate recklessness                    |
| Whether these are _algemene voorwaarden_  | 01 §1.2        | If they are, the information duty in Art. 6:233(b) and 6:234 BW applies and clauses become annullable        |
| Effort vs. result obligation              | 01 §5.1        | Art. 7:400/7:401 BW. The whole "no guarantee" position rests on this characterisation                        |
| Indemnification                           | 01 §12, 03 §11 | A broad indemnity may not be upheld where it functions as a disguised exclusion of AssistSec's own liability |
| Production-testing risk allocation        | 01 §8          | May be vulnerable where damage flows from AssistSec's own failure to observe agreed conditions               |
| GDPR — DPA requirement and roles          | 01 §11, 02 §10 | Deliberately left undetermined; a factual and legal assessment per engagement                                |
| AI/LLM providers as subprocessors         | 01 §6.5, 02 §8 | Art. 28 GDPR, plus a Chapter V transfer mechanism for any processing outside the EEA                         |
| Restriction on Customer's use of reports  | 02 §7.3        | Restricts a deliverable the Customer paid for; commercial and legal acceptability both need checking         |
| Confidentiality survival periods          | 02 §13         | Perpetual may be unenforceable; too short leaves exploitable findings unprotected                            |
| Contractual penalty, if adopted           | 02 §14.2       | Subject to judicial mitigation under Art. 6:94 BW                                                            |
| Sufficiency of the authorization letter   | 03 header      | Whether it is adequate against Art. 138ab Sr for AssistSec and for individual testers                        |
| Signatory authority                       | 03 header      | Whether a KvK extract or power of attorney should be required                                                |
| Cloud provider testing policies           | 03 §8          | Provider policies differ; the table records the outcome, it does not replace the check                       |
| Choice of law and forum                   | all            | Brussels I bis and Rome I where the Customer is outside the Netherlands                                      |
| Electronic signature                      | 02 §16.4       | eIDAS Regulation (EU) 910/2014 and Art. 3:15a BW                                                             |

## Positions taken in the drafting

Worth confirming these are what AssistSec wants, since each is a commercial choice, not a legal one:

1. **Subscription framed as periodic, not continuous.** Document 01 §4.2.3 states plainly that a
   Monthly Scanning Subscription is not monitoring, not intrusion detection, and not a managed
   security service. It is the most likely source of a customer expectation gap.
2. **Authorization for subscriptions is continuing.** One signed letter covers every recurring scan
   in the term (03 §4.2), rather than requiring a fresh signature per scan.
3. **Testing Conditions are presented as limits on discovery.** Rate limits, WAF-enabled, black-box
   and QUICK depth are each stated to reduce what can be found (01 §5.4, 03 §4.1), so a customer
   cannot later argue it expected full coverage from a constrained test.
4. **"Resolved" is not a retest.** A finding marked Resolved reflects portal status, not independent
   confirmation by AssistSec, unless a retest was performed and reported (01 §9.5).
5. **Internal materials are withheld by contract.** Live attack logs, internal notes, raw terminal
   output and internal AI reasoning are excluded from deliverables (01 §9.7), with an express
   carve-out that AssistSec will still substantiate a finding on reasonable request.
6. **Credentials are ring-fenced from AI providers.** Document 02 §6.2 commits AssistSec not to
   submit credentials or API keys to an external AI/LLM provider except where strictly necessary and
   agreed in writing. Confirm the testing pipeline actually honours this before signing it.
7. **Confidentiality survival is split.** A general period, and a separate longer one for
   credentials and vulnerability information (02 §13.2, §13.3).

## One thing to verify against the product

Item 6 above is a contractual promise about how the AI testing pipeline behaves. Whether credentials
and API keys can reach an external AI/LLM provider is a question about the implementation, not about
the drafting. Confirm it before the NDA is signed, and adjust §6.2 if the answer is more nuanced.
