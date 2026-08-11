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

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/** The AssistSec landing page, section by section, top to bottom. */
function LandingPage() {
  const { t } = useTranslation();

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
      <BlogHighlights />
      <ClosingCta />
    </div>
  );
}
