import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/argus/insights")({
  component: () => <RoutePage pageKey="argusInsights" path="/argus/insights" />,
});
