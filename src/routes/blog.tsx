import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/blog")({
  component: () => <RoutePage pageKey="blog" path="/blog" />,
});
