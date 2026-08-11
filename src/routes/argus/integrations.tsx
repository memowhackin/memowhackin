import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/argus/integrations")({
  component: () => (
    <RoutePage pageKey="argusIntegrations" path="/argus/integrations" />
  ),
});
