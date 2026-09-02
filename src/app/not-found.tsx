import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void px-6 text-center">
      {/* Decorative kanji */}
      <p
        aria-hidden="true"
        className="jp select-none font-display text-[8rem] leading-none text-wisteria opacity-10 md:text-[12rem]"
      >
        無
      </p>

      <div className="-mt-8">
        <span className="jp block text-xs tracking-[0.3em] text-wisteria">
          迷子
        </span>
        <h1 className="mt-4 font-display text-4xl font-medium text-ink md:text-5xl">
          Lost in the Castle
        </h1>
        <p className="mt-4 max-w-sm text-ink-soft">
          You have wandered into the wrong room of the Infinity Castle. Even
          Muzan would turn back from here.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-3 rounded-pill bg-wisteria px-8 py-4 text-sm font-medium text-void transition-transform duration-300 hover:-translate-y-0.5"
        >
          Return to the Hall
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
