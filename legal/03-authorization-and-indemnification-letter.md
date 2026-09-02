# Authorization and Indemnification Letter

### Engagement-specific authorization to perform security testing

**Document status:** DRAFT TEMPLATE — not for use with customers until reviewed by qualified Dutch
legal counsel.
**Version:** 0.1 Draft

> **This is a draft business document, not legal advice.** Clauses marked **[LEGAL REVIEW]** raise
> issues that must be assessed under Dutch law before this template is used.
>
> **Why this document exists.** Accessing a computer system without authorization is a criminal
> offence in the Netherlands under Article 138ab of the Dutch Criminal Code (_Wetboek van
> Strafrecht_). This letter is the record of the Customer's authorization, and it is what
> distinguishes the testing described here from unlawful access. It must be signed by a person with
> authority to give that authorization, and it must be in place **before** testing begins.
>
> **[LEGAL REVIEW]** The sufficiency of this letter as a defence to criminal or civil liability —
> for AssistSec and for its individual testers — must be confirmed by Dutch counsel. Confirm in
> particular whether the signatory's authority should be evidenced by an extract from the trade
> register (_KvK-uittreksel_) or a power of attorney, and whether individual testers should be
> named.

---

## 1. Parties

**Testing provider**

|                    |                                                                           |
| ------------------ | ------------------------------------------------------------------------- |
| Legal name         | AssistSec, [TO BE COMPLETED BY ASSISTSEC: full legal name and legal form] |
| KvK number         | [TO BE COMPLETED BY ASSISTSEC]                                            |
| Registered address | [TO BE COMPLETED BY ASSISTSEC]                                            |
| Email              | contact@assistsec.nl                                                      |
| Telephone          | [TO BE COMPLETED BY ASSISTSEC]                                            |

**Customer**

|                                       |                        |
| ------------------------------------- | ---------------------- |
| Legal name                            | ______________________ |
| KvK or equivalent registration number | ______________________ |
| Registered address                    | ______________________ |
| Signatory name                        | ______________________ |
| Signatory position                    | ______________________ |
| Email                                 | ______________________ |
| Telephone                             | ______________________ |

---

## 2. Engagement details

|                                   |                                                                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engagement reference              | ______________________                                                                                                                              |
| Service model                     | ☐ One-Off Penetration Test ☐ Monthly Scanning Subscription                                                                                          |
| Subscription term (if applicable) | From ____________ to ____________                                                                                                                   |
| Related agreements                | Liability and Risk Allocation Terms dated ____________; Mutual NDA dated ____________; Data Processing Agreement dated ____________ (if applicable) |

---

## 3. Authorized targets

The Customer authorizes testing of the following, and **only** the following:

| #   | Target name | URL / endpoint | Type (web app / API) | Environment (production / non-production) |
| --- | ----------- | -------------- | -------------------- | ----------------------------------------- |
| 1   |             |                |                      |                                           |
| 2   |             |                |                      |                                           |
| 3   |             |                |                      |                                           |
| 4   |             |                |                      |                                           |

3.1 Any host, URL, endpoint, subdomain, environment or system not listed above is **out of scope**
and is not authorized, including systems that are connected to, depend on, or are reachable from an
authorized target.

3.2 Where an authorized target is hosted by a third party, the relevant provider and the status of
any required notification or consent are recorded in Section 8.

---

## 4. Testing parameters

| Parameter                            | Value                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| **Testing mode**                     | ☐ BLACK-BOX ☐ GREY-BOX                                                               |
| **Testing depth**                    | ☐ QUICK ☐ STANDARD ☐ DEEP                                                            |
| **Testing window — start**           | Date ____________ time ____________ (CET/CEST)                                       |
| **Testing window — end**             | Date ____________ time ____________ (CET/CEST)                                       |
| **Permitted testing hours**          | ☐ Any time ☐ Business hours only ☐ Outside business hours only ☐ Other: ____________ |
| **Rate limit / requests per second** | ____________                                                                         |
| **WAF protections during testing**   | ☐ Remain enabled ☐ Disabled for testing ☐ AssistSec source addresses allowlisted     |
| **Required User-Agent**              | ____________                                                                         |
| **AssistSec source IP addresses**    | ____________                                                                         |
| **Testing objectives**               | ☐ General assessment ☐ Authorization testing ☐ IDOR testing ☐ Other: ____________    |

