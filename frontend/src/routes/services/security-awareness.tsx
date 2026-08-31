import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/services/ServicePage";
import { SECURITY_AWARENESS } from "@/config/services";

export const Route = createFileRoute("/services/security-awareness")({
  component: () => <ServicePage service={SECURITY_AWARENESS} />,
});
