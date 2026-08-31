import { createFileRoute } from "@tanstack/react-router";
import { RetestPage } from "@/components/argus/RetestPage";

export const Route = createFileRoute("/argus/retesting")({
  component: RetestPage,
});
