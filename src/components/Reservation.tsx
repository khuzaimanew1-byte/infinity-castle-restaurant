"use client";
import { useState, useRef } from "react";
import { useInView } from "framer-motion";
import { siteSettings } from "@/data/site";

type EventOption = {
  id: string;
  label: string;
  jp: string;
  accent: string;
};

const eventOptions: EventOption[] = [
  { id: "casual",     label: "Casual Dining",  jp: "食事",  accent: "var(--color-lantern)" },
  { id: "birthday",   label: "Birthday",        jp: "誕生",  accent: "var(--color-wisteria)" },
  { id: "anniversary",label: "Anniversary",     jp: "記念",  accent: "var(--color-flame)" },
  { id: "date",       label: "Date Night",      jp: "逢瀬",  accent: "var(--color-love, #E6648C)" },
  { id: "custom",     label: "Custom",          jp: "特別",  accent: "var(--color-mist)" },
];

type FormState = {
  name: string;
  guestCount: string;
  date: string;
  time: string;
  eventType: string;
  customEvent: string;
  description: string;
};

const INITIAL: FormState = {
  name: "",
  guestCount: "",
  date: "",
  time: "",
  eventType: "casual",
  customEvent: "",
  description: "",
};

export default function Reservation() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const activeEvent = eventOptions.find((e) => e.id === form.eventType)!;

  // Dynamic focus: inject accent as CSS var on the form
  const formAccentStyle = {
    "--accent": activeEvent.accent,
  } as React.CSSProperties;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEventSelect = (id: string) => {
    setForm((prev) => ({ ...prev, eventType: id }));
  };

  const buildWhatsAppMessage = () => {
    const eventLabel =
      form.eventType === "custom" ? form.customEvent || "Custom Event" : activeEvent.label;
    const desc = form.description ? `\n📝 Note: ${form.description}` : "";
    return encodeURIComponent(
      `Hello Infinity Castle! 🏯\n\n` +
        `I'd like to make a reservation:\n` +
        `👤 Name: ${form.name}\n` +
        `👥 Guests: ${form.guestCount}\n` +
        `📅 Date: ${form.date}\n` +
        `🕐 Time: ${form.time}\n` +
        `🎉 Occasion: ${eventLabel}` +
        desc
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const msg = buildWhatsAppMessage();
    window.open(
      `https://wa.me/${siteSettings.contact.whatsapp}?text=${msg}`,
      "_blank",
      "noreferrer noopener"
    );
    // Fire-and-forget: persist reservation to DB for admin inbox.
    // Non-blocking — WhatsApp is always primary; API failure is silent to user.
    fetch("/api/reservations", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nam: form.name,
        pax: Number(form.guestCount),
        dat: form.date,
        tim: form.time,
        evt: form.eventType === "custom" ? (form.customEvent || "custom") : form.eventType,
        msg: form.description || undefined,
      }),
    }).catch(() => {}); // silent on failure
  };


  const today = new Date().toISOString().split("T")[0];

  return (
    <section
      id="reservation"
      ref={ref}
      className="relative border-t border-line bg-void"
      aria-label="Reservation"
    >
      {/* Accent glow from active event */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(60% 60% at 50% 0%, ${activeEvent.accent}14 0%, transparent 70%)`,
        }}
      />

      <div className="shell section-y">
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <span className="jp text-sm text-metal-lit">四</span>
            <span className="h-px w-8 bg-gradient-to-r from-metal-lit to-transparent" />
            <p className="text-xs uppercase tracking-[0.24em] text-ink-faint">
              <span className="jp mr-2 text-metal-lit">予約</span>Reserve
            </p>
          </div>
          <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium text-ink">
            Claim your seat in the Castle
          </h2>
          <p className="mt-4 max-w-md text-ink-soft">
            Fill in your details and we&apos;ll open WhatsApp with everything
            pre-filled for you.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="glass rounded-card border border-line p-6 md:p-8"
            style={formAccentStyle}
            noValidate
          >
            {/* Event type selector */}
            <fieldset>
              <legend className="mb-4 text-xs uppercase tracking-[0.2em] text-ink-faint">
                <span className="jp mr-2 text-metal-lit">種別</span>Occasion
              </legend>
              <div className="flex flex-wrap gap-2">
                {eventOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleEventSelect(opt.id)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition-all duration-300 ${
                      form.eventType === opt.id
                        ? "border-transparent text-void"
                        : "border-line text-ink-soft hover:border-ink/30 hover:text-ink"
                    }`}
                    style={
                      form.eventType === opt.id
                        ? { background: activeEvent.accent }
                        : {}
                    }
                  >
                    <span className="jp text-[0.6rem]">{opt.jp}</span>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Custom event input */}
              {form.eventType === "custom" && (
                <input
                  type="text"
                  name="customEvent"
                  value={form.customEvent}
                  onChange={handleChange}
                  placeholder="Describe your occasion…"
                  className="mt-3 w-full rounded-[0.6rem] border border-line bg-void px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-wisteria/50 focus:outline-none"
                  required={form.eventType === "custom"}
                />
              )}
            </fieldset>

            {/* Fields */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs uppercase tracking-widest text-ink-faint">
                  <span className="jp mr-2 text-metal-lit">名前</span>Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tanjiro Kamado"
                  required
                  className="res-input w-full rounded-[0.6rem] border border-line bg-void px-4 py-3 text-sm text-ink placeholder:text-ink-faint"
                />
              </div>

              {/* Guest count */}
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-ink-faint">
                  <span className="jp mr-2 text-metal-lit">人数</span>Guests
                </label>
                <input
                  type="number"
                  name="guestCount"
                  value={form.guestCount}
                  onChange={handleChange}
                  placeholder="2"
                  min="1"
                  max="50"
                  required
                  className="res-input w-full rounded-[0.6rem] border border-line bg-void px-4 py-3 text-sm text-ink placeholder:text-ink-faint"
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-ink-faint">
                  <span className="jp mr-2 text-metal-lit">日付</span>Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={today}
                  required
                  className="res-input w-full rounded-[0.6rem] border border-line bg-void px-4 py-3 text-sm text-ink"
                />
              </div>

              {/* Time */}
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-ink-faint">
                  <span className="jp mr-2 text-metal-lit">時間</span>Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="res-input w-full rounded-[0.6rem] border border-line bg-void px-4 py-3 text-sm text-ink"
                />
              </div>

              {/* Description (optional) */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs uppercase tracking-widest text-ink-faint">
                  <span className="jp mr-2 text-metal-lit">備考</span>
                  Description
                  <span className="ml-2 text-ink-faint/60">(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any special requests, dietary needs, or notes…"
                  className="w-full resize-none rounded-[0.6rem] border border-line bg-void px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-wisteria/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group relative mt-7 w-full overflow-hidden rounded-pill py-4 text-sm font-medium uppercase tracking-widest text-void transition-transform duration-300 hover:-translate-y-0.5"
              style={{ background: activeEvent.accent }}
            >
              <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="jp">確認</span>
                Confirm on WhatsApp
                <span>↗</span>
              </span>
            </button>

            {submitted && (
              <p className="mt-4 text-center text-xs text-ink-faint">
                WhatsApp opened with your details. See you at the Castle! 🏯
              </p>
            )}
          </form>

          {/* Sidebar info */}
          <div className="flex flex-col gap-6">
            {/* Direct WhatsApp */}
            <div className="glass rounded-card border border-line p-6">
              <p className="text-xs uppercase tracking-widest text-ink-faint">
                <span className="jp mr-2 text-metal-lit">直接</span>Quick Contact
              </p>
              <p className="mt-3 text-sm text-ink-soft">
                Prefer to message directly?
              </p>
              <a
                href={siteSettings.contact.whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 flex items-center gap-3 rounded-pill border border-line px-5 py-3 text-sm text-ink-soft transition-colors hover:border-wisteria/40 hover:text-ink"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {siteSettings.contact.phone}
              </a>
            </div>

            {/* Hours */}
            <div className="glass rounded-card border border-line p-6">
              <p className="text-xs uppercase tracking-widest text-ink-faint">
                <span className="jp mr-2 text-metal-lit">営業</span>Hours
              </p>
              <p className="mt-3 font-display text-2xl text-ink">
                {siteSettings.hours.open} – {siteSettings.hours.close}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-ink-faint">
                Open daily
              </p>
            </div>

            {/* Address */}
            <div className="glass rounded-card border border-line p-6">
              <p className="text-xs uppercase tracking-widest text-ink-faint">
                <span className="jp mr-2 text-metal-lit">場所</span>Address
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {siteSettings.address.full}
              </p>
              <a
                href={siteSettings.address.directionsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-wisteria hover:underline"
              >
                Get directions →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
