import { createFileRoute } from "@tanstack/react-router";
import { IntegrationsPage } from "@/components/argus/IntegrationsPage";

export const Route = createFileRoute("/argus/integrations")({
  component: IntegrationsPage,
});
