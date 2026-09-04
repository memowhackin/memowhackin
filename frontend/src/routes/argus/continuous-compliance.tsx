import { createFileRoute } from "@tanstack/react-router";
import { ContinuousCompliancePage } from "@/components/argus/ContinuousCompliancePage";

export const Route = createFileRoute("/argus/continuous-compliance")({
  component: ContinuousCompliancePage,
});
