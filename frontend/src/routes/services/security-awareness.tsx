import { createFileRoute } from "@tanstack/react-router";
import { AwarenessPage } from "@/components/services/AwarenessPage";
import { SECURITY_AWARENESS } from "@/config/services";

export const Route = createFileRoute("/services/security-awareness")({
  component: () => <AwarenessPage service={SECURITY_AWARENESS} />,
});
