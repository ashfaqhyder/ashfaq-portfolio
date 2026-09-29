"use client";

export default function PublicLogo() {
  function goToHero() {
    document.getElementById("top")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <button
      type="button"
      onClick={goToHero}
      aria-label="Return to hero"
      className="
        group
        fixed
        left-4
        top-3
        z-[110]
        flex
        h-[42px]
        w-[42px]
        items-center
        justify-center
        outline-none
        transition-transform
        duration-500
        hover:scale-[1.06]
        focus-visible:ring-1
        focus-visible:ring-[var(--portfolio-border)]
      "
    >
      <span
        aria-hidden="true"
        className="block h-full w-full"
        style={{
          backgroundColor: "var(--portfolio-text)",
          WebkitMaskImage: "url('/ashfaq-hyder-logo.png')",
          maskImage: "url('/ashfaq-hyder-logo.png')",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          transition:
            "background-color 400ms ease, transform 500ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-[-7px]
          rounded-[15px]
          border
          opacity-0
          transition-all
          duration-500
          group-hover:opacity-100
        "
        style={{
          borderColor:
            "color-mix(in srgb, var(--portfolio-text) 8%, transparent)",
        }}
      />
    </button>
  );
}
