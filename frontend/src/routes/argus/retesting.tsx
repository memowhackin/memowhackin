import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/argus/retesting")({
  component: () => (
    <RoutePage pageKey="argusRetesting" path="/argus/retesting" />
  ),
});
