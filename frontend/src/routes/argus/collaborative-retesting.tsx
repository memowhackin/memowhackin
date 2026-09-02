import { createFileRoute } from "@tanstack/react-router";
import { CollaborativeRetestingPage } from "@/components/argus/CollaborativeRetestingPage";

export const Route = createFileRoute("/argus/collaborative-retesting")({
  component: CollaborativeRetestingPage,
});
