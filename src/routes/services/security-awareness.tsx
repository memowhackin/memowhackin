import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/services/security-awareness")({
  component: () => (
    <RoutePage
      pageKey="servicesAwareness"
      path="/services/security-awareness"
    />
  ),
});
