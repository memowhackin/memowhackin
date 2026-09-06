import {
  anchor,
  external,
  gap,
  list,
  mail,
  note,
  p,
  records,
  route,
  type LegalDocument,
} from "./types";

/*
 * Every statement below describes something this repository actually does —
 * the scanner's storage and retention come from `backend/src/scanner`, the
 * contact form from `routes/contact.tsx`, the fonts from `index.html`, the
 * absence of analytics and cookies from the fact that nothing in `src/` sets
 * any. Where the law requires a fact the code does not carry, the text says
 * so with a `gap` rather than guessing.
 */

const CONTACT = mail("contact@assistsec.nl", "contact@assistsec.nl");

export const privacyPolicyEn: LegalDocument = {
  kind: "privacyPolicy",
  locale: "en",
  title: "Privacy Policy",
  lede: "How AssistSec handles personal data when you visit assistsec.nl, use the free exposure scanner or get in touch. Written to match what this website actually does, in plain language.",
  updatedAt: "2026-09-02",
  version: "1.0",
  gaps: {
    legalEntity: "full legal name and legal form of the company (e.g. B.V.)",
    chamberOfCommerce: "Chamber of Commerce (KvK) number",
    address: "registered office / business address",
    dpo: "whether a data protection officer has been appointed, and their contact details",
    hostingProvider:
      "name and location of the hosting and infrastructure provider(s)",
    logRetention: "retention period of server and access logs",
    mailProvider: "name and location of the e-mail provider",
    contactRetention: "retention period for enquiries received by e-mail",
    scanRetentionProduction:
      "confirmation of the report retention period configured in production",
    scanPurge:
      "schedule on which expired scan records are actually deleted (no automated purge is configured yet)",
    leadRetention:
      "retention period for the business details left to unlock a report",
    newsletterField:
      "decision on the newsletter field on blog articles: connect it to a mailing service and describe that processing here, or remove the field",
    portalPrivacyNotice:
      "link to the privacy notice of the ARGUS customer portal (scanner.assistsec.nl)",
    aiProviders:
      "the AI/LLM providers used in pentest engagements and the terms under which they process customer data (relevant to customer agreements, referenced here for completeness)",
  },
  sections: [
    {
      id: "who-we-are",
      title: "Who we are and how to reach us",
      blocks: [
        p(
          "AssistSec is a Dutch cybersecurity company. We carry out penetration tests on web applications and APIs, combining the judgement of experienced pentesters with an AI-assisted testing engine. This policy is issued by ",
          gap("legalEntity"),
          ", registered with the Dutch Chamber of Commerce under number ",
          gap("chamberOfCommerce"),
          ", with its registered office at ",
          gap("address"),
          ". For the processing described in this policy, we are the controller within the meaning of the General Data Protection Regulation (GDPR).",
        ),
        records(
          {
            term: "Website",
            detail: [
              "assistsec.nl (English) and assistsec.nl/nl (Dutch). Each language is a separate build of the same site.",
            ],
          },
          { term: "E-mail", detail: [CONTACT] },
          { term: "Data protection officer", detail: [gap("dpo")] },
        ),
      ],
    },
    {
      id: "scope",
      title: "What this policy covers",
      blocks: [
        p(
          "This policy applies to the public website, to the free digital exposure scanner at ",
          route("assistsec.nl/security-scan", "/security-scan"),
          ", and to the communication you have with us through the site or by e-mail.",
        ),
        p("It does not apply to:"),
        list(
          [
            "the ARGUS customer portal at scanner.assistsec.nl, which the login, demo and registration links on this site lead to. The portal is a separate service with its own privacy notice: ",
            gap("portalPrivacyNotice"),
            ".",
          ],
          [
            "personal data we process while performing a penetration test or other engagement for a customer. That processing is governed by the engagement agreement and, where we act as a processor, by a data processing agreement.",
          ],
        ),
        note(
          "This website uses Google Analytics to count visits, and only after you have agreed to it. It carries no advertising, builds no profiles across other websites, and we do not sell or rent personal data. If you refuse, or have not answered yet, no analytics script is loaded and nothing is stored in your browser.",
        ),
      ],
    },
    {
      id: "processing",
      title: "What we process, why, and for how long",
      blocks: [
        p(
          "The website does a small number of things. Each is described below with the data involved, the purpose, the legal basis under Article 6 GDPR and how long the data is kept.",
        ),
      ],
      subsections: [
        {
          id: "visiting",
          title: "Visiting the website",
          blocks: [
            p(
              "The site is delivered as pre-rendered pages. Like every website, it is served by infrastructure that keeps technical logs of the requests it receives.",
            ),
            records(
              {
                term: "Data",
                detail: [
                  "IP address, browser and device characteristics, the pages requested, the referring page and the time of the request, as recorded in the server logs of the infrastructure that serves the site.",
                ],
              },
              {
                term: "Purpose",
                detail: [
                  "Delivering the pages you ask for, keeping the site available and secure, detecting abuse and diagnosing faults.",
                ],
              },
              {
                term: "Legal basis",
                detail: [
                  "Our legitimate interest in operating a secure, reliable website (Article 6(1)(f) GDPR).",
                ],
              },
              { term: "Retention", detail: [gap("logRetention")] },
              {
                term: "Recipients",
                detail: ["Our hosting provider: ", gap("hostingProvider"), "."],
              },
            ),
          ],
        },
        {
          id: "fonts",
          title: "Web fonts",
          blocks: [
            p(
              "The site's typefaces (Inter and Geist Mono) are loaded from Google Fonts. When your browser fetches them it connects to servers of Google LLC, which receives your IP address and the technical details of the request. Google states that Fonts requests are not used to set cookies or to build advertising profiles.",
            ),
            records(
              {
                term: "Legal basis",
                detail: [
                  "Our legitimate interest in consistent, fast-loading typography (Article 6(1)(f) GDPR).",
                ],
              },
              {
                term: "Transfer",
                detail: [
                  "Google LLC is established in the United States and is certified under the EU-U.S. Data Privacy Framework. See also ",
                  anchor("Transfers outside the EEA", "transfers"),
                  ".",
                ],
              },
            ),
          ],
        },
        {
          id: "contact",
          title: "Contacting us",
          blocks: [
            p(
              "The contact form on ",
              route("assistsec.nl/contact", "/contact"),
              " does not send anything to our servers. When you submit it, it opens a message in your own e-mail program, addressed to us and containing the name, e-mail address, company, chosen service and message you typed. Nothing is stored by the website itself; the message only reaches us when you send it.",
            ),
            records(
              {
                term: "Data",
                detail: [
                  "Your name, e-mail address, company (if given), the service you asked about and the content of your message, plus the technical e-mail headers.",
                ],
              },
              {
                term: "Purpose",
                detail: [
                  "Answering your question and, where relevant, preparing a proposal.",
                ],
              },
              {
                term: "Legal basis",
                detail: [
                  "Taking steps at your request prior to entering into a contract (Article 6(1)(b) GDPR), or otherwise our legitimate interest in responding to enquiries (Article 6(1)(f)).",
                ],
              },
              { term: "Retention", detail: [gap("contactRetention")] },
              {
                term: "Recipients",
                detail: ["Our e-mail provider: ", gap("mailProvider"), "."],
              },
            ),
          ],
        },
        {
          id: "scanner",
          title: "The free exposure scanner",
          blocks: [
            p(
              "On ",
              route("assistsec.nl/security-scan", "/security-scan"),
              " you can enter a website domain and receive an overview of its publicly visible security exposure. The scan is passive: it looks only at what anyone on the internet can observe about the domain. We do not send attack traffic, we do not log in, and we do not test business logic.",
            ),
            p("What the scan looks at:"),
            list(
              [
                "DNS records, including DNSSEC and certificate authority authorisation (CAA).",
              ],
              ["The TLS certificate and handshake of the domain."],
              [
                "HTTP response headers and the flags on cookies the site sets (security headers, HTTPS redirects, HSTS).",
              ],
              ["E-mail authentication records: SPF, DMARC and MTA-STS."],
              [
                "Hostnames published for the domain in public Certificate Transparency logs.",
              ],
              [
                "Registered domains that resemble the domain (lookalikes), and whether they can receive mail.",
              ],
              [
                "Well-known files the site publishes (robots.txt, security.txt and similar), directory listings, the images on the homepage and the technologies the site announces about itself.",
              ],
            ),
            records(
              {
                term: "Data we store",
                detail: [
                  "The domain you entered, encrypted at rest (AES-256-GCM) together with a keyed fingerprint that is used only to recognise a repeat request for the same domain within five minutes; the status of the scan; the results, being observations about the domain as listed above with sensitive evidence such as paths and version banners removed; the language of the page you used; and timestamps.",
                ],
              },
              {
                term: "Data we do not store",
                detail: [
                  "Your IP address is not written to the scan record. It is used only in memory to limit the number of scans per connection (eight per ten minutes) and is not retained. The scan is not linked to an account or to you; nobody signs in to run one.",
                ],
              },
              {
                term: "Purpose",
                detail: [
                  "Producing the report you asked for and showing it to whoever holds its link.",
                ],
              },
              {
                term: "Legal basis",
                detail: [
                  "Performance of the service you request (Article 6(1)(b) GDPR). A domain name is normally information about an organisation rather than a person; where it identifies a natural person, we rely on our legitimate interest in providing the check you asked for (Article 6(1)(f)).",
                ],
              },
              {
                term: "Retention",
                detail: [
                  "A report is readable for 72 hours after it is created (",
                  gap("scanRetentionProduction"),
                  "). After that the link answers that the report has expired. Expired records are deleted: ",
                  gap("scanPurge"),
                  ".",
                ],
              },
              {
                term: "Who can read the report",
                detail: [
                  "Anyone who has the link. The report identifier is random and appears nowhere else, but the link is the only protection, so treat it as you would the report itself.",
                ],
              },
            ),
            p(
              "To perform the scan, our servers send the domain name to a number of third parties: public DNS resolvers, the web servers of the domain itself, the Certificate Transparency search services crt.sh and Cert Spotter (SSLMate, Inc., United States) and the HackerTarget host search (HackerTarget, Australia). These parties receive the domain name and the address of our server, not yours.",
            ),
            p(
              "Only scan domains you own or are authorised to assess; see our ",
              route("Terms of Service", "/terms-of-service"),
              ". The hostnames a report lists are taken from public certificate logs and are already public. Evidence that would shorten an attack, such as readable paths and version banners, is removed before anything is stored.",
            ),
            p(
              "The scanner has also been built to produce personal e-mail exposure reports, delivered through a single-use link sent to the address concerned. That service is not available at present. Should we offer it, we will describe the processing in this policy first.",
            ),
          ],
        },
        {
          id: "unlock",
          title: "Unlocking a full report",
          blocks: [
            p(
              "A website report shows its headline findings to everyone. To see every finding, we ask for your work details. This is a commercial choice on our part, not a security measure: the report concerns the public exposure of a domain, and the details you leave tell us who is interested in our services.",
            ),
            records(
              {
                term: "Data",
                detail: [
                  "Your name, company, job title and work e-mail address, together with the identifier of the scan and the time you submitted the form. Personal webmail addresses are refused; a company address is required.",
                ],
              },
              {
                term: "Purpose",
                detail: [
                  "Giving you access to the complete report, and contacting you about our services following your scan.",
                ],
              },
              {
                term: "Legal basis",
                detail: [
                  "Your consent, given by choosing to provide the details (Article 6(1)(a) GDPR), which you can withdraw at any time; and our legitimate interest in following up business enquiries (Article 6(1)(f)). You can object to follow-up at any time by writing to ",
                  CONTACT,
                  ".",
                ],
              },
              {
                term: "Storage",
                detail: [
                  "Stored in readable form in our database and visible to authorised AssistSec staff in our content management system. The details outlive the scan they belong to.",
                ],
              },
              { term: "Retention", detail: [gap("leadRetention")] },
              {
                term: "Recipients",
                detail: [
                  "Nobody outside AssistSec, other than the hosting provider that runs our database.",
                ],
              },
            ),
            p(
              "So that the report stays unlocked while you keep it open, your browser records a flag in session storage under the name scanner:unlocked followed by the scan identifier. It contains no personal data and is discarded when you close the tab.",
            ),
          ],
        },
        {
          id: "blog",
          title: "Blog, feed and sharing",
          blocks: [
            p(
              "Articles are loaded from our own content management system. Reading them involves no data beyond the technical logs described under ",
              anchor("Visiting the website", "visiting"),
              ". The same applies to the RSS feed.",
            ),
            p(
              "The share button on an article opens LinkedIn with the article's address; from that point LinkedIn's own privacy policy applies. Copying a link uses your browser's clipboard and sends nothing to us.",
            ),
            p(
              "Articles carry a field to subscribe to a newsletter. At present that field does not transmit or store your address and no newsletter is sent. ",
              gap("newsletterField"),
              ".",
            ),
          ],
        },
        {
          id: "external",
          title: "Links to other services",
          blocks: [
            p(
              "The site links to services we do not operate as part of it: the ARGUS customer portal at scanner.assistsec.nl for logging in, booking a demo and creating an account (",
              gap("portalPrivacyNotice"),
              "), our company pages on LinkedIn and YouTube, and Google Fonts as described above. Once you follow such a link, the privacy notice of that service applies.",
            ),
          ],
        },
        {
          id: "staff",
          title: "Our own editors",
          blocks: [
            p(
              "Articles and scanner leads are managed in an administrative area that only authorised AssistSec staff can sign in to. For those staff we keep a login session, which records the IP address and browser used, and an audit log of the actions they take. This is a security measure for the site; it concerns our own people, not visitors.",
            ),
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies and local storage",
      blocks: [
        p(
          "The public website asks before it stores anything that is not strictly necessary. Until you agree, the only things kept in your browser are the functional items below; the analytics entry appears only after you have said yes.",
        ),
        records(
          {
            term: "Session storage",
            detail: [
              "One functional flag, scanner:unlocked plus the scan identifier, kept by your browser after you unlock a report so it stays unlocked in that tab. Removed when the tab closes. Contains no personal data.",
            ],
          },
          {
            term: "Administrative session cookie",
            detail: [
              "Set only when an AssistSec editor signs in to the administrative area. Visitors never receive it.",
            ],
          },
          {
            term: "Google Fonts",
            detail: ["Sets no cookies."],
          },
          {
            term: "Your analytics choice",
            detail: [
              "One entry in local storage, assistsec.consent.analytics, recording whether you allowed or refused measurement so you are not asked on every page. It is never sent to a server. It is the only thing this site stores before you answer.",
            ],
          },
          {
            term: "Google Analytics",
            detail: [
              "Set only after you allow measurement. Google places its own _ga cookies to recognise a returning browser and to count a visit as one session. Refuse, and none of them are ever set, because the script that would set them is not loaded.",
            ],
          },
        ),
        p(
          "You can change your mind at any time by clearing this site\u2019s data in your browser, which removes your stored choice and makes the question appear again.",
        ),
      ],
    },
    {
      id: "recipients",
      title: "Who receives your data",
      blocks: [
        p(
          "Your data is shared only with the parties needed to run what is described above:",
        ),
        list(
          [
            "our hosting and infrastructure provider, which runs the website, the database and the scanner: ",
            gap("hostingProvider"),
            ";",
          ],
          [
            "our e-mail provider, for messages you send us: ",
            gap("mailProvider"),
            ";",
          ],
          [
            "Google LLC, for the web fonts, as described under ",
            anchor("Web fonts", "fonts"),
            ";",
          ],
          [
            "the DNS resolvers, target web servers and Certificate Transparency services the scanner consults, which receive a domain name only;",
          ],
          [
            "public authorities, where we are legally obliged to provide data or to protect our rights.",
          ],
        ),
        p(
          "Where a provider processes personal data on our behalf, we have a data processing agreement with them. We do not sell personal data, and we do not share it for other parties' marketing.",
        ),
        p(
          "This website does not use artificial intelligence to process data about visitors. Our pentest services do use AI models under human supervision; how customer data is handled in that context is set out in the engagement agreement and data processing agreement with the customer (",
          gap("aiProviders"),
          ").",
        ),
      ],
    },
    {
      id: "transfers",
      title: "Transfers outside the EEA",
      blocks: [
        p(
          "We aim to keep personal data within the European Economic Area. Two exceptions follow from how the site is built:",
        ),
        list(
          [
            "Google LLC (United States) receives your IP address when your browser loads the web fonts. Google is certified under the EU-U.S. Data Privacy Framework, which the European Commission has recognised as providing adequate protection.",
          ],
          [
            "If you allow measurement, Google LLC also receives the pages you view on this site, together with your IP address and browser details, through Google Analytics. This happens under the same Data Privacy Framework certification, and only for as long as your consent stands.",
          ],
          [
            "When you run a scan, the domain name you entered is sent to SSLMate, Inc. (United States) and HackerTarget (Australia) as part of the lookups. These parties receive no data about you.",
          ],
        ),
        p(
          "The location of our hosting provider is stated above: ",
          gap("hostingProvider"),
          ".",
        ),
      ],
    },
    {
      id: "security",
      title: "How we protect data",
      blocks: [
        p(
          "The site and its services are built with the following measures, among others:",
        ),
        list(
          [
            "All traffic to the site and its API is encrypted in transit (HTTPS).",
          ],
          [
            "Scan subjects and scan results are encrypted at rest with AES-256-GCM; the key is kept outside the database.",
          ],
          [
            "Scan reports carry a random identifier, are never cached and are excluded from search engines.",
          ],
          [
            "Requests to the scanner are rate-limited per connection, and domains that resolve to private or internal addresses are refused.",
          ],
          [
            "Access to the administrative area requires a password stored with argon2id, uses server-side sessions that can be revoked, and is protected against cross-site request forgery. Editors' actions are logged.",
          ],
          [
            "The results the scanner stores never contain passwords, in any form, and evidence that would help an attacker is removed before storage.",
          ],
        ),
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      blocks: [
        p("Under the GDPR you have the right to:"),
        list(
          ["access the personal data we hold about you and receive a copy;"],
          ["have inaccurate data corrected and incomplete data completed;"],
          [
            "have your data erased, where there is no longer a reason for us to keep it;",
          ],
          ["restrict processing, in the situations the law provides for;"],
          [
            "receive the data you provided to us in a structured, commonly used format (portability);",
          ],
          [
            "object to processing based on our legitimate interest, and to object at any time to direct marketing;",
          ],
          [
            "withdraw consent you have given, without affecting the lawfulness of processing before the withdrawal.",
          ],
        ),
        p(
          "To exercise any of these rights, write to ",
          CONTACT,
          ". We respond within one month; if a request is complex we may extend that by two months and will tell you so. We may ask you to confirm your identity before acting on a request, so that we do not hand your data to someone else.",
        ),
        p(
          "If you believe we have handled your personal data unlawfully, you can lodge a complaint with the Dutch supervisory authority, the Autoriteit Persoonsgegevens (",
          external(
            "autoriteitpersoonsgegevens.nl",
            "https://www.autoriteitpersoonsgegevens.nl",
          ),
          "). We would appreciate the chance to resolve your concern first.",
        ),
      ],
    },
    {
      id: "children",
      title: "Children",
      blocks: [
        p(
          "This website and its services are aimed at organisations and professionals, not at children. We do not knowingly collect personal data from anyone under 16. If you believe a child has provided us with personal data, contact us and we will delete it.",
        ),
      ],
    },
    {
      id: "automated-decisions",
      title: "Automated decision-making",
      blocks: [
        p(
          "We make no decisions about you based solely on automated processing that have legal or similarly significant effects. The scanner's score describes a domain's technical exposure at one moment; it is informational and says nothing about a person.",
        ),
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        p(
          "We update this policy when the site changes in a way that affects your data, or when the law requires it. The date and version at the top show the current text. Where a change is material, we will draw attention to it on the site.",
        ),
      ],
    },
    {
      id: "contact-us",
      title: "Contact",
      blocks: [
        p(
          "Questions about this policy or about your data can be sent to ",
          CONTACT,
          " or to our postal address: ",
          gap("address"),
          ".",
        ),
      ],
    },
  ],
};
