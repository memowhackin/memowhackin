import { createFileRoute } from "@tanstack/react-router";
import { LiveChatPage } from "@/components/argus/LiveChatPage";

export const Route = createFileRoute("/argus/expert-chat")({
  component: LiveChatPage,
});
