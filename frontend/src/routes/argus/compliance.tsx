import { createFileRoute } from "@tanstack/react-router";
import { CompliancePage } from "@/components/argus/CompliancePage";

export const Route = createFileRoute("/argus/compliance")({
  component: CompliancePage,
});
