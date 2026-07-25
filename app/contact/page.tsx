import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Faq, type FaqItem } from "@/components/faq";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageBanner } from "@/components/layout/page-banner";

export const metadata: Metadata = {
  title: "Contact Us - Maqbool Islamic Products",
};

const faqs: FaqItem[] = [
  {
    question: "How long does domestic shipping take?",
    answer:
      "Standard delivery takes 3 to 5 business days across major cities. Express shipping options are also available at checkout.",
  },
  {
    question: "Are Cash on Delivery (COD) orders available?",
    answer:
      "Yes! We offer Cash on Delivery (COD) for orders up to ₹5,000 across pincodes in India.",
  },
  {
    question: "Can I customize gift hampers for weddings or Islamic events?",
    answer:
      "Absolutley. We offer bespoke gift sets combining custom-embroidered prayer mats, gold-embossed Qurans, and luxury ittars. Please mention your requirements in the contact form above.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <PageBanner title="Get In Touch" current="Contact Us" />
      <main className="site-container">
        <section className="my-[50px] grid gap-6 md:grid-cols-3">
          <InfoCard icon={Phone} title="Call or WhatsApp">
            <p>Mon - Sat: 9:00 AM - 7:00 PM</p>
            <a href="tel:+919876543210" className="font-semibold text-forest">+91 98765 43210</a>
          </InfoCard>
          <InfoCard icon={Mail} title="Email Support">
            <p>We usually respond within 24 hours.</p>
            <a href="mailto:support@nooreiman.com" className="font-semibold text-forest">
              support@nooreiman.com
            </a>
          </InfoCard>
          <InfoCard icon={MapPin} title="Visit Our Store">
            <p>Noor E Iman Flagship Boutique</p>
            <strong className="text-forest">Civil Lines, Market Road, India</strong>
          </InfoCard>
        </section>

        <section className="mb-[70px] grid items-stretch gap-[50px] lg:grid-cols-2">
          <div className="rounded-lg border border-[#f0ebde] bg-white p-[35px] shadow-[0_4px_15px_rgba(0,0,0,.02)]">
            <h1 className="font-heading text-[1.8rem] text-forest">Send Us a Message</h1>
            <p className="mb-6 mt-2 text-sm leading-6 text-muted">
              Have a question regarding bulk orders, custom Quran sets, or shipping? Fill out the
              form below.
            </p>
            <ContactForm />
          </div>
          <div className="min-h-[480px] overflow-hidden rounded-lg border border-[#f0ebde]">
            <iframe
              title="Map showing Aligarh, Uttar Pradesh"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112933.2081191244!2d78.01633512217117!3d27.893710712869153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974a4a15a772f41%3A0x8ddf7375276e0ef7!2sAligarh%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="h-full min-h-[480px] w-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </section>
      </main>
      <section className="border-t border-[#ebdcb9] bg-cream py-[60px]">
        <div className="site-container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <Faq items={faqs} />
        </div>
      </section>
      <Footer />
    </>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Clock;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-[#ebdcb9] bg-cream px-5 py-[30px] text-center transition-all hover:-translate-y-1 hover:border-gold hover:shadow-[0_10px_20px_rgba(15,56,44,.05)]">
      <span className="mx-auto mb-[15px] flex h-[50px] w-[50px] items-center justify-center rounded-full bg-forest text-white">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="font-heading text-xl text-forest">{title}</h2>
      <div className="mt-2 space-y-1 text-sm text-muted">{children}</div>
    </article>
  );
}
