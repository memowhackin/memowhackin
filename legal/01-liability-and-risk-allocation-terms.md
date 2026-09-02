# AssistSec — Liability and Risk Allocation Terms

**Document status:** DRAFT — not for use with customers until reviewed by qualified Dutch legal counsel.
**Version:** 0.1 Draft
**Date:** [TO BE COMPLETED BY ASSISTSEC]

> **These are draft business documents, not legal advice.** No statement in this document should be
> taken as a representation that any clause is valid or enforceable. Clauses marked **[LEGAL REVIEW]**
> raise issues that must be assessed under Dutch law before this document is used.

---

## 1. Parties and application

|                               |                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Service provider**          | AssistSec, [TO BE COMPLETED BY ASSISTSEC: full legal name and legal form, e.g. B.V. / V.O.F. / eenmanszaak] |
| **Chamber of Commerce (KvK)** | [TO BE COMPLETED BY ASSISTSEC]                                                                              |
| **VAT number (BTW-nummer)**   | [TO BE COMPLETED BY ASSISTSEC]                                                                              |
| **Registered address**        | [TO BE COMPLETED BY ASSISTSEC]                                                                              |
| **Email**                     | contact@assistsec.nl                                                                                        |
| **Telephone**                 | [TO BE COMPLETED BY ASSISTSEC]                                                                              |
| **Website**                   | https://assistsec.nl                                                                                        |

1.1 These Liability and Risk Allocation Terms (the **"Terms"**) apply to every offer, order
confirmation, statement of work and agreement under which AssistSec performs penetration testing
services for a customer (the **"Customer"**).

1.2 These Terms are intended to operate alongside:

- AssistSec's general terms and conditions (_algemene voorwaarden_) — [TO BE COMPLETED BY ASSISTSEC];
- the Mutual Non-Disclosure Agreement between the parties;
- the engagement-specific Authorization and Indemnification Letter; and
- a Data Processing Agreement (_verwerkersovereenkomst_) where one is required.

**[LEGAL REVIEW]** The relationship between these Terms and AssistSec's general terms and conditions
must be settled, including which document prevails on conflict, and whether these Terms are
themselves _algemene voorwaarden_ within the meaning of Article 6:231 of the Dutch Civil Code
(_Burgerlijk Wetboek_, **"BW"**). If they are, the information duty in Article 6:233(b) and 6:234 BW
applies and the manner of provision (_terhandstelling_) affects whether the Customer can later annul
individual clauses.

1.3 The Customer's own purchase conditions or general terms are expressly rejected and do not apply,
unless AssistSec has accepted them in writing.

1.4 **Order of precedence.** Where the documents listed in Section 1.2 conflict, the following order
applies, the earlier prevailing over the later:

1. the engagement-specific Authorization and Indemnification Letter;
2. these Terms;
3. the Mutual Non-Disclosure Agreement;
4. AssistSec's general terms and conditions.

A Data Processing Agreement prevails over all of the above on any matter concerning the processing
of personal data, and only on such matters.

---

## 2. Definitions

**"Engagement"** — a specific set of testing activities agreed between the parties, whether a One-Off
Penetration Test or a Monthly Scanning Subscription.

**"Authorized Targets"** — the web applications, APIs, URLs and endpoints expressly identified as
in scope in the Authorization and Indemnification Letter for the relevant Engagement.

**"Testing Window"** — the period during which AssistSec is authorized to perform testing against
the Authorized Targets.

**"Testing Conditions"** — the engagement parameters agreed in writing, including testing mode
(BLACK-BOX or GREY-BOX), testing depth (QUICK, STANDARD or DEEP), rate limits or requests per
second, whether WAF protections remain enabled, any User-Agent requirement, testing objectives, and
any test accounts provided.

**"Findings"** — the vulnerabilities, weaknesses and observations identified during an Engagement.

**"Report"** — a version-controlled document produced by AssistSec setting out Findings, risk and
severity assessment, and remediation recommendations.

**"Portal"** — the secured customer portal operated by AssistSec through which Reports, Findings,
remediation status and related information are delivered.

**"AI Engine"** — the AI-powered testing engine used by AssistSec to perform testing activities
under human direction and monitoring.

---

## 3. Nature and scope of the services

