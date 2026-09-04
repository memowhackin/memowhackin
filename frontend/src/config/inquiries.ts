/*
 * Contact and demo requests, posted to the CMS backend.
 *
 * The fourth and last file in `src/` that touches the network, alongside
 * `blog.ts`, `cms.ts` and `scanner.ts`. It is separate from those three for
 * the same reason they are separate from each other: the network surface is
 * meant to be auditable by reading four short files, and a form endpoint has
 * nothing to do with reading posts, administering them or running a scan.
 *
 * Same-origin, like every other call this site makes. `VITE_CMS_API_URL` is
 * empty by default and whatever serves the site proxies `/api` to the backend,
 * so no cross-origin request is ever made.
 */

const API_BASE = (import.meta.env.VITE_CMS_API_URL ?? "").replace(/\/+$/, "");

export type InquiryKind = "contact" | "demo";

export interface Inquiry {
  kind: InquiryKind;
  name: string;
  email: string;
  company?: string;
  /** The chosen service on a contact request, the job title on a demo one. */
  subject?: string;
  phone?: string;
  message?: string;
  consent?: boolean;
  locale: string;
  /**
   * The honeypot. Always empty from a real form; a bot that fills every input
   * it can find puts something here and is quietly dropped server-side.
   */
  website?: string;
}

/**
 * Send one inquiry.
 *
 * Resolves when the server has recorded it (202) and rejects otherwise, so the
 * form can tell the difference between "we have this" and "try again". The
 * server stores the row before it attempts any mail, so a success here means
 * the request is durably held even if the mail provider is having a bad day.
 */
export async function submitInquiry(inquiry: Inquiry): Promise<void> {
  const response = await fetch(`${API_BASE}/api/public/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(inquiry),
  });

  if (!response.ok) {
    throw new Error(`Inquiry failed with ${String(response.status)}`);
  }
}
