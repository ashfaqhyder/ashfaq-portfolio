import type { NavItem, SectionId } from "@/types";

export const routes = {
  home: "/",
  project: (slug: string) => `/projects/${slug}` as const,
  adminLogin: "/admin/login",
  adminDashboard: "/admin/dashboard",
} as const;

export const sectionIds = [
  "hero",
  "introduction",
  "about",
  "selected-work",
  "capabilities",
  "experience",
  "achievements",
  "creative-lab",
  "digital-lab",
  "journey",
  "contact",
] as const satisfies readonly SectionId[];

export const primaryNavigation: readonly NavItem[] = [
  { href: "/#introduction", label: "Introduction", section: "introduction" },
  { href: "/#about", label: "About", section: "about" },
  { href: "/#selected-work", label: "Selected Work", section: "selected-work" },
  { href: "/#capabilities", label: "Capabilities", section: "capabilities" },
  { href: "/#experience", label: "Experience", section: "experience" },
  { href: "/#achievements", label: "Achievements", section: "achievements" },
  { href: "/#creative-lab", label: "Creative Lab", section: "creative-lab" },
  { href: "/#digital-lab", label: "Digital Lab", section: "digital-lab" },
  { href: "/#journey", label: "Journey", section: "journey" },
  { href: "/#contact", label: "Contact", section: "contact" },
];
