import type { Metadata } from "next";
import { PolicyDocument } from "@/components/customer/policy-document";

export const metadata: Metadata = { title: "Refund & Return Policy - Maqbool Islamic Products" };

export default function RefundPage() {
  return <PolicyDocument title="Refund & Return Policy" summary="We want every item to arrive in a condition worthy of its purpose. This policy explains return eligibility and what to do if something is wrong." sections={[
    { title: "Return window", paragraphs: ["Eligible unused items may be requested for return within 7 days of recorded delivery. Please keep original packaging, labels, accessories, gifts, and proof of purchase until the request is resolved."] },
    { title: "Eligible returns", bullets: ["An incorrect product or variant was delivered.", "The item arrived damaged, defective, or incomplete.", "An unused eligible product is returned in original saleable condition within the return window."] },
    { title: "Items that cannot be returned", bullets: ["Opened fragrances, hygiene-sensitive items, or products with broken seals.", "Personalised, engraved, made-to-order, or final-sale items.", "Items damaged through misuse, washing, alteration, or improper storage.", "Products missing their original packaging, parts, or proof of purchase."] },
    { title: "Reporting damage or an incorrect item", paragraphs: ["Contact us promptly with your order number and clear photos or an unedited opening video showing the shipping label, outer package, and issue. This helps us assess damage and coordinate replacement or return pickup."] },
    { title: "Refund timing", paragraphs: ["Approved refunds are sent to the original payment method where possible. Bank or payment-provider processing may take additional business days after we issue the refund. COD refunds may require verified bank or UPI details supplied through an authorised support channel."] },
    { title: "Cancellations and exchanges", paragraphs: ["Cancellation is possible only before dispatch. Once shipped, the normal return process applies. Variant exchanges depend on stock and may require a fresh order; any price difference or applicable shipping charge will be explained before confirmation."] },
  ]} />;
}
