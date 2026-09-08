export const animationConfig = {
  duration: {
    fast: 0.4,
    default: 0.8,
    slow: 1.4,
  },
  ease: {
    default: "power3.out",
    inOut: "power2.inOut",
  },
  scrollTrigger: {
    start: "top 80%",
    end: "bottom 20%",
  },
} as const;
