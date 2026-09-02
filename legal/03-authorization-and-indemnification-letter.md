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

Capitalised terms not defined in this letter have the meaning given in the Liability and Risk
Allocation Terms between the parties. In particular, **Authorized Targets** means the targets listed
in Section 3 below and nothing else, and **Testing Window** means the period stated in Section 4.

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

|                                                                                                               |                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engagement reference                                                                                          | ______________________                                                                                                                              |
| Service model                                                                                                 | ☐ One-Off Penetration Test ☐ Monthly Scanning Subscription                                                                                          |
| Subscription term — dates only; term, notice and renewal are governed by Section 4.2.5 of the Liability Terms | From ____________ to ____________                                                                                                                   |
| Related agreements                                                                                            | Liability and Risk Allocation Terms dated ____________; Mutual NDA dated ____________; Data Processing Agreement dated ____________ (if applicable) |

---

## 3. Authorized Targets

The Customer authorizes testing of the following, and **only** the following:

| #   | Target name | URL / endpoint | Type (web app / API) | Environment (production / non-production) |
| --- | ----------- | -------------- | -------------------- | ----------------------------------------- |
| 1   |             |                |                      |                                           |
| 2   |             |                |                      |                                           |
| 3   |             |                |                      |                                           |
| 4   |             |                |                      |                                           |

3.1 Any host, URL, endpoint, subdomain, environment or system not listed above is **out of scope**
and is not authorized, including systems that are connected to, depend on, or are reachable from an
Authorized Target.

3.2 Where an Authorized Target is hosted by a third party, the relevant provider and the status of
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

4.1a **Retest window.** Where a retest of previously reported Findings is agreed, it is authorized
only within the window recorded here, and only against Findings in the Report identified below. The
authorization for the original Testing Window does not extend to it.

| Retest authorized | Report / Findings covered | Retest window                     | Testing Conditions                      |
| ----------------- | ------------------------- | --------------------------------- | --------------------------------------- |
| ☐ Yes ☐ No        |                           | From ____________ to ____________ | ☐ As in Section 4 ☐ Other: ____________ |

4.2 **Monthly Scanning Subscription — continuing authorization.** Where the service model is a
Monthly Scanning Subscription, the Customer acknowledges and agrees that this authorization is a
**continuing authorization for repeated access to the Authorized Targets throughout the subscription
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
after the Testing Window ends.

5.2 Credentials shall be transmitted by [TO BE COMPLETED BY ASSISTSEC — secure channel] and never by
unencrypted email.

5.3 Credentials and API keys are Confidential Information under the Mutual NDA and are subject to
the handling obligations in that agreement, including encryption at rest and deletion after the
engagement.

---

## 6. Authorization to test

6.1 The Customer **expressly authorizes** AssistSec, its personnel and its systems to perform
security testing against the Authorized Targets listed in Section 3, within the Testing Window and
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

(a) human penetration testers direct and monitor the testing, and remain responsible for validating
findings, interpreting results, filtering false positives, determining severity and approving all
customer-facing reports;

(b) the AI engine does not independently guarantee complete or exhaustive security testing; and

(c) the AI/LLM providers used, their processing locations, and their retention and training-use
behaviour are as set out in Schedule A (AI/LLM subprocessors) to the Liability and Risk Allocation
Terms.

6.5 **Not authorized.** This letter does not authorize, and AssistSec shall not perform: standalone
network or infrastructure penetration testing; physical security testing; social engineering;
phishing; testing of mobile applications, thick clients or desktop applications, hardware, IoT, or
OT/ICS environments; Denial-of-Service or Distributed Denial-of-Service testing; deliberately
destructive testing; or testing of anything outside the Authorized Targets.

---

## 7. Customer warranties

The Customer warrants that:

7.1 **Authority to authorize.** The signatory is authorized to bind the Customer and to grant the
authorization in this letter.

