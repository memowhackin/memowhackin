# Mutual Non-Disclosure Agreement

**Document status:** DRAFT — not for use with customers until reviewed by qualified Dutch legal counsel.
**Version:** 0.1 Draft

> **This is a draft business document, not legal advice.** Clauses marked **[LEGAL REVIEW]** raise
> issues that must be assessed under Dutch law before this agreement is used.

---

## The parties

**Party A — AssistSec**

|                    |                                                                           |
| ------------------ | ------------------------------------------------------------------------- |
| Legal name         | [TO BE COMPLETED BY ASSISTSEC: full legal name and legal form]            |
| KvK number         | [TO BE COMPLETED BY ASSISTSEC]                                            |
| Registered address | [TO BE COMPLETED BY ASSISTSEC]                                            |
| Represented by     | [TO BE COMPLETED BY ASSISTSEC: name and position of authorized signatory] |
| Email              | contact@assistsec.nl                                                      |

**Party B — Customer**

|                                       |                        |
| ------------------------------------- | ---------------------- |
| Legal name                            | ______________________ |
| KvK or equivalent registration number | ______________________ |
| Registered address                    | ______________________ |
| Represented by                        | ______________________ |
| Email                                 | ______________________ |

Capitalised terms not defined here have the meaning given in the Liability and Risk Allocation
Terms between the Parties.

Each a **"Party"** and together the **"Parties"**. In this Agreement, **"Discloser"** means the Party
disclosing Confidential Information and **"Recipient"** means the Party receiving it. Both Parties
may act in either capacity.

---

## 1. Purpose

1.1 The Parties wish to exchange information in connection with the assessment, preparation,
performance and follow-up of AI-assisted penetration testing services provided by AssistSec in
respect of the Customer's web applications and APIs (the **"Purpose"**).

1.2 This Agreement applies to information exchanged before, during and after any engagement,
including information exchanged during scoping discussions that do not lead to an engagement.

---

## 2. Confidential Information

2.1 **"Confidential Information"** means all information disclosed by or on behalf of the Discloser
to the Recipient in connection with the Purpose, in any form, whether or not marked as confidential,
and whether disclosed orally, in writing, electronically, through the Portal, or by
demonstration.

2.2 Confidential Information expressly includes, without limitation:

(a) **Credentials** — usernames, passwords, tokens, session material, certificates, private keys,
multi-factor seeds and any other authentication material, including test account credentials;

(b) **API keys** — keys, secrets, client identifiers and any other API authentication or
authorization material;

(c) **Security findings** — vulnerabilities, weaknesses, misconfigurations, exploitation paths,
proof-of-concept material, evidence, and the fact that a particular vulnerability exists or existed;

(d) **Vulnerability information** — severity assessments, CVSS v3.1 scores, exploitability
assessments, and remediation recommendations;

(e) **Reports** — all reports and report versions, including `0.1 Draft`, `0.2 Customer Review` and
`1.0 Final` versions, and all extracts and derivatives of them;

(f) **Customer business information** — commercial, financial, organisational, personnel and
strategic information;

(g) **Technical information** — architecture, source code, configuration, infrastructure, data
models, endpoints, internal URLs, network information and dependencies;

(h) **Testing information** — scope definitions, authorized targets, testing modes, testing depth,
testing windows, rate limits, WAF configuration, testing objectives, methodology, tooling, and the
existence, timing and results of any test;

(i) **Portal content** — remediation status, progress information, historical trend data,
ISO/IEC 27001:2022-related compliance information and activity logs made available through the
Portal;

(j) **AssistSec internal materials** — AssistSec's testing methodology, AI Engine design and
configuration, prompts, internal notes, raw output and internal AI reasoning; and

(k) any other information exchanged in connection with an engagement that a reasonable person would
understand to be confidential in the circumstances.

2.3 **Heightened sensitivity.** The Parties acknowledge that the categories in Sections 2.2(a),
2.2(b) and 2.2(c) are of heightened sensitivity, because their disclosure could enable a third party
to compromise the Customer's systems. The additional obligations in Sections 6 and 7 apply to them.

2.4 The existence and terms of this Agreement, and the fact that the Parties are in discussions or
in an engagement, are themselves Confidential Information.

---

## 3. Exclusions

3.1 Information is not Confidential Information to the extent the Recipient can demonstrate by
contemporaneous written evidence that it:

(a) was lawfully in the Recipient's possession, without obligation of confidence, before disclosure
by the Discloser;

