import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  return (
    <section className="bg-forest py-10 text-white">
      <div className="site-container flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <h2 className="font-heading text-2xl">Subscribe to Our Newsletter</h2>
          <p className="mt-1 text-sm text-[#b3c7c2]">
            Get exclusive offers, new arrivals &amp; Islamic reminders straight to your inbox.
          </p>
        </div>
        <form className="flex w-full max-w-md">
          <Input
            type="email"
            required
            placeholder="Enter your email address"
            aria-label="Email address"
            className="h-11 rounded-r-none border-white bg-white text-[#2b2b2b]"
          />
          <Button className="h-11 rounded-l-none bg-gold px-7 hover:bg-gold-dark">Subscribe</Button>
        </form>
      </div>
    </section>
  );
}
