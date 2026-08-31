import { createFileRoute } from "@tanstack/react-router";
import { MonthlyScansPage } from "@/components/argus/MonthlyScansPage";

export const Route = createFileRoute("/argus/continuous-scanning")({
  component: MonthlyScansPage,
});