(b) is or becomes publicly available other than through a breach of this Agreement or of any other
duty of confidence;

(c) is lawfully received from a third party entitled to disclose it, without obligation of
confidence; or

(d) was independently developed by the Recipient without use of or reference to the Discloser's
Confidential Information.

3.2 A vulnerability does not cease to be Confidential Information merely because the underlying
class of vulnerability is publicly documented, or because the affected software component is subject
to a public advisory. What remains confidential is that the vulnerability is or was present in the
Discloser's specific systems.

---

## 4. Obligations of the Recipient

4.1 The Recipient shall:

(a) keep the Confidential Information strictly confidential;

(b) use it solely for the Purpose;

(c) protect it with at least the degree of care it applies to its own confidential information of
similar sensitivity, and in any event with no less than a reasonable degree of care;

(d) not disclose it to any third party except as permitted by Section 5; and

(e) not copy, extract or reproduce it except to the extent necessary for the Purpose.

4.2 The Recipient shall not use the Confidential Information to obtain any commercial advantage
unrelated to the Purpose, nor to attempt to access any system of the Discloser otherwise than as
expressly authorized in writing.

4.3 The Recipient shall notify the Discloser without undue delay upon becoming aware of any actual
or suspected unauthorized disclosure, access, loss or misuse of Confidential Information, and shall
cooperate reasonably in mitigating its effects.

---

## 5. Permitted recipients and access restrictions

5.1 The Recipient may disclose Confidential Information only to those of its employees, officers,
directors, contractors and professional advisers who:

(a) need to know it for the Purpose;

(b) have been informed of its confidential nature; and

(c) are bound by written confidentiality obligations, or by professional duties of confidence, no
less protective than this Agreement.

5.2 The Recipient remains fully responsible for any act or omission of such persons as if it were
its own.

5.3 **Access control at AssistSec.** In respect of Customer Confidential Information held by
AssistSec, AssistSec applies: encryption at rest for sensitive credentials and API keys; role-based
access control (RBAC); tenant isolation of customer and project data; authentication and
multi-factor authentication (MFA) for customer portal access; and audit logging of important
actions.

5.4 **Access control at the Customer.** Reports and Findings describe exploitation paths against
the Customer's own systems, and are the Confidential Information most likely to be retained longest.
The Customer shall hold them on access-controlled systems, restrict access to those who need it for
the Purpose, and not forward them outside that group except as permitted by Section 7.3.

5.5 The description in Section 5.3 reflects AssistSec's practices as at the date of this Agreement
and is not a warranty of absolute security. Any additional technical and organisational measures to
be warranted contractually are: [TO BE COMPLETED BY ASSISTSEC].

---

## 6. Credentials and API keys

6.1 Test credentials and API keys supplied by the Customer shall be used solely to perform
authorized testing within the agreed scope, testing window and testing conditions.

6.2 AssistSec shall not share credentials or API keys outside the personnel and systems necessary
for the engagement, and shall not submit them to an external AI/LLM provider except where strictly
necessary and agreed in writing with the Customer.

6.3 The Customer shall provide credentials only for accounts created for testing purposes, and shall
revoke or rotate them promptly after the end of the engagement.

6.4 AssistSec shall delete or render irrecoverable all Customer credentials and API keys within the
period stated for them in **Schedule B (Retention)**, except where retention is required by law.

---

## 7. Security findings, vulnerability information and reports

7.1 Neither Party shall disclose security findings or vulnerability information relating to the
Customer's systems to any third party without the Customer's prior written consent, except as
required under Section 9.

7.2 AssistSec shall not publish, present, or use in marketing any security finding, vulnerability,
report content, case study, customer name or logo without the Customer's prior written consent.
Any agreed reference or case-study permission is: [TO BE COMPLETED BY ASSISTSEC].

7.3 The Customer may disclose reports internally, and to its auditors, insurers, professional
advisers and regulators, subject to the conditions in Section 5.1. Disclosure to any other third
party — including customers, prospects or the public — requires AssistSec's prior written consent,
which shall not be unreasonably withheld.

**[LEGAL REVIEW]** Section 7.3 restricts the Customer's use of a deliverable it has paid for.
Whether the restriction is commercially acceptable, and whether it is enforceable in a B2B context
under Dutch law, should be confirmed. Consider whether the Customer needs an express right to share
final reports with a named prospective customer or certification body.

7.4 Nothing in this Agreement prevents a Party from making a report required by law to a competent
authority, or from participating in a coordinated vulnerability disclosure process where the
vulnerability lies in third-party software, provided that the Customer's identity and systems are not
disclosed without its consent.

