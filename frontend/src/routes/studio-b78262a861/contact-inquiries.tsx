import { createFileRoute } from "@tanstack/react-router";
import { InquiriesAdmin } from "@/components/admin/InquiriesAdmin";

export const Route = createFileRoute("/studio-b78262a861/contact-inquiries")({
  component: () => <InquiriesAdmin kind="contact" />,
});
