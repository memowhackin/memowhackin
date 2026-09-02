import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

/** The privacy policy; the text lives in `content/legal/privacyPolicy.*.ts`. */
function PrivacyPolicyPage() {
  return <LegalDocumentPage kind="privacyPolicy" />;
}