3.1 **What AssistSec does.** AssistSec is a Dutch cybersecurity company that performs AI-assisted
penetration testing of web applications and APIs. Testing activities are performed by the AI Engine.
Human penetration testers direct and monitor that testing and remain responsible for validating
Findings, interpreting results, determining severity and approving all customer-facing Reports.

3.2 **In scope.** Unless otherwise agreed in writing, an Engagement may cover:

- web applications accessible through a URL;
- APIs, including REST/HTTP APIs, accessible through URLs or endpoints;
- unauthenticated / black-box testing;
- authenticated / grey-box testing where the Customer provides test credentials.

3.3 **Out of scope.** The following are excluded from every Engagement unless expressly agreed in
writing and reflected in the Authorization and Indemnification Letter:

- standalone network or infrastructure penetration testing;
- physical security testing;
- social engineering;
- phishing;
- mobile applications;
- thick clients and desktop applications;
- hardware;
- IoT;
- OT/ICS environments;
- Denial-of-Service (DoS) and Distributed Denial-of-Service (DDoS) testing;
- deliberately destructive testing;
- any system, URL, endpoint or environment outside the Authorized Targets.

3.4 **Scope limitation.** AssistSec's responsibility is limited to the Authorized Targets, the
Testing Window and the agreed Testing Conditions. AssistSec accepts no responsibility for the
security of any system, application, endpoint, environment or component that was not an Authorized
Target, including systems that are connected to, depend on, or are reachable from an Authorized
Target.

3.5 **Engagement lifecycle.** Each Engagement generally follows: (1) intake and scope definition;
(2) preparation, including configuration of testing mode, test accounts where applicable, rate
limits, WAF configuration and testing objectives; (3) testing by the AI Engine under human
monitoring; (4) validation by human penetration testers, including filtering of false positives and
assessment of severity; (5) reporting; and (6) delivery through the Portal and follow-up.

---

## 4. Service models

### 4.1 One-Off Penetration Test

4.1.1 A One-Off Penetration Test is a one-time security assessment of a web application or API.

4.1.2 The result is a **point-in-time assessment** of the security posture of the tested target as
it existed during the Testing Window, under the agreed Testing Conditions. It says nothing about the
security posture of that target at any other moment.

4.1.3 Typical output is one Report containing identified Findings, a risk and severity assessment,
and remediation recommendations.

4.1.4 **Retest.** Whether a One-Off Penetration Test includes a retest of reported Findings, and on
what terms, is [TO BE COMPLETED BY ASSISTSEC — included within N days / priced separately / not
offered]. Where a retest is performed it requires its own authorized retest window under the
Authorization and Indemnification Letter, because the authorization for the original Testing Window
has by then expired.

### 4.2 Monthly Scanning Subscription

4.2.1 A Monthly Scanning Subscription is a recurring security testing service under which the
Authorized Targets are assessed periodically. It generally consists of an initial penetration test
or baseline assessment, recurring monthly scans, historical and trend information, tracking of
whether Findings have been resolved, and a defined subscription term.

4.2.2 **Repeated authorized access.** The Customer acknowledges and agrees that a Monthly Scanning
Subscription involves **repeated authorized access to the Customer's environment throughout the
subscription period**, and that the authorization granted in the Authorization and Indemnification
Letter is a continuing authorization covering each scan performed during that period.

4.2.3 **Periodic, not continuous.** A Monthly Scanning Subscription delivers **periodic assessments**.
It is **not** continuous security monitoring, not an intrusion detection or prevention service, not a
managed security service, and not a substitute for any of these. Between scans, the Authorized
Targets are not observed by AssistSec, and changes made to them are not assessed until the next
scheduled scan.

4.2.4 **Verification of resolution.** For a Monthly Scanning Subscription, whether a Finding
recorded as Resolved has in fact been remediated is verified within the next scheduled scan. No
separate retest authorization is needed, because each scan is covered by the continuing
authorization in Section 4.2.2.

4.2.5 The subscription term, notice period and renewal mechanism are
[TO BE COMPLETED BY ASSISTSEC]. The dates of a particular subscription are recorded in the
Authorization and Indemnification Letter for that engagement.

---

## 5. Effort-based service and absence of guarantee

5.1 **Effort-based obligation.** AssistSec's obligation under every Engagement is an obligation of
effort and skill, not an obligation of result. AssistSec undertakes to perform the services with the
care that may be expected of a competent professional service provider.

