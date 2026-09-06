import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/terms-of-service")({
  component: () => <LegalPage kind="termsOfService" />,
});