---

## 8. Subprocessors and external AI/LLM providers

8.1 The Customer acknowledges that AssistSec performs AI-assisted testing and that information
relating to an engagement may be processed through external AI or large language model providers.

8.2 AssistSec shall:

(a) impose written confidentiality obligations on such providers that are no less protective than
this Agreement;

(b) remain fully responsible to the Customer for any breach of confidentiality by such providers as
if it were its own; and

(c) on request, inform the Customer which providers are used and where they process data.

8.3 The AI/LLM providers used by AssistSec, their processing locations, their data retention
behaviour, and whether submitted data may be used for model training, are set out in **Schedule A
(AI/LLM subprocessors)** to the Liability and Risk Allocation Terms.

**[LEGAL REVIEW]** Where personal data is involved, these providers are likely to be subprocessors
under Article 28 GDPR, requiring a Data Processing Agreement, a lawful transfer mechanism under
Chapter V GDPR for any processing outside the EEA, and a mechanism for notifying the Customer of
changes to the subprocessor list and for the Customer to object. This section must be aligned with
the Data Processing Agreement rather than substituting for it.

---

## 9. Required disclosure

9.1 If the Recipient is required by law, regulation, court order or a competent authority to
disclose Confidential Information, it may do so, provided that it:

(a) notifies the Discloser promptly in advance, unless legally prohibited from doing so;

(b) discloses only the minimum required; and

(c) uses reasonable efforts, at the Discloser's request and expense, to obtain confidential
treatment of the disclosed information.

---

## 10. Personal data

10.1 Where the exchange of information under this Agreement involves personal data, the Parties
shall comply with the GDPR/AVG and shall conclude a Data Processing Agreement
(_verwerkersovereenkomst_) where one is required.

10.2 This Agreement is not a Data Processing Agreement and does not satisfy Article 28(3) GDPR.

**[LEGAL REVIEW]** Whether a Data Processing Agreement is required for a given engagement, and the
allocation of controller and processor roles, are legal determinations that must be made on the
facts of that engagement.

---

## 11. Retention, return and deletion

11.1 On written request from the Discloser, and in any event within the period stated in
**Schedule B (Retention)** after the end of the engagement or the termination of this Agreement, the
Recipient shall return or irrevocably delete all Confidential Information in its possession, and
confirm this in writing.

11.2 The Recipient may retain Confidential Information to the extent:

(a) required by law or by a professional retention obligation;

(b) contained in routine backup or archival systems that are not readily accessible, provided it is
deleted in the ordinary course of the retention cycle; or

(c) reasonably necessary to evidence the work performed and to defend against claims.

11.3 Confidential Information retained under Section 11.2 remains subject to this Agreement for as
long as it is retained, notwithstanding any expiry of the term.

11.4 AssistSec's retention periods for every category of Confidential Information are set out in
**Schedule B (Retention)**, which is the single source for them across all three documents.

---

## 12. No licence, no warranty

12.1 No intellectual property right or licence is granted by disclosure of Confidential Information.
Ownership of and rights in the reports and other deliverables are governed by the agreement between
the Parties for the relevant engagement, and are: [TO BE COMPLETED BY ASSISTSEC].

12.2 Confidential Information is provided "as is". Neither Party warrants the accuracy or
completeness of Confidential Information disclosed, without prejudice to any warranty given in the
engagement documentation.

---

## 13. Term and survival

13.1 This Agreement takes effect on the date of last signature and continues for
[TO BE COMPLETED BY ASSISTSEC] years, or until terminated by either Party on
[TO BE COMPLETED BY ASSISTSEC] written notice.

13.2 The confidentiality obligations survive for [TO BE COMPLETED BY ASSISTSEC] years after the
later of (i) expiry or termination of this Agreement, and (ii) the last disclosure of Confidential
Information under it.

13.3 In respect of credentials, API keys, security findings and vulnerability information, the
obligations survive for [TO BE COMPLETED BY ASSISTSEC], and in any event for as long as disclosure
could reasonably facilitate compromise of the Customer's systems.

13.4 Information qualifying as a trade secret under the Dutch Trade Secrets Act (_Wet bescherming
bedrijfsgeheimen_) remains protected for as long as it qualifies as such.

**[LEGAL REVIEW]** The appropriate survival period is a commercial decision with legal
consequences. A perpetual obligation may be unenforceable; a short one may leave vulnerability
information unprotected while it is still exploitable. Sections 13.2 and 13.3 deliberately separate
the two.

