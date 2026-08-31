import { createFileRoute } from "@tanstack/react-router";
import { LiveInsightsPage } from "@/components/argus/LiveInsightsPage";

export const Route = createFileRoute("/argus/insights")({
  component: LiveInsightsPage,
});