**[LEGAL REVIEW]** Whether the Engagement qualifies as an _overeenkomst van opdracht_ under Article
7:400 BW, and whether the obligation is properly characterized as an _inspanningsverbintenis_ rather
than a _resultaatsverbintenis_, should be confirmed. Article 7:401 BW imposes a statutory duty of
care that cannot be contracted away entirely; the drafting must not suggest otherwise.

5.2 **No guarantee of complete security.** Penetration testing has inherent limitations. AssistSec
does **not** warrant, represent or guarantee that:

- all vulnerabilities present in the Authorized Targets will be discovered;
- the Authorized Targets are secure, free of vulnerabilities, or will remain so;
- the absence of a Finding means the absence of a vulnerability;
- the Authorized Targets comply with any law, standard, certification or contractual requirement;
- the Customer will pass any audit, certification or third-party assessment.

5.3 **Undiscovered vulnerabilities may remain.** A Report describes what was found within the
Testing Window, under the agreed Testing Conditions, using the agreed testing mode and depth.
Vulnerabilities may exist that were not discovered, including because they were outside the
Authorized Targets, outside the Testing Window, not reachable under the agreed Testing Conditions,
dependent on a system state that did not occur during testing, dependent on credentials or roles not
made available, obscured by WAF protections that remained enabled, or not detectable at the agreed
testing depth.

5.4 **Effect of Testing Conditions.** The Customer acknowledges that the Testing Conditions it
selects directly limit what can be found. In particular:

- **BLACK-BOX** testing without credentials cannot assess authenticated functionality;
- **QUICK** depth covers less than **STANDARD**, which covers less than **DEEP**;
- rate limits reduce the number of requests that can be issued and may prevent discovery of issues
  that require volume;
- leaving WAF protections enabled tests the protected surface, and may conceal vulnerabilities in
  the application behind it.

5.5 **Changes after testing.** Any change to an Authorized Target after the Testing Window —
including deployments, configuration changes, dependency updates and infrastructure changes — may
introduce vulnerabilities that no Report addresses.

5.6 **Third-party components.** AssistSec does not warrant the security of third-party software,
libraries, services, hosting platforms or dependencies used by the Authorized Targets.

---

## 6. AI-assisted testing

6.1 **Disclosed use of AI.** The Customer acknowledges that AssistSec performs testing using an
AI-powered testing engine and automated tooling, and expressly authorizes such automated and
AI-driven testing against the Authorized Targets.

6.2 **Human oversight and responsibility.** Human penetration testers direct and monitor testing.
Findings are validated by human penetration testers, false positives are filtered, severity is
assessed by a human, and no Report is released to the Customer without human review and approval.

6.3 **No autonomous guarantee.** Nothing in the services should be understood as a representation
that AI performs complete, exhaustive or independently reliable security testing. The AI Engine is a
tool operated under human direction. The limitations in Section 5 apply in full to AI-assisted
testing.

6.4 **External AI/LLM providers.** Information relating to an Engagement may be processed through
external AI or large language model providers.

The providers used, the geographic locations in which they process data, their retention behaviour,
and whether they use submitted data for model training, are set out in **Schedule A (AI/LLM
subprocessors)** to these Terms. Schedule A carries a version date and is the single source for this
information; the Mutual Non-Disclosure Agreement and the Authorization and Indemnification Letter
refer to it rather than restating it.

6.5 AssistSec shall impose confidentiality obligations on such providers consistent with the Mutual
Non-Disclosure Agreement, and shall not knowingly submit Customer credentials or API keys to an
external AI/LLM provider except where strictly necessary and agreed in writing.

**[LEGAL REVIEW]** Where personal data is processed through an external AI/LLM provider, that
provider is likely to be a subprocessor for GDPR/AVG purposes. Article 28(2) and 28(4) GDPR
requirements, the transfer mechanism for any processing outside the EEA (Chapter V GDPR), and the
Customer's right to object to new subprocessors must all be addressed. This section must be aligned
with the Data Processing Agreement.

6.6 **AI usage and costs.** Where an Engagement is priced by reference to AI usage, the applicable
metric, rate and any cap are: [TO BE COMPLETED BY ASSISTSEC].

---

## 7. Customer responsibilities

7.1 The Customer is responsible for, and warrants that:

