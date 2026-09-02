import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarClock,
  Globe,
  GraduationCap,
  Plug,
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

export type NavItem = NavDropdown | NavRoute;

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
            key: "integrations",
            to: "/argus/integrations",
            labelKey: "nav.argus.integrations",
            descKey: "nav.argus.desc.integrations",
            icon: Plug,
          },
        ],
      },
    ],
  },
  {
    kind: "route",
    key: "knowledgeBase",
    labelKey: "nav.knowledgeBase",
    to: "/knowledge-base",
  },
  { kind: "route", key: "about", labelKey: "nav.about", to: "/about" },
  { kind: "route", key: "contact", labelKey: "nav.contact", to: "/contact" },
  { kind: "route", key: "blog", labelKey: "nav.blog", to: "/blog" },
] as const;