---

## 14. Remedies

14.1 The Parties acknowledge that damages may not be an adequate remedy for breach of this
Agreement, and that the Discloser may seek injunctive or other interim relief
(_kort geding_) in addition to any other remedy.

14.2 A contractual penalty regime, if any, is: [TO BE COMPLETED BY ASSISTSEC].

**[LEGAL REVIEW]** If a contractual penalty (_boetebeding_) is adopted, its amount, its relationship
to damages, and the court's power of mitigation under Article 6:94 BW must be considered. An
excessive penalty may be reduced.

---

## 15. Applicable law and competent court

15.1 This Agreement is governed by [TO BE COMPLETED BY ASSISTSEC — expected to be Dutch law; to be
confirmed].

15.2 Disputes shall be submitted to [TO BE COMPLETED BY ASSISTSEC — competent court; to be
confirmed].

---

## 16. Miscellaneous

16.1 This Agreement may be amended only in writing, signed by both Parties.

16.2 If a provision is void or annulled, the remainder remains in force and the Parties shall
replace the affected provision with a valid provision approximating its purpose as closely as
possible.

16.3 Neither Party may assign this Agreement without the other's prior written consent.

16.4 This Agreement may be signed in counterparts and by electronic signature.

16.5 **Entire agreement on confidentiality.** This Agreement supersedes any prior confidentiality
agreement or undertaking between the Parties on the same subject matter, including any
confidentiality terms exchanged during scoping.

16.6 **Language.** This Agreement is drawn up in English. If a Dutch translation is provided, the
[TO BE COMPLETED BY ASSISTSEC — English / Dutch] text prevails.

**[LEGAL REVIEW]** The evidential status of the intended electronic signature method should be
checked against the eIDAS Regulation (EU) 910/2014 and Article 3:15a BW.

---

## Schedule B — Retention

The single source for every retention period across these documents. Sections 6.4, 11.1 and 11.4
above, and Section 11.4 of the Liability and Risk Allocation Terms, refer to this schedule rather
than stating their own periods, so that one answer governs.

| Category                                   | Held by   | Retention period               | On expiry        |
| ------------------------------------------ | --------- | ------------------------------ | ---------------- |
| Credentials and API keys                   | AssistSec | [TO BE COMPLETED BY ASSISTSEC] | Deleted          |
| Reports and report versions                | AssistSec | [TO BE COMPLETED BY ASSISTSEC] | Deleted          |
| Finding evidence and proof-of-concept      | AssistSec | [TO BE COMPLETED BY ASSISTSEC] | Deleted          |
| Portal data (status, trends, activity log) | AssistSec | [TO BE COMPLETED BY ASSISTSEC] | Deleted          |
| Confidential Information generally         | Recipient | [TO BE COMPLETED BY ASSISTSEC] | Returned/deleted |

Retention beyond these periods is permitted only on the grounds in Section 11.2.

**[LEGAL REVIEW]** Retention periods interact with statutory retention obligations, the GDPR
storage-limitation principle, and the period during which AssistSec may need evidence to defend a
claim. These three pull in different directions and the balance should be set with counsel.

---

## Register of open items

| #   | Item                                     | Section    |
| --- | ---------------------------------------- | ---------- |
| 1   | AssistSec legal name, form, KvK, address | Parties    |
| 2   | AssistSec authorized signatory           | Parties    |
| 3   | Additional warranted security measures   | 5.5        |
| 4   | Reference / case-study permission        | 7.2        |
| 5   | Ownership of reports and deliverables    | 12.1       |
| 6   | Agreement term and notice period         | 13.1       |
| 7   | General survival period                  | 13.2       |
| 8   | Survival for credentials and findings    | 13.3       |
| 9   | Contractual penalty, if any              | 14.2       |
| 10  | Governing law                            | 15.1       |
| 11  | Competent court                          | 15.2       |
| 12  | Prevailing language                      | 16.6       |
| 13  | Retention periods (five categories)      | Schedule B |

AI/LLM provider details are in Schedule A to the Liability and Risk Allocation Terms.

---

## Signatures

| Party A — AssistSec                      | Party B — Customer                |
| ---------------------------------------- | --------------------------------- |
| Name: [TO BE COMPLETED BY ASSISTSEC]     | Name: ______________________      |
| Position: [TO BE COMPLETED BY ASSISTSEC] | Position: ______________________  |
| Date: ______________________             | Date: ______________________      |
| Signature: ______________________        | Signature: ______________________ |