4.1 The parameters above are the **Testing Conditions**. AssistSec will observe them. The Customer
acknowledges that these parameters limit what can be discovered, and that the limitations described
in the Liability and Risk Allocation Terms apply accordingly — in particular that black-box testing
cannot assess authenticated functionality, that a lower testing depth covers less than a higher one,
that rate limits reduce the volume of testing possible, and that leaving WAF protections enabled may
conceal vulnerabilities in the application behind them.

4.2 **Monthly Scanning Subscription — continuing authorization.** Where the service model is a
Monthly Scanning Subscription, the Customer acknowledges and agrees that this authorization is a
**continuing authorization for repeated access to the authorized targets throughout the subscription
term**, and that AssistSec is authorized to perform each recurring scan within that term without a
further signed authorization, unless and until this letter is revoked under Section 12.

---

## 5. Test accounts

Complete where the testing mode is GREY-BOX.

| #   | Username / identifier | Role or privilege level | Environment | Provided via |
| --- | --------------------- | ----------------------- | ----------- | ------------ |
| 1   |                       |                         |             |              |
| 2   |                       |                         |             |              |
| 3   |                       |                         |             |              |

5.1 The Customer confirms that each account listed is created for testing purposes, that its use for
testing does not breach any third-party terms, and that it will revoke or rotate the credentials
after the testing window ends.

5.2 Credentials shall be transmitted by [TO BE COMPLETED BY ASSISTSEC — secure channel] and never by
unencrypted email.

5.3 Credentials and API keys are Confidential Information under the Mutual NDA and are subject to
the handling obligations in that agreement, including encryption at rest and deletion after the
engagement.

---

## 6. Authorization to test

6.1 The Customer **expressly authorizes** AssistSec, its personnel and its systems to perform
security testing against the authorized targets listed in Section 3, within the testing window and
in accordance with the Testing Conditions in Section 4.

6.2 That authorization extends to activities that are ordinarily part of penetration testing of web
applications and APIs, including reconnaissance, enumeration, discovery of endpoints and parameters,
authentication and authorization testing, input manipulation, and the controlled demonstration of
identified vulnerabilities to the extent necessary to validate them.

6.3 **AI-assisted and automated testing.** The Customer expressly authorizes:

(a) the use of an **AI-powered testing engine** to perform testing activities against the authorized
targets;

(b) the use of **automated tooling and automated request generation**; and

(c) the **processing of information relating to the engagement through external AI or large language
model providers**, subject to the confidentiality obligations in the Mutual NDA.

6.4 The Customer acknowledges that:

(a) human penetration testers direct and monitor the testing, validate findings, filter false
positives, assess severity and approve all customer-facing reports;

(b) the AI engine does not independently guarantee complete or exhaustive security testing; and

(c) the AI/LLM providers used, their processing locations, and their retention and training-use
behaviour are as disclosed at [TO BE COMPLETED BY ASSISTSEC].

6.5 **Not authorized.** This letter does not authorize, and AssistSec shall not perform: standalone
network or infrastructure penetration testing; physical security testing; social engineering;
phishing; testing of mobile applications, thick clients or desktop applications, hardware, IoT, or
OT/ICS environments; Denial-of-Service or Distributed Denial-of-Service testing; deliberately
destructive testing; or testing of anything outside the authorized targets.

---

## 7. Customer representations

The Customer represents and warrants that:

7.1 **Authority to authorize.** The signatory is authorized to bind the Customer and to grant the
authorization in this letter.

