import type { Metadata } from "next";
import { PolicyDocument } from "@/components/customer/policy-document";

export const metadata: Metadata = { title: "Shipping Policy - Maqbool Islamic Products" };

export default function ShippingPage() {
  return <PolicyDocument title="Shipping Policy" summary="This policy outlines order preparation, delivery estimates, shipping charges, and what to do when a parcel is delayed or damaged." sections={[
    { title: "Order processing", paragraphs: ["In-stock orders are generally prepared within 1–3 business days after confirmation. Personalised products, launches, festivals, high-volume periods, and address verification may require additional time."] },
    { title: "Delivery estimates", paragraphs: ["Typical delivery within India takes 3–8 business days after dispatch, depending on the pincode and carrier network. Remote locations can take longer. Estimates are not guarantees and exclude Sundays, public holidays, severe weather, and service disruptions."] },
    { title: "Charges and free shipping", paragraphs: ["Standard shipping charges are shown at checkout. The current storefront offers free standard shipping when the merchandise subtotal reaches ₹999 after eligible adjustments. COD may carry a separate handling charge."] },
    { title: "Tracking", paragraphs: ["When a real order is dispatched, available tracking details are sent using the contact information provided at checkout. Tracking updates can take up to 24 hours to appear after carrier collection."] },
    { title: "Address and delivery attempts", bullets: ["Check the name, phone number, house details, landmark, city, state, and pincode before ordering.", "Contact support immediately if an address needs correction; changes are not guaranteed after dispatch.", "Repeated failed delivery attempts or refusal may result in return-to-origin charges."] },
    { title: "Delays, loss, and damaged parcels", paragraphs: ["If tracking has not moved for an unusual period, or a parcel appears lost or damaged, contact support with the order number. Do not accept visibly tampered packaging when refusal is possible, and retain packaging evidence for any claim."] },
  ]} />;
}
