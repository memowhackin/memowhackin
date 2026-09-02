import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfServicePage,
});

/** The terms of service; the text lives in `content/legal/termsOfService.*.ts`. */
function TermsOfServicePage() {
  return <LegalDocumentPage kind="termsOfService" />;
}