(a) **Authorization.** It has provided accurate authorization and has the full legal right and
authority to authorize testing of each Authorized Target.

(b) **Ownership or right to test.** It owns each Authorized Target, or holds a documented right from
the owner sufficient to authorize the testing described in the Authorization and Indemnification
Letter.

(c) **Third-party notification.** It has notified, and where required obtained the consent of, any
relevant third party, including hosting providers, cloud providers, CDN providers, WAF or DDoS
protection providers, managed service providers and any other party whose systems or contractual
terms may be affected by the testing.

(d) **Accurate scope.** The scope, Authorized Targets and Testing Conditions it has provided are
accurate and complete, and it will promptly notify AssistSec of any change.

(e) **Environment type.** It has informed AssistSec in writing whether each Authorized Target is a
**production** or **non-production** environment.

(f) **Backups.** It maintains current, tested and restorable backups of all data and systems that
could be affected by the testing, taken before the Testing Window begins.

(g) **Remediation.** It is solely responsible for deciding upon, prioritizing, implementing and
verifying remediation of Findings. AssistSec's remediation recommendations are advisory.

(h) **Test accounts.** Any test credentials it provides are valid, are for accounts created for
testing purposes, and do not grant access beyond what is necessary for the agreed Testing
Conditions.

7.2 If any of the warranties in Section 7.1 proves inaccurate, AssistSec may suspend or terminate
the Engagement immediately without liability, and Section 12 (Indemnification) applies.

---

## 8. Production and non-production testing

8.1 Security testing carries inherent risk. Testing may cause increased load, unexpected application
behaviour, error conditions, log volume, alerting, degraded performance, generation of test data,
state changes in the tested application, or triggering of automated protective mechanisms such as
account lockout, rate limiting or IP blocking.

8.2 AssistSec does not perform Denial-of-Service or deliberately destructive testing (Section 3.3).
Nevertheless, the risks in Section 8.1 cannot be eliminated.

8.3 **Production testing.** Where the Customer authorizes testing against a production environment,
it does so with knowledge of the risks in Section 8.1, having satisfied itself that backups under
Section 7.1(f) are in place, and accepts the operational risk of testing a live environment.

8.4 AssistSec will observe the agreed rate limits and Testing Conditions and will suspend testing on
request from a nominated emergency contact in accordance with the Authorization and Indemnification
Letter. Where source IP addresses are recorded in that Letter, AssistSec will test only from those
addresses, and will notify the Customer before testing from any other address.

**[LEGAL REVIEW]** The allocation of risk in Sections 8.3 and 12 must be assessed for consistency
with Article 6:248(2) BW (_redelijkheid en billijkheid_) and, if these Terms are _algemene
voorwaarden_, Article 6:233(a) BW (unreasonably onerous clauses). A clause allocating all
production-testing risk to the Customer may be vulnerable where the damage results from AssistSec's
own failure to observe the agreed Testing Conditions.

---

## 9. Reporting, standards and deliverables

9.1 **Reference frameworks.** AssistSec uses recognized security frameworks and standards as
reference points, including the OWASP Web Security Testing Guide (WSTG) as a testing reference,
CVSS v3.1 for vulnerability scoring, and ISO/IEC 27001:2022 as a compliance-information framework
within the Portal.

9.2 **Use of standards is a reference, not a certification.** Reference to these frameworks does not
mean that an Engagement constitutes an audit, a certification, an accreditation, or an assessment of
compliance with any standard, and does not make AssistSec a certifying body.

9.3 **Severity classification.** Findings are classified by severity, from informational findings to
the highest severity category. Severity is assessed by human penetration testers and reflects
AssistSec's professional judgement of the Finding in the tested context. It is not a statement of
the Customer's overall business risk.

9.4 **Report versioning.** Reports are version-controlled and may progress through stages such as
`0.1 Draft` → `0.2 Customer Review` → `1.0 Final`. Only a Report marked `1.0 Final` (or a later final
version) is a definitive deliverable. Draft and review versions are provisional and may change.

9.5 **Finding lifecycle.** Findings carry lifecycle states including Discovered, Validated,
Confirmed and Resolved. A state of "Resolved" reflects the status recorded in the Portal and, unless
AssistSec has performed and reported a retest, does not constitute independent confirmation by
AssistSec that the underlying vulnerability has been effectively remediated.

