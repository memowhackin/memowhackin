import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/argus/compliance")({
  component: () => (
    <RoutePage pageKey="argusCompliance" path="/argus/compliance" />
  ),
});