7.2 **Ownership or right to test.** The Customer owns each authorized target, or holds a documented
right from the owner sufficient to authorize the testing described here.

7.3 **Accuracy.** The authorized targets, environment types and Testing Conditions stated in this
letter are accurate and complete.

7.4 **Environment disclosure.** The Customer has correctly identified in Section 3 which authorized
targets are production environments and which are not.

7.5 **Backups.** The Customer maintains current, tested and restorable backups of all data and
systems that could be affected by the testing, taken before the testing window begins.

7.6 **No conflicting obligation.** The testing authorized here does not breach any agreement between
the Customer and a third party, including hosting, cloud, platform or software licence terms.

7.7 **Data protection.** The Customer has assessed whether personal data may be processed during the
engagement and has concluded any required Data Processing Agreement with AssistSec.

---

## 8. Third-party authorization

8.1 Where an authorized target is hosted, operated or protected by a third party, the Customer is
responsible for notifying that party and obtaining any consent its terms require.

| Provider type            | Provider name | Notification / consent status                | Reference |
| ------------------------ | ------------- | -------------------------------------------- | --------- |
| Hosting / cloud          |               | ☐ Not required ☐ Notified ☐ Consent obtained |           |
| CDN                      |               | ☐ Not required ☐ Notified ☐ Consent obtained |           |
| WAF / DDoS protection    |               | ☐ Not required ☐ Notified ☐ Consent obtained |           |
| Managed service provider |               | ☐ Not required ☐ Notified ☐ Consent obtained |           |
| Other                    |               | ☐ Not required ☐ Notified ☐ Consent obtained |           |

8.2 The Customer confirms that, to the best of its knowledge, all notifications and consents
required for the authorized testing are in place as recorded above.

**[LEGAL REVIEW]** Several major cloud providers permit testing of a customer's own assets subject
to published conditions, while others require prior notice. The applicable provider policies should
be checked per engagement; this table records the outcome but does not substitute for that check.

---

## 9. Acknowledgment of inherent risks

9.1 The Customer acknowledges that security testing carries inherent risk and may cause increased
load, unexpected application behaviour, error conditions, elevated log volume, security alerting,
degraded performance, creation or modification of test data, state changes within the tested
application, or triggering of automated protective mechanisms such as account lockout, rate limiting
or IP blocking.

9.2 AssistSec does not perform Denial-of-Service or deliberately destructive testing. The risks in
Section 9.1 nevertheless cannot be eliminated entirely.

9.3 Where the Customer has authorized testing against a **production** environment, it does so with
knowledge of these risks and having satisfied itself that the backups referred to in Section 7.5 are
in place.

---

## 10. Emergency and escalation contacts

Available throughout the testing window.

**Customer — primary**

|                  |                        |
| ---------------- | ---------------------- |
| Name             | ______________________ |
| Position         | ______________________ |
| Telephone (24/7) | ______________________ |
| Email            | ______________________ |

**Customer — secondary**

|                  |                        |
| ---------------- | ---------------------- |
| Name             | ______________________ |
| Position         | ______________________ |
| Telephone (24/7) | ______________________ |
| Email            | ______________________ |

**AssistSec — engagement contact**

|                  |                                |
| ---------------- | ------------------------------ |
| Name             | [TO BE COMPLETED BY ASSISTSEC] |
| Telephone (24/7) | [TO BE COMPLETED BY ASSISTSEC] |
| Email            | [TO BE COMPLETED BY ASSISTSEC] |

10.1 **Stop procedure.** Either party may require testing to be suspended immediately by contacting
the other party's emergency contact by telephone, confirmed in writing as soon as practicable.
AssistSec shall suspend testing on such a request without requiring a reason.

10.2 **Critical findings.** Where AssistSec identifies a finding it assesses as critical, it shall
notify the Customer's primary emergency contact within [TO BE COMPLETED BY ASSISTSEC], rather than
waiting for the report.

