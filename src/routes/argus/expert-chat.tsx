import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/argus/expert-chat")({
  component: () => (
    <RoutePage pageKey="argusExpertChat" path="/argus/expert-chat" />
  ),
});