9.6 **Delivery through the Portal.** Results are delivered through the Portal. Depending on the
service, the Customer may access Reports and report versions, Findings, remediation status, current
pentest progress, historical trends for recurring scans, ISO/IEC 27001:2022-related compliance
information, and activity logs.

9.7 **Not delivered.** The Customer does not receive live attack logs, AssistSec's internal notes,
raw terminal output, or internal AI reasoning. These are AssistSec's internal working materials.
This does not limit AssistSec's obligation to substantiate a Finding on reasonable request:
substantiation means the evidence and reasoning necessary to establish that the Finding is real and
correctly assessed, which is not the same as disclosure of raw output.

9.9 **Critical findings.** Where AssistSec identifies a Finding it assesses as critical, it notifies
the Customer's nominated emergency contact within the period stated in the Authorization and
Indemnification Letter, rather than waiting for the Report. This obligation applies to every
Engagement.

9.8 **Portal availability.** Portal availability, retention of Reports within the Portal, and export
options are: [TO BE COMPLETED BY ASSISTSEC].

---

## 10. Confidentiality and information security

10.1 Confidentiality is governed by the Mutual Non-Disclosure Agreement between the parties.

10.2 The technical and organisational measures AssistSec applies to information processed in
connection with an Engagement are set out in Section 5.3 of the Mutual Non-Disclosure Agreement.
They are stated there rather than repeated here, so that one description governs.

---

## 11. Data protection

11.1 Where AssistSec processes personal data on behalf of the Customer in the course of an
Engagement, the parties shall conclude a Data Processing Agreement (_verwerkersovereenkomst_)
meeting the requirements of Article 28(3) GDPR before such processing begins.

11.2 The parties shall assess, for each Engagement, whether personal data is likely to be processed —
including personal data encountered incidentally in an Authorized Target, in test accounts, in
application data, in logs, or in evidence attached to a Finding.

11.3 The following shall be addressed in that assessment and, where applicable, in the Data
Processing Agreement: data minimization; retention periods; deletion or return of data; the
geographic location of processing; processing by external AI/LLM providers; confidentiality
obligations imposed on subprocessors; and the allocation of roles between the parties.

11.4 Retention periods applicable to Engagement data, Reports, credentials and evidence are set out
in **Schedule B (Retention)** to the Mutual Non-Disclosure Agreement.

**[LEGAL REVIEW]** This section deliberately does **not** determine whether a Data Processing
Agreement is required for any particular Engagement, whether AssistSec acts as processor or
controller for any given processing activity, or whether any transfer outside the EEA is lawful.
Each of those is a legal determination that must be made on the facts, with appropriate legal
analysis, and cannot be settled by a template clause.

---

## 12. Indemnification

12.1 The Customer shall indemnify, defend and hold harmless AssistSec and its personnel against all
third-party claims, proceedings, losses, damages, fines, costs and reasonable legal fees arising out
of or in connection with:

(a) any inaccuracy in the Customer's warranties under Section 7.1, in particular the absence of
authority to authorize testing of an Authorized Target;

(b) any claim by an owner, operator, hosting provider, cloud provider or other third party relating
to testing performed by AssistSec within the Authorized Targets, the Testing Window and the agreed
Testing Conditions;

(c) the Customer's failure to notify or obtain consent from a third party under Section 7.1(c); and

(d) the Customer's failure to maintain backups under Section 7.1(f).

12.2 The indemnity in Section 12.1 does not extend to claims to the extent they arise from
AssistSec's intent (_opzet_) or deliberate recklessness (_bewuste roekeloosheid_), or from testing
performed by AssistSec outside the Authorized Targets, outside the Testing Window, or in breach of
the agreed Testing Conditions.

**[LEGAL REVIEW]** The scope, procedural conditions (notice, conduct of defence, settlement
consent) and enforceability of this indemnity must be reviewed under Dutch law. Broad indemnities
are not always upheld, particularly where they operate as a disguised exclusion of the indemnified
party's own liability, and their interaction with Section 13 must be checked for consistency.

---

## 13. Limitation of liability