7.2 **Ownership or right to test.** The Customer owns each Authorized Target, or holds a documented
right from the owner sufficient to authorize the testing described here.

7.3 **Accuracy.** The Authorized Targets, environment types and Testing Conditions stated in this
letter are accurate and complete.

7.4 **Environment disclosure.** The Customer has correctly identified in Section 3 which authorized
targets are production environments and which are not.

7.5 **Backups.** The Customer maintains current, tested and restorable backups of all data and
systems that could be affected by the testing, taken before the Testing Window begins.

7.6 **No conflicting obligation.** The testing authorized here does not breach any agreement between
the Customer and a third party, including hosting, cloud, platform or software licence terms.

7.7 **Data protection.** The parties have jointly assessed whether personal data may be processed
during the engagement, in accordance with Section 11.2 of the Liability Terms, and have concluded any
required Data Processing Agreement. Outcome of that assessment:
☐ Personal data not expected ☐ Personal data expected — DPA dated ____________

---

## 8. Third-party authorization

8.1 Where an Authorized Target is hosted, operated or protected by a third party, the Customer is
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

Available throughout the Testing Window.

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

10.3 **Evidence of compromise.** Where AssistSec encounters indications that an Authorized Target
is already compromised by a third party, it shall notify the Customer's primary emergency contact
without undue delay and shall await instructions before continuing.

---

## 11. Indemnification and risk allocation

11.1 The indemnification given by the Customer, and the limitation of AssistSec's liability, are set
out in Sections 12 and 13 of the Liability and Risk Allocation Terms. They apply to this engagement
in full and are not restated here, so that one text governs and the two documents cannot drift
apart.

11.2 For the avoidance of doubt, the Customer's statements in Section 7 of this letter are
warranties for the purposes of Section 12.1(a) of those Terms.

11.3 Where this letter and the Liability and Risk Allocation Terms conflict, the order of precedence
in Section 1.4 of those Terms applies.

---

## 12. Duration and revocation

12.1 This authorization takes effect on the date of signature and expires at the end of the Testing
Window or, where a retest window is recorded in Section 4.1a, at the end of that retest window. For
a Monthly Scanning Subscription it expires at the end of the subscription term.

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

13.3 **Language.** This letter is drawn up in English. If a Dutch translation is provided, the
[TO BE COMPLETED BY ASSISTSEC — English / Dutch] text prevails.

---

## Register of open items

| #   | Item                                          | Section |
| --- | --------------------------------------------- | ------- |
| 1   | AssistSec legal name, form, KvK, address, tel | 1       |
| 2   | Secure channel for credential transfer        | 5.2     |
| 3   | AssistSec engagement and emergency contact    | 10      |
| 4   | Critical-finding notification deadline        | 10.2    |
| 5   | Governing law                                 | 13.1    |
| 6   | Competent court                               | 13.2    |
| 7   | Prevailing language                           | 13.3    |

Indemnification and liability are governed by the Liability and Risk Allocation Terms; AI/LLM
provider details by Schedule A to those Terms; retention by Schedule B to the Mutual NDA.

---

## Signatures

**On behalf of the Customer** — I confirm that I am authorized to grant this authorization, that the
warranties in Section 7 are accurate, and that I have read and accept the acknowledgments in
Sections 4, 6 and 9.

|                        |                                                                     |
| ---------------------- | ------------------------------------------------------------------- |
| Name                   | ______________________                                              |
| Position               | ______________________                                              |
| Authority evidenced by | ☐ KvK extract dated ____________ ☐ Power of attorney ☐ Not required |
| Date                   | ______________________                                              |
| Signature              | ______________________                                              |

**On behalf of AssistSec**

|           |                                |
| --------- | ------------------------------ |
| Name      | [TO BE COMPLETED BY ASSISTSEC] |
| Position  | [TO BE COMPLETED BY ASSISTSEC] |
| Date      | ______________________         |
| Signature | ______________________         |
