import { gap, list, mail, note, p, route, type LegalDocument } from "./types";

/*
 * Terms for the website and the free scanner — the two things a visitor can
 * use without signing anything. Paid engagements and the ARGUS portal are
 * governed by their own agreements, and these terms say so rather than
 * attempting to cover them.
 */

const CONTACT = mail("contact@assistsec.nl", "contact@assistsec.nl");

export const termsOfServiceEn: LegalDocument = {
  kind: "termsOfService",
  locale: "en",
  title: "Terms of Service",
  lede: "The terms that apply when you use assistsec.nl and the free exposure scanner. Penetration tests, subscriptions and the ARGUS portal are governed by a separate written agreement.",
  updatedAt: "2026-09-02",
  version: "1.0",
  gaps: {
    legalEntity: "full legal name and legal form of the company (e.g. B.V.)",
    chamberOfCommerce: "Chamber of Commerce (KvK) number",
    vatNumber: "VAT identification number",
    address: "registered office / business address",
    generalTerms:
      "whether separate general terms and conditions apply to paid services, and where they can be found",
    portalTerms:
      "link to the terms of use of the ARGUS customer portal (scanner.assistsec.nl)",
    liabilityCap:
      "the amount to which liability is limited where it cannot be excluded",
    competentCourt: "the competent court (e.g. the District Court of …)",
    prevailingLanguage:
      "which language version prevails if the English and Dutch texts differ",
  },
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      blocks: [
        p(
          "These terms are those of ",
          gap("legalEntity"),
          ", trading as AssistSec, registered with the Dutch Chamber of Commerce under number ",
          gap("chamberOfCommerce"),
          ", VAT number ",
          gap("vatNumber"),
          ", with its registered office at ",
          gap("address"),
          '. In these terms, "we", "us" and "AssistSec" refer to that company, and "you" to anyone who uses the website or the scanner.',
        ),
        p("You can reach us at ", CONTACT, "."),
      ],
    },
    {
      id: "applicability",
      title: "When these terms apply",
      blocks: [
        p(
          "These terms apply to your use of the website at assistsec.nl, including its Dutch version at assistsec.nl/nl, and of the free digital exposure scanner at ",
          route("assistsec.nl/security-scan", "/security-scan"),
          ". By using the website or the scanner you accept them. If you do not agree, do not use them.",
        ),
        p("These terms do not govern:"),
        list(
          [
            "our paid services: penetration tests, monthly scans and other engagements. Those are performed under a written agreement with the customer, which sets out the scope, the systems to be tested, the test period, the price and the applicable conditions. That agreement is normally accompanied by an authorisation-to-test and indemnity letter and a non-disclosure agreement. ",
            gap("generalTerms"),
            ".",
          ],
          [
            "the ARGUS customer portal at scanner.assistsec.nl, to which the login, demo and registration links on this site lead. Use of the portal is governed by the customer agreement and the portal's own terms of use: ",
            gap("portalTerms"),
            ".",
          ],
        ),
        p(
          "Where such an agreement and these terms conflict, the agreement prevails. If you are a consumer, nothing in these terms limits rights you have under mandatory law.",
        ),
      ],
    },
    {
      id: "website",
      title: "Using the website",
      blocks: [
        p(
          "The website describes our services and publishes articles about security. Its content is provided for general information. It is not legal, security or other professional advice, and it is not an offer: the terms of any engagement are agreed in writing. Interface examples shown on the site, such as portal screens, are illustrations and may use sample data.",
        ),
        p(
          "We may change, suspend or discontinue any part of the website at any time without notice. We aim to keep the site available and accurate but do not guarantee either.",
        ),
        p("When using the website you must not:"),
        list(
          ["use it for any unlawful purpose or in breach of these terms;"],
          [
            "attempt to gain access to parts of the site or its systems that are not intended for you, including the administrative area, which is for AssistSec staff only;",
          ],
          [
            "attack, probe, overload or otherwise interfere with the site, its API or the infrastructure it runs on;",
          ],
          [
            "extract content at scale by automated means, other than through the RSS feed and sitemap we publish for that purpose;",
          ],
          [
            "misrepresent your identity or your authority to act for someone else.",
          ],
        ),
        note(
          "Found a security issue in our own website? We would like to hear about it. Write to ",
          CONTACT,
          " with what you found, and give us a reasonable time to fix it before disclosing it.",
        ),
      ],
    },
    {
      id: "scanner",
      title: "The free exposure scanner",
      blocks: [
        p(
          "The scanner lets you enter a website domain and receive an overview of its publicly visible security exposure. This section sets out what it is, who may use it and what you may expect of its results.",
        ),
      ],
      subsections: [
        {
          id: "scanner-nature",
          title: "What the scanner is, and is not",
          blocks: [
            p(
              "The scanner is an automated, passive review of information that anyone on the internet can observe about a domain: DNS and e-mail authentication records, the TLS certificate, HTTP response headers, hostnames published in Certificate Transparency logs, registered lookalike domains, well-known files and the technologies a site announces. It sends no attack traffic, does not log in, does not test business logic and does not attempt to exploit anything.",
            ),
            p(
              "The scanner is not a penetration test, a security audit or a compliance assessment, and its output is not a certification of any kind. It is a first, free look at the outside of a domain. A full assessment of a web application or API is what our paid services are for.",
            ),
          ],
        },
        {
          id: "scanner-authorisation",
          title: "Domains you may scan",
          blocks: [
            p(
              "You may only submit domains that you own or administer, or for which you have the owner's permission to carry out such a review. Submitting a domain confirms that this is the case.",
            ),
            p(
              "Using the scanner to gather information about an organisation or person without their authority is not permitted, even though the information it collects is publicly observable. We may refuse or remove scans and block access where we suspect misuse.",
            ),
          ],
        },
        {
          id: "scanner-fair-use",
          title: "Availability and fair use",
          blocks: [
            p(
              "The scanner is offered free of charge and as available. We limit the number of scans per connection (currently eight per ten minutes), refuse domains that resolve to private or internal addresses, and may throttle, refuse or withdraw the service at any time, temporarily or permanently, without notice or liability. Repeated submission of the same domain within a short period returns the scan already running rather than starting a new one.",
            ),
          ],
        },
        {
          id: "scanner-results",
          title: "Results",
          blocks: [
            p(
              "A report describes the domain as it appeared to us at the moment of the scan. It can be incomplete: some checks may time out, be blocked or be undetermined, and the report says so where that happened. Each finding carries a confidence level; findings marked as possible may be false positives and must be verified by a person before anyone acts on them. A report with few or no findings is not evidence that a domain is secure.",
            ),
            p(
              "The score and the findings are informational. You decide what to do with them, and you are responsible for verifying a finding before acting on it. We do not notify the owner of a scanned domain, and we do not monitor a domain after a scan.",
            ),
          ],
        },
        {
          id: "scanner-links",
          title: "Report links and sharing",
          blocks: [
            p(
              "A report is reachable by anyone who holds its link for as long as it is retained (currently 72 hours, after which it expires). The link is the only thing protecting the report, so you are responsible for whom you share it with. The hostnames a report lists come from public certificate logs; details that would shorten an attack are removed before storage. How reports are stored and for how long is described in our ",
              route("Privacy Policy", "/privacy-policy"),
              ".",
            ),
          ],
        },
        {
          id: "scanner-unlock",
          title: "Unlocking a full report",
          blocks: [
            p(
              "To see every finding in a report, we ask for your name, company, job title and work e-mail address. You must provide details that are accurate and your own, and use a company address. By submitting them you agree that we may contact you about our services following your scan; you can tell us at any time that you do not want that. How we handle these details is described in our ",
              route("Privacy Policy", "/privacy-policy"),
              ".",
            ),
          ],
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      blocks: [
        p(
          "The website, its design, texts, images, articles and the structure and presentation of scan reports are protected by intellectual property rights that belong to AssistSec or its licensors. The names and logos of partners and certification bodies shown on the site belong to their respective owners.",
        ),
        p(
          "You may read and print the content for your own use, link to our pages, and quote short passages with attribution and a link to the source. You may use a scan report of your own domain within your organisation for the purpose of improving its security. Any other reproduction, distribution or commercial use of our content requires our prior written permission.",
        ),
      ],
    },
    {
      id: "third-parties",
      title: "Third-party links and services",
      blocks: [
        p(
          "The site links to services we do not control, including the ARGUS portal, LinkedIn and YouTube, and loads web fonts from Google. We are not responsible for the content, availability or practices of third-party services. Their own terms and privacy notices apply when you use them.",
        ),
      ],
    },
    {
      id: "disclaimer",
      title: "No warranty",
      blocks: [
        p(
          'The website and the scanner are provided "as is" and "as available". To the extent permitted by law, we give no warranty, express or implied, as to their availability, accuracy, completeness or fitness for a particular purpose. A security assessment can never guarantee that every vulnerability is found, and the scanner in particular looks only at the outside of a domain at one moment in time. Our obligation in providing them is one of reasonable effort, not of result.',
        ),
      ],
    },
    {
      id: "liability",
      title: "Liability",
      blocks: [
        p(
          "To the extent permitted by Dutch law, we are not liable for any damage arising from the use of, or the inability to use, the website or the scanner, or from reliance on their content or results. This includes indirect and consequential damage, such as lost profit, lost data, business interruption and damage resulting from decisions taken on the basis of a report.",
        ),
        p(
          "Nothing in these terms excludes or limits our liability for damage caused by our intent or deliberate recklessness, or any other liability that cannot be excluded by law. Where our liability cannot be excluded but may be limited, it is limited to ",
          gap("liabilityCap"),
          ".",
        ),
      ],
    },
    {
      id: "your-responsibility",
      title: "Your responsibility",
      blocks: [
        p(
          "You are responsible for your use of the website and the scanner, including for having the authority to scan the domains you submit and for what you do with the results. You will compensate us for damage and reasonable costs, including legal costs, arising from claims by third parties that result from your breach of these terms, in particular from scanning a domain without authority.",
        ),
      ],
    },
    {
      id: "suspension",
      title: "Suspension of access",
      blocks: [
        p(
          "We may block or restrict access to the website or the scanner for anyone who breaches these terms or whose use we reasonably consider harmful, without prior notice and without liability. We may also remove scans and their reports.",
        ),
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      blocks: [
        p(
          "We may change these terms. The date and version at the top show the current text, and the version published on the site at the time you use it is the one that applies. Where a change is material, we will draw attention to it on the site.",
        ),
      ],
    },
    {
      id: "law",
      title: "Governing law and disputes",
      blocks: [
        p(
          "These terms and any dispute arising from the use of the website or the scanner are governed by the laws of the Netherlands. Disputes are submitted to ",
          gap("competentCourt"),
          ", unless mandatory law gives you the right to bring the dispute before another court. We prefer to resolve disagreements by talking first; contact us before taking any other step.",
        ),
        p(
          "These terms are published in English and in Dutch. If the two versions differ, ",
          gap("prevailingLanguage"),
          ". If any provision of these terms is held to be invalid, the remaining provisions continue to apply and the invalid provision is replaced by a valid one that comes closest to its purpose.",
        ),
      ],
    },
    {
      id: "contact-us",
      title: "Contact",
      blocks: [
        p(
          "Questions about these terms can be sent to ",
          CONTACT,
          " or to our postal address: ",
          gap("address"),
          ".",
        ),
      ],
    },
  ],
};