> **[LEGAL REVIEW — ENTIRE SECTION]** This section contains the commercially significant limitations
> and is the part of this document most likely to be tested in a dispute. Nothing here should be
> treated as enforceable until Dutch counsel has confirmed it. In particular: the cap, the exclusion
> of consequential loss, the notification period and the limitation period each require assessment
> under Articles 6:233, 6:248 and 6:89 BW, and — if these Terms qualify as _algemene voorwaarden_ —
> against the standards applied to such terms in B2B relationships.

13.1 **Liability cap.** AssistSec's aggregate liability arising out of or in connection with an
Engagement is limited to [TO BE COMPLETED BY ASSISTSEC — cap to be selected and reviewed, for
example: the fees paid by the Customer for the relevant Engagement; or the fees paid in the twelve
(12) months preceding the event giving rise to liability; or a fixed amount in EUR].

13.2 **One-off and subscription engagements treated separately.** For a One-Off Penetration Test,
the cap is calculated by reference to the fees for that Engagement. For a Monthly Scanning
Subscription, the cap is calculated by reference to [TO BE COMPLETED BY ASSISTSEC — for example the
subscription fees paid in the preceding twelve (12) months].

13.2.1 **Connected events.** Under both service models, a series of connected events counts as a
single event for the purpose of the cap.

13.3 **Excluded categories of loss.** To the extent permitted by law, AssistSec is not liable for
indirect or consequential loss, including loss of profit, loss of turnover, loss of anticipated
savings, loss of goodwill or reputational harm, loss of or damage to data, business interruption,
downtime, missed opportunities, third-party claims, regulatory fines, or the cost of remediating
vulnerabilities.

13.4 **Not limited.** Nothing in these Terms limits or excludes AssistSec's liability for intent
(_opzet_) or deliberate recklessness (_bewuste roekeloosheid_) on the part of AssistSec or its
management, for death or personal injury, or for any other liability that cannot be limited or
excluded under Dutch law.

**[LEGAL REVIEW]** Section 13.4 reflects the general position that Dutch courts will not uphold an
exclusion of liability for _opzet_ or _bewuste roekeloosheid_. The precise formulation — and whether
it should extend to _leidinggevende ondergeschikten_ — must be confirmed by counsel. Whether it
should also carve out gross negligence (_grove schuld_) is a drafting decision with commercial
consequences.

13.5 **Insurance.** AssistSec's professional and business liability insurance is:
[TO BE COMPLETED BY ASSISTSEC — insurer, policy number, cover per claim, cover per year, territorial
scope, and whether cyber liability and professional indemnity are included].

Where insurance responds, AssistSec's liability is limited to the **greater** of (a) the amount
actually paid out under the policy plus any applicable deductible, and (b) the cap in Section 13.1.
An insurer's refusal to pay does not reduce AssistSec's liability below that cap.

**[LEGAL REVIEW]** A limitation tied to insurance proceeds is only meaningful if the policy in fact
covers penetration testing activities, including AI-assisted testing. The policy wording should be
checked against the services actually delivered before this clause is relied upon. This clause is
drafted as a floor rather than a ceiling on purpose: a version limiting liability to the amount
"actually paid out" would reduce the cap to nil whenever an insurer declined a claim.

13.6 **Notification.** The Customer must notify AssistSec in writing of any claim promptly after
discovering the facts giving rise to it, and in any event within [TO BE COMPLETED BY ASSISTSEC]
after discovery, failing which the claim lapses.

**[LEGAL REVIEW]** This interacts with the statutory duty to complain within a reasonable time under
Article 6:89 BW and with the statutory limitation periods. A contractual period that is too short
may not be upheld.

13.7 **Conditions precedent to liability.** AssistSec is not liable where the loss results from the
Customer's failure to maintain backups, from inaccurate scope information, from an absence of
authority to authorize testing, from the Customer's decision not to remediate a reported Finding, or
from a vulnerability that was not discoverable under the Testing Conditions the Customer selected.

---

## 14. Force majeure

14.1 Neither party is liable for failure to perform caused by circumstances beyond its reasonable
control within the meaning of Article 6:75 BW, including failures of third-party infrastructure,
hosting or connectivity, and unavailability of external AI/LLM providers.

14.2 Where a force majeure event prevents testing during a Testing Window, the parties shall agree a
replacement window in good faith.

---

## 15. Term, suspension and termination

15.1 Termination rights, notice periods and the consequences of termination are:
[TO BE COMPLETED BY ASSISTSEC].

