import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/knowledge-base")({
  component: () => <RoutePage pageKey="knowledgeBase" path="/knowledge-base" />,
});
