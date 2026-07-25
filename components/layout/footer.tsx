import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

const columns = [
  {
    title: "Shop",
    links: ["All Products", "Quran", "Prayer Mats", "Ittars & Perfumes", "Islamic Gifts", "Books"],
  },
  {
    title: "Customer Service",
    links: ["Track Order", "Shipping & Delivery", "Returns & Refunds", "FAQ", "Contact Us"],
  },
  {
    title: "About Us",
    links: ["Our Story", "Why Choose Us", "Authenticity", "Careers", "Blog"],
  },
  {
    title: "Information",
    links: ["Terms & Conditions", "Privacy Policy", "Refund Policy", "Shipping Policy"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#ebdcb9] bg-[#f7f6f2] pb-5 pt-[60px]">
      <div className="site-container mb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,.7fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" className="h-10 w-10 fill-forest" aria-hidden="true">
              <path d="M12 2 2 22h20L12 2Zm0 3.99L19.53 19H4.47L12 5.99Z" />
            </svg>
            <span className="font-heading text-xl tracking-wide text-forest">
              MAQBOOL ISLAMIC PRODUCTS
            </span>
          </Link>
          <p className="my-4 max-w-[250px] text-sm text-muted">
            Purify Your Deen. Enrich Your Life.
          </p>
          <div className="flex gap-3">
            {[Facebook, Instagram, Youtube].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label={["Facebook", "Instagram", "YouTube"][index]}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e3dec8] bg-white text-forest transition-colors hover:bg-forest hover:text-white"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
            <a
              href="#"
              aria-label="WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e3dec8] bg-white text-xs font-bold text-forest transition-colors hover:bg-forest hover:text-white"
            >
              W
            </a>
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h5 className="mb-5 text-xs font-bold uppercase tracking-[1px] text-forest">
              {column.title}
            </h5>
            <ul className="space-y-2.5">
              {column.links.map((item) => (
                <li key={item}>
                  <Link
                    href={item === "All Products" ? "/shop" : item === "Contact Us" ? "/contact" : "#"}
                    className="text-sm text-muted hover:text-forest"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="site-container border-t border-[#e6e0d0] pt-5 text-xs text-muted">
        © 2026 Maqbool Islamic Products. All Rights Reserved.
      </div>
    </footer>
  );
}
