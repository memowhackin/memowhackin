import type { LucideIcon } from "lucide-react";
import { knowledgeBaseUrl } from "@/config/site";
import {
  Activity,
  BadgeCheck,
  CalendarClock,
  Globe,
  GraduationCap,
  RefreshCw,
  Webhook,
} from "lucide-react";

/*
 * The primary navigation, as a tree the header renders the same way in every
 * place it appears — the desktop bar, the desktop dropdowns and the mobile
 * panel all read from this. Labels are i18n keys, not text, so the one tree
 * carries both languages; `to` is a real route path, so every item is a page
 * rather than an in-page anchor.
 */

/** A single destination: a route path, a label, a one-line blurb, and an icon. */
export interface NavLeaf {
  key: string;
  to: string;
  labelKey: string;
  descKey: string;
  icon: LucideIcon;
}

/** A titled column of leaves inside a dropdown (e.g. ARGUS' "Features"). */
export interface NavGroup {
  key: string;
  labelKey: string;
  items: readonly NavLeaf[];
}

export interface NavDropdown {
  kind: "dropdown";
  key: string;
  labelKey: string;
  /** `list` is a single slim column; `mega` is the wide panel with an intro rail. */
  layout: "list" | "mega";
  /** Intro-rail blurb, shown beside the items in the `mega` layout. */
  taglineKey?: string;
  groups: readonly NavGroup[];
}

export interface NavRoute {
  kind: "route";
  key: string;
  labelKey: string;
  to: string;
}

/**
 * A destination on another host. Separate from `NavRoute` because it cannot go
 * through the router: `to` is a typed route path, and the knowledge base is a
 * different site.
 */
export interface NavExternal {
  kind: "external";
  key: string;
  labelKey: string;
  href: string;
}

export type NavItem = NavDropdown | NavRoute | NavExternal;

export const NAV_ITEMS: readonly NavItem[] = [
  { kind: "route", key: "home", labelKey: "nav.home", to: "/" },
  {
    kind: "dropdown",
    key: "services",
    labelKey: "nav.services.label",
    layout: "list",
    groups: [
      {
        key: "services",
        labelKey: "nav.services.label",
        items: [
          {
            key: "webApp",
            to: "/services/web-app-pentesting",
            labelKey: "nav.services.webApp",
            descKey: "nav.services.desc.webApp",
            icon: Globe,
          },
          {
            key: "api",
            to: "/services/api-pentesting",
            labelKey: "nav.services.api",
            descKey: "nav.services.desc.api",
            icon: Webhook,
          },
          {
            key: "awareness",
            to: "/services/security-awareness",
            labelKey: "nav.services.awareness",
            descKey: "nav.services.desc.awareness",
            icon: GraduationCap,
          },
        ],
      },
    ],
  },
  {
    kind: "dropdown",
    key: "argus",
    labelKey: "nav.argus.label",
    layout: "mega",
    taglineKey: "nav.argus.tagline",
    groups: [
      {
        key: "features",
        labelKey: "nav.argus.features",
        items: [
          {
            key: "monthly",
            to: "/argus/monthly-security-scans",
            labelKey: "nav.argus.monthly",
            descKey: "nav.argus.desc.monthly",
            icon: CalendarClock,
          },
          {
            key: "retest",
            to: "/argus/collaborative-retesting",
            labelKey: "nav.argus.retest",
            descKey: "nav.argus.desc.retest",
            icon: RefreshCw,
          },
          {
            key: "workspace",
            to: "/argus/live-pentest-workspace",
            labelKey: "nav.argus.workspace",
            descKey: "nav.argus.desc.workspace",
            icon: Activity,
          },
          {
            key: "compliance",
            to: "/argus/continuous-compliance",
            labelKey: "nav.argus.compliance",
            descKey: "nav.argus.desc.compliance",
            icon: BadgeCheck,
          },
        ],
      },
    ],
  },
  /*
   * The knowledge base is a separate site (kennisbank.assistsec.nl), not a page
   * here. The stub that used to sit at /knowledge-base is gone; that address
   * now 301s to the same destination this links to, so an indexed or bookmarked
   * copy of the old URL still lands in the right place and language.
   */
  {
    kind: "external",
    key: "knowledgeBase",
    labelKey: "nav.knowledgeBase",
    href: knowledgeBaseUrl(),
  },
  { kind: "route", key: "about", labelKey: "nav.about", to: "/about" },
  { kind: "route", key: "contact", labelKey: "nav.contact", to: "/contact" },
  { kind: "route", key: "blog", labelKey: "nav.blog", to: "/blog" },
] as const;
