import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/argus/continuous-scanning")({
  component: () => (
    <RoutePage pageKey="argusScanning" path="/argus/continuous-scanning" />
  ),
});
