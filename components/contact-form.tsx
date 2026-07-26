"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/providers/toast-provider";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const { toast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to submit message.");
      form.reset();
      setStatus("success");
      toast("Your inquiry has been sent to the Maqbool support team.");
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit message.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-[15px] sm:grid-cols-2">
        <Field label="Full Name *">
          <Input name="full_name" placeholder="Your Name" required />
        </Field>
        <Field label="Email Address *">
          <Input name="email" type="email" placeholder="name@example.com" required />
        </Field>
        <Field label="Phone Number">
          <Input name="phone" type="tel" placeholder="+91 00000 00000" />
        </Field>
        <Field label="Order ID (Optional)">
          <Input name="order_id" placeholder="e.g. NEI-8492" />
        </Field>
      </div>
      <Field label="Subject *">
        <select
          name="subject"
          required
          className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/10"
        >
          <option value="">Select Inquiry Type</option>
          <option value="order">Order Status &amp; Tracking</option>
          <option value="custom">Custom Corporate / Gift Set</option>
          <option value="returns">Returns &amp; Exchange</option>
          <option value="general">General Inquiry</option>
        </select>
      </Field>
      <Field label="Message *">
        <Textarea name="message" placeholder="How can we help you?" required />
      </Field>
      <Button
        type="submit"
        disabled={status === "submitting"}
        className="h-12 w-full rounded bg-forest text-sm hover:bg-forest-light"
      >
        <Send className="mr-2 h-4 w-4" />
        {status === "submitting" ? "Sending..." : "Send Message"}
      </Button>
      {status === "success" && (
        <p role="status" className="mt-3 text-sm font-medium text-forest-light">
          Thank you! Your message has been submitted successfully.
        </p>
      )}
      {status === "error" && <p role="alert" className="mt-3 text-sm font-medium text-red-800">{error}</p>}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-5 block">
      <span className="mb-1.5 block text-[0.85rem] font-semibold">{label}</span>
      {children}
    </label>
  );
}