10.3 **Evidence of compromise.** Where AssistSec encounters indications that an authorized target
is already compromised by a third party, it shall notify the Customer's primary emergency contact
without undue delay and shall await instructions before continuing.

---

## 11. Indemnification and risk allocation

11.1 The Customer shall indemnify, defend and hold harmless AssistSec and its personnel against all
third-party claims, proceedings, losses, damages, fines, costs and reasonable legal fees arising out
of or in connection with:

(a) any inaccuracy in the representations in Section 7, in particular the absence of authority to
authorize testing of an authorized target;

(b) any claim by an owner, operator, hosting provider, cloud provider or other third party relating
to testing performed within the authorized targets, the testing window and the Testing Conditions;

(c) the Customer's failure to notify or obtain consent from a third party under Section 8; and

(d) the Customer's failure to maintain backups under Section 7.5.

11.2 This indemnity does **not** extend to claims to the extent they arise from AssistSec's intent
(_opzet_) or deliberate recklessness (_bewuste roekeloosheid_), or from testing performed by
AssistSec outside the authorized targets, outside the testing window, or in breach of the Testing
Conditions.

11.3 AssistSec's liability in connection with this engagement is limited as set out in the Liability
and Risk Allocation Terms. In the event of conflict between this letter and those Terms on the
subject of liability, [TO BE COMPLETED BY ASSISTSEC — specify which document prevails] prevails.

**[LEGAL REVIEW — ENTIRE SECTION]** The scope and enforceability of this indemnity must be assessed
under Dutch law, including its procedural conditions (notice of claim, conduct of defence, consent
to settlement), its interaction with the liability cap in the Liability and Risk Allocation Terms,
and whether it survives where AssistSec has itself failed to observe the Testing Conditions. A broad
indemnity operating as a disguised exclusion of AssistSec's own liability may not be upheld.

---

## 12. Duration and revocation

12.1 This authorization takes effect on the date of signature and expires at the end of the testing
window or, for a Monthly Scanning Subscription, at the end of the subscription term.

12.2 The Customer may revoke this authorization at any time by written notice to AssistSec's
engagement contact. Revocation takes effect on receipt. AssistSec shall cease testing promptly upon
receipt and shall confirm cessation in writing.

12.3 Revocation does not affect testing already performed, any obligation to pay for work performed,
or the confidentiality obligations under the Mutual NDA.

---

## 13. Applicable law and competent court

13.1 This letter is governed by [TO BE COMPLETED BY ASSISTSEC — expected to be Dutch law; to be
confirmed].

13.2 Disputes shall be submitted to [TO BE COMPLETED BY ASSISTSEC — competent court; to be
confirmed].

---

## Register of open items

| #   | Item                                                      | Section |
| --- | --------------------------------------------------------- | ------- |
| 1   | AssistSec legal name, legal form, KvK, address, telephone | 1       |
| 2   | Secure channel for credential transfer                    | 5.2     |
| 3   | AI/LLM provider disclosure location                       | 6.4(c)  |
| 4   | AssistSec engagement and emergency contact                | 10      |
| 5   | Critical-finding notification deadline                    | 10.2    |
| 6   | Precedence between this letter and the Liability Terms    | 11.3    |
| 7   | Governing law                                             | 13.1    |
| 8   | Competent court                                           | 13.2    |

---

## Signatures

**On behalf of the Customer** — I confirm that I am authorized to grant this authorization, that the
representations in Section 7 are accurate, and that I have read and accept the acknowledgments in
Sections 4, 6 and 9.

|           |                        |
| --------- | ---------------------- |
| Name      | ______________________ |
| Position  | ______________________ |
| Date      | ______________________ |
| Signature | ______________________ |

**On behalf of AssistSec**

|           |                                |
| --------- | ------------------------------ |
| Name      | [TO BE COMPLETED BY ASSISTSEC] |
| Position  | [TO BE COMPLETED BY ASSISTSEC] |
| Date      | ______________________         |
| Signature | ______________________         |
