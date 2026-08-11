import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/about")({
  component: () => <RoutePage pageKey="about" path="/about" />,
});
