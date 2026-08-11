import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/common/RoutePage";

export const Route = createFileRoute("/contact")({
  component: () => <RoutePage pageKey="contact" path="/contact" />,
});
