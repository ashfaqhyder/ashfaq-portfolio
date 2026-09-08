export type SectionId =
  | "hero"
  | "introduction"
  | "about"
  | "selected-work"
  | "capabilities"
  | "experience"
  | "achievements"
  | "creative-lab"
  | "digital-lab"
  | "journey"
  | "contact";

export type NavItem = {
  href: string;
  label: string;
  section?: SectionId;
};

export type ProjectSlug = string;
