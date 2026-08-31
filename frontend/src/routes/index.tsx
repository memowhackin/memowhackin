import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useSeo } from "@/localization/useSeo";
import { SectionStripes } from "@/components/common/SectionStripes";
import { Hero } from "@/components/landing/Hero";
import { PlatformShowcase } from "@/components/landing/PlatformShowcase";
import { AutonomousAgents } from "@/components/landing/AutonomousAgents";
import { Services } from "@/components/landing/Services";
import { WhyAssistSec } from "@/components/landing/WhyAssistSec";
import { Benefits } from "@/components/landing/Benefits";
import { BlogHighlights } from "@/components/landing/BlogHighlights";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { loadBlogPosts, type BlogSummary } from "@/config/blog";

export const Route = createFileRoute("/")({
  /*
   * The articles the blog teaser shows, awaited before the page renders so the
   * prerender pass captures real titles rather than an empty grid — the same
   * reason the blog routes load theirs in a loader.
   *
   * It cannot reject, which is the difference between this loader and the blog
   * index's. There the CMS is the page, so an outage earns an error component;
   * here it is one section out of nine, and the landing page has to stand
   * whether or not the CMS answers. `docker compose build` prerenders with no
   * CMS running at all, and this page is expected to come out of that intact.
   *
   * `loadBlogPosts` does not cache a rejection, so a visitor who lands during
   * an outage still gets a real attempt when they open /blog.
   */
  loader: async (): Promise<readonly BlogSummary[]> => {
    try {
      return await loadBlogPosts();
    } catch {
      return [];
    }
  },
  component: LandingPage,
});

/** The AssistSec landing page, section by section, top to bottom. */
function LandingPage() {
  const { t } = useTranslation();
  const posts = Route.useLoaderData();

  useSeo({
    title: t("pages.home.title"),
    description: t("pages.home.description"),
    path: "/",
  });

  return (
    <div data-testid="landing-page">
      <Hero />
      <PlatformShowcase />
      <SectionStripes />
      <AutonomousAgents />
      <Services />
      <SectionStripes tone="bright" />
      <WhyAssistSec />
      <Benefits />
      <BlogHighlights posts={posts} />
      <ClosingCta />
    </div>
  );
}