15.2 AssistSec may suspend or terminate testing immediately, without liability, where it has
reasonable grounds to believe that continued testing would be unlawful, that the Customer lacks
authority over an Authorized Target, or that continued testing presents an unacceptable risk to the
Customer or to third parties.

15.3 Sections 5, 9.7, 10, 11, 12, 13, 16 and 17 survive termination.

---

## 16. Applicable law and competent court

16.1 These Terms are governed by [TO BE COMPLETED BY ASSISTSEC — expected to be Dutch law; to be
confirmed].

16.2 Disputes shall be submitted to [TO BE COMPLETED BY ASSISTSEC — competent court, expected to be
the court of AssistSec's place of business; to be confirmed].

16.3 The applicability of the United Nations Convention on Contracts for the International Sale of
Goods (CISG) is excluded.

**[LEGAL REVIEW]** Where the Customer is established outside the Netherlands, the choice of law and
forum must be checked against Regulation (EU) 1215/2012 (Brussels I bis) and Regulation (EC)
593/2008 (Rome I). Mandatory provisions of the Customer's own jurisdiction may apply regardless of
the choice of law.

---

## 17. Miscellaneous

17.1 Amendments to these Terms are valid only in writing and signed by both parties.

17.2 If a provision is void or annulled, the remaining provisions remain in force and the parties
shall replace the affected provision with a valid provision approximating its purpose as closely as
possible.

17.3 The Customer may not assign its rights or obligations without AssistSec's prior written
consent.

17.4 **Language.** These Terms are drawn up in English. If a Dutch translation is provided, the
[TO BE COMPLETED BY ASSISTSEC — English / Dutch] text prevails.

---

## Schedule A — AI/LLM subprocessors

Version date: [TO BE COMPLETED BY ASSISTSEC]

This schedule is the single source for the information below. Section 8.3 of the Mutual
Non-Disclosure Agreement and Section 6.4 of the Authorization and Indemnification Letter refer to
it rather than restating it, so that one answer governs and cannot drift between documents.

| Provider                       | Service used for | Processing location(s) | Data retained | Used for model training |
| ------------------------------ | ---------------- | ---------------------- | ------------- | ----------------------- |
| [TO BE COMPLETED BY ASSISTSEC] |                  |                        |               |                         |
|                                |                  |                        |               |                         |

AssistSec shall notify the Customer before adding or replacing a provider in this schedule.

**[LEGAL REVIEW]** Where personal data is processed, entries in this schedule are subprocessors
under Article 28 GDPR. The notification and objection mechanism, and the transfer mechanism under
Chapter V GDPR for any location outside the EEA, must be settled in the Data Processing Agreement.

---

## Register of open items

| #   | Item                                         | Section    |
| --- | -------------------------------------------- | ---------- |
| 1   | Full legal name and legal form               | 1          |
| 2   | KvK number                                   | 1          |
| 3   | VAT number                                   | 1          |
| 4   | Registered address                           | 1          |
| 5   | Telephone number                             | 1          |
| 6   | General terms and conditions                 | 1.2        |
| 7   | Retest policy for one-off engagements        | 4.1.4      |
| 8   | Subscription term, notice period, renewal    | 4.2.5      |
| 9   | AI usage pricing metric, if any              | 6.6        |
| 10  | Portal availability and retention            | 9.8        |
| 11  | Liability cap — amount and basis             | 13.1, 13.2 |
| 12  | Insurance details                            | 13.5       |
| 13  | Claim notification period (see Art. 6:89 BW) | 13.6       |
| 14  | Termination rights and consequences          | 15.1       |
| 15  | Governing law                                | 16.1       |
| 16  | Competent court                              | 16.2       |
| 17  | Prevailing language                          | 17.4       |
| 18  | AI/LLM subprocessor entries and version date | Schedule A |

Security measures are stated in the Mutual NDA (Section 5.3) and retention periods in Schedule B to
that agreement; they are not repeated here.

---

**Signature block**

| AssistSec                                | Customer                          |
| ---------------------------------------- | --------------------------------- |
| Name: [TO BE COMPLETED BY ASSISTSEC]     | Name: ______________________      |
| Position: [TO BE COMPLETED BY ASSISTSEC] | Position: ______________________  |
| Date: ______________________             | Date: ______________________      |
| Signature: ______________________        | Signature: ______________________ |
