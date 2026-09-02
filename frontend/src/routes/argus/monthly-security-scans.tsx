import { createFileRoute } from "@tanstack/react-router";
import { MonthlySecurityScansPage } from "@/components/argus/MonthlySecurityScansPage";

export const Route = createFileRoute("/argus/monthly-security-scans")({
  component: MonthlySecurityScansPage,
});
