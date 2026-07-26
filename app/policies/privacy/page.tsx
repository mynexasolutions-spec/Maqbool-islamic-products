import type { Metadata } from "next";
import { PolicyDocument } from "@/components/customer/policy-document";

export const metadata: Metadata = { title: "Privacy Policy - Maqbool Islamic Products" };

export default function PrivacyPage() {
  return <PolicyDocument title="Privacy Policy" summary="This policy describes the information used to provide your shopping experience, why it is needed, and the choices available to you." sections={[
    { title: "Information we collect", bullets: ["Contact information such as your name, mobile number, email, and delivery address.", "Order, payment-status, return, and customer-support details.", "Device and usage information needed for security, analytics, and reliable operation.", "Preferences you choose to save, such as addresses or marketing consent."] },
    { title: "How information is used", paragraphs: ["Information is used to verify accounts, process and deliver orders, respond to questions, prevent fraud, improve the storefront, meet legal obligations, and send optional communications you have requested."] },
    { title: "Sharing and service providers", paragraphs: ["We share only what is reasonably necessary with providers that help with payments, delivery, customer support, hosting, analytics, and legal compliance. We do not sell personal information. Providers are expected to protect information and use it only for agreed services."] },
    { title: "Storage and security", paragraphs: ["We use reasonable technical and organisational safeguards appropriate to the information processed. Orders are stored securely for fulfilment, while the current demonstration customer profile and saved-address experience remain local to the browser and can be cleared through browser settings."] },
    { title: "Your choices and rights", bullets: ["Correct inaccurate account or delivery information.", "Ask about deletion or access where applicable.", "Withdraw optional marketing consent.", "Clear this demo’s local data using your browser controls."] },
    { title: "Children and changes", paragraphs: ["The storefront is not directed to children who cannot legally enter into a purchase. A parent or guardian should supervise purchases by minors. We may update this policy and will revise the date shown above when material changes are made."] },
  ]} />;
}
