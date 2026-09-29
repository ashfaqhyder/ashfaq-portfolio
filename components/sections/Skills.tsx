"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import AnimatedText from "@/components/motion/AnimatedText";
import HoverTilt from "@/components/motion/HoverTilt";

import {
  getPublishedSkills,
  Skill,
  skillGroups,
  SkillGroup,
} from "@/services/skills";

import {
  SiC,
  SiCplusplus,
  SiCss,
  SiDocker,
  SiExpress,
  SiFigma,
  SiFirebase,
  SiFlask,
  SiGit,
  SiGithub,
  SiGooglecloud,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiNumpy,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiReact,
  SiScikitlearn,
  SiStreamlit,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
} from "react-icons/si";

import {
  ArrowUpRight,
  BrainCircuit,
  Code2,
  Database,
  Globe,
  Languages,
  Layers3,
  Palette,
  Terminal,
  Wrench,
} from "lucide-react";

const groupDescriptions: Record<SkillGroup, string> = {
  Programming:
    "Languages and programming foundations used to build software and solve problems.",

  "Web Development":
    "Technologies used to create responsive, functional and interactive web experiences.",

  "AI / ML":
    "Artificial intelligence, machine learning and intelligent application development.",

  "Cloud / Backend":
    "Backend systems, databases, cloud platforms and application infrastructure.",

  "Creative / Multimedia":
    "Visual design, multimedia, motion and creative technology.",

  Tools:
    "Development and technical tools used across projects and workflows.",

  "Soft Skills":
    "The ways I collaborate, communicate, think and work with others.",

  Languages:
    "Human languages used for communication and collaboration.",
};

type IconComponent = React.ComponentType<{
  size?: number;
  className?: string;
}>;

/* =========================================================
   SKILL ICONS
   ========================================================= */

const skillIcons: Record<string, IconComponent> = {
  C: SiC,
  "C++": SiCplusplus,
  CSS: SiCss,
  Docker: SiDocker,
  Express: SiExpress,
  Figma: SiFigma,
  Firebase: SiFirebase,
  Flask: SiFlask,
  Git: SiGit,
  GitHub: SiGithub,
  "Google Cloud": SiGooglecloud,
  HTML: SiHtml5,
  HTML5: SiHtml5,
  JavaScript: SiJavascript,
  MongoDB: SiMongodb,
  MySQL: SiMysql,
  "Next.js": SiNextdotjs,
  Node: SiNodedotjs,
  "Node.js": SiNodedotjs,
  NumPy: SiNumpy,
  Pandas: SiPandas,
  PostgreSQL: SiPostgresql,
  Python: SiPython,
  PyTorch: SiPytorch,
  React: SiReact,
  "scikit-learn": SiScikitlearn,
  Streamlit: SiStreamlit,
  Tailwind: SiTailwindcss,
  "Tailwind CSS": SiTailwindcss,
  TensorFlow: SiTensorflow,
  TypeScript: SiTypescript,
};

/* =========================================================
   GROUP ICONS
   ========================================================= */

const groupIcons: Record<SkillGroup, IconComponent> = {
  Programming: Terminal,
  "Web Development": Globe,
  "AI / ML": BrainCircuit,
  "Cloud / Backend": Database,
  "Creative / Multimedia": Palette,
  Tools: Wrench,
  "Soft Skills": Code2,
  Languages: Languages,
};

/* =========================================================
   INTEGRATED CAPABILITIES
   ========================================================= */

const capabilities = [
  {
    number: "01",
    title: "Web Development",
    shortTitle: "WEB",
    description:
      "Designing and developing responsive, interactive digital experiences with a focus on clean interfaces, usability and performance.",
    capabilities: [
      "Frontend Development",
      "Full-Stack Applications",
      "Responsive Interfaces",
      "Interactive Experiences",
    ],
    icon: Code2,
  },
  {
    number: "02",
    title: "AI / Machine Learning",
    shortTitle: "AI / ML",
    description:
      "Exploring intelligent systems through machine learning, AI applications, data-driven solutions and prompt engineering.",
    capabilities: [
      "Machine Learning",
      "AI Applications",
      "Prompt Engineering",
      "Data-Driven Solutions",
    ],
    icon: BrainCircuit,
  },
  {
    number: "03",
    title: "Creative Technology",
    shortTitle: "CREATE",
    description:
      "Combining technology and visual thinking to create distinctive digital work across design, multimedia and communication.",
    capabilities: [
      "Graphic Design",
      "Visual Communication",
      "Multimedia",
      "Creative Direction",
    ],
    icon: Palette,
  },
  {
    number: "04",
    title: "Interactive / 3D",
    shortTitle: "3D / UX",
    description:
      "Experimenting with motion, spatial interfaces and immersive interactions to make digital experiences feel more alive.",
    capabilities: [
      "Motion & Animation",
      "3D Experiences",
      "Interactive Interfaces",
      "Experimental Web",
    ],
    icon: Layers3,
  },
];

/* =========================================================
   MAIN SKILLS SECTION
   ========================================================= */

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        const data = await getPublishedSkills();
        setSkills(data);
      } catch (error) {
        console.error(
          "Failed to load published skills:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadSkills();
  }, []);

  const groupedSkills = skillGroups
    .map((group) => ({
      group,
      skills: skills
        .filter((skill) => skill.group === group)
        .sort(
          (a, b) =>
            a.displayOrder - b.displayOrder
        ),
    }))
    .filter(
      (item) => item.skills.length > 0
    );

  return (
    <section
      id="skills"
      className="border-t border-neutral-900 px-6 py-20 md:px-10 lg:px-16 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            SKILLS HEADER
        ================================================= */}

        <ScrollReveal direction="up">
          <div className="mb-14 grid gap-7 md:grid-cols-[0.7fr_1.3fr] md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-600 group">
                07 / Skills
                <span className="inline-block w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 ml-2 group-hover:w-12 transition-all duration-300"></span>
              </p>

              <p className="mt-5 max-w-xs text-sm leading-6 text-neutral-600">
                A growing toolkit shaped by projects,
                experimentation, internships and
                continuous learning.
              </p>
            </div>

            <div>
              <h2 className="max-w-5xl text-4xl font-medium leading-[0.98] tracking-tight md:text-6xl lg:text-7xl">
                <AnimatedText delay={0.2}>
                  Tools, technologies
                </AnimatedText>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  <AnimatedText delay={0.4}>
                    and ways of thinking.
                  </AnimatedText>
                </span>
              </h2>
            </div>
          </div>
        </ScrollReveal>

        {/* =================================================
            SKILL GROUPS
        ================================================= */}

        {loading ? (
          <SkillsLoading />
        ) : groupedSkills.length === 0 ? (
          <div className="border-t border-neutral-900 py-14">
            <p className="text-sm text-neutral-600">
              Skills coming soon.
            </p>
          </div>
        ) : (
          <div className="border-t border-neutral-900">
            {groupedSkills.map(
              ({ group, skills }, groupIndex) => (
                <SkillGroupBlock
                  key={group}
                  group={group}
                  skills={skills}
                  index={groupIndex}
                />
              )
            )}
          </div>
        )}

        {/* =================================================
            CAPABILITIES — INTEGRATED INTO SKILLS
        ================================================= */}

        <CapabilitiesBlock />

      </div>
    </section>
  );
}

/* =========================================================
   SKILL GROUP
   ========================================================= */

function SkillGroupBlock({
  group,
  skills,
  index,
}: {
  group: SkillGroup;
  skills: Skill[];
  index: number;
}) {
  const GroupIcon = groupIcons[group];

  return (
    <ScrollReveal direction={index % 2 === 0 ? "left" : "right"} delay={index * 0.05}>
      <div
        className="
          group/section
          grid gap-8
          border-b border-neutral-900
          py-10
          md:grid-cols-[0.72fr_1.28fr]
          md:gap-12
          md:py-12
          lg:py-14
          transition-all duration-300 hover:border-neutral-800
        "
      >

        {/* GROUP INFORMATION */}

        <div>
          <div className="flex items-start gap-4">

            <span className="pt-1 font-mono text-[10px] tracking-widest text-neutral-700">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div>

              <div className="mb-4 flex items-center gap-3">
                <HoverTilt intensity={0.02}>
                  <span
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-xl
                      border border-neutral-900
                      bg-[#080808]
                      text-neutral-500
                      transition-all duration-300
                      group-hover/section:border-neutral-800
                      group-hover/section:text-[var(--portfolio-accent)]
                      hover:shadow-lg hover:shadow-blue-500/20
                    "
                  >
                    <GroupIcon size={15} />
                  </span>
                </HoverTilt>

                <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-700">
                  Skill Group
                </span>
              </div>

              <h3 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
                {group}
              </h3>

              <p className="mt-3 max-w-sm text-xs leading-6 text-neutral-600 hover:text-neutral-500 transition-colors duration-300">
                {groupDescriptions[group]}
              </p>

            </div>
          </div>
        </div>

        {/* SKILLS */}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {skills.map((skill) => (
            <SkillItem
              key={skill.id ?? skill.name}
              skill={skill}
            />
          ))}
        </div>

      </div>
    </ScrollReveal>
  );
}

/* =========================================================
   SKILL ITEM
   ========================================================= */

function SkillItem({
  skill,
}: {
  skill: Skill;
}) {
  const Icon = skillIcons[skill.name];

  const hasMetadata =
    Boolean(skill.proficiency) ||
    skill.yearsOfExperience !== undefined ||
    Boolean(
      skill.learningContext?.length
    );

  return (
    <div className="group relative">

      {/* CARD */}

      <div
        className="
          relative
          flex min-h-[64px]
          items-center justify-between
          gap-4
          rounded-xl
          border border-neutral-900
          bg-[#080808]
          px-4 py-3
          transition-all duration-300
          hover:-translate-y-0.5
          hover:border-neutral-800
          hover:bg-[#0a0a0a]
        "
      >

        <div className="flex min-w-0 items-center gap-3">

          {/* ICON */}

          <span
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-lg
              border border-neutral-900
              bg-[#080808]
              text-neutral-500
              transition-colors duration-300
              group-hover:border-neutral-800
              group-hover:text-[var(--portfolio-accent)]
            "
          >
            {Icon ? (
              <Icon
                size={17}
                aria-hidden="true"
              />
            ) : (
              <Code2
                size={17}
                aria-hidden="true"
              />
            )}
          </span>

          <span
            className="
              truncate
              text-sm
              text-neutral-300
              transition-colors duration-300
              group-hover:text-white
            "
          >
            {skill.name}
          </span>

        </div>

        {hasMetadata && (
          <span
            className="
              shrink-0
              font-mono
              text-[9px]
              uppercase
              tracking-widest
              text-neutral-700
              transition-colors duration-300
              group-hover:text-neutral-500
            "
          >
            info
          </span>
        )}

        {/* ACCENT LINE */}

        <span
          className="
            absolute bottom-0 left-3 right-3
            h-px
            origin-left
            scale-x-0
            bg-[var(--portfolio-accent)]
            transition-transform duration-300
            group-hover:scale-x-100
          "
        />

      </div>

      {/* DESKTOP METADATA */}

      {hasMetadata && (
        <div
          className="
            pointer-events-none
            absolute bottom-full left-1/2 z-30
            mb-3 hidden w-64
            -translate-x-1/2
            translate-y-1
            opacity-0
            transition-all duration-200
            group-hover:pointer-events-auto
            group-hover:translate-y-0
            group-hover:opacity-100
            md:block
          "
        >
          <div
            className="
              rounded-xl
              border border-neutral-800
              bg-[#0a0a0a]
              p-5
              shadow-2xl
            "
          >

            <div className="flex items-center justify-between gap-4">

              <p className="text-sm font-medium text-white">
                {skill.name}
              </p>

              <span className="h-1.5 w-1.5 rounded-full bg-[var(--portfolio-accent)]" />

            </div>

            <div className="mt-5 space-y-4">

              {skill.proficiency && (
                <MetadataRow
                  label="Proficiency"
                  value={skill.proficiency}
                />
              )}

              {skill.yearsOfExperience !== undefined && (
                <MetadataRow
                  label="Experience"
                  value={`${skill.yearsOfExperience} ${
                    skill.yearsOfExperience === 1
                      ? "year"
                      : "years"
                  }`}
                />
              )}

              {skill.learningContext &&
                skill.learningContext.length > 0 && (
                  <MetadataRow
                    label="Learning context"
                    value={skill.learningContext.join(
                      " · "
                    )}
                  />
                )}

            </div>
          </div>
        </div>
      )}

      {/* MOBILE METADATA */}

      {hasMetadata && (
        <div
          className="
            rounded-b-xl
            border-x
            border-b
            border-neutral-900
            bg-[#080808]
            px-4 py-4
            md:hidden
          "
        >
          <div className="grid gap-3">

            {skill.proficiency && (
              <MetadataRow
                label="Proficiency"
                value={skill.proficiency}
              />
            )}

            {skill.yearsOfExperience !== undefined && (
              <MetadataRow
                label="Experience"
                value={`${skill.yearsOfExperience} ${
                  skill.yearsOfExperience === 1
                    ? "year"
                    : "years"
                }`}
              />
            )}

            {skill.learningContext &&
              skill.learningContext.length > 0 && (
                <MetadataRow
                  label="Learning context"
                  value={skill.learningContext.join(
                    " · "
                  )}
                />
              )}

          </div>
        </div>
      )}

    </div>
  );
}

/* =========================================================
   INTEGRATED CAPABILITIES
   ========================================================= */

function CapabilitiesBlock() {
  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  return (
    <div className="pt-20 md:pt-24">

      {/* HEADER */}

      <div className="mb-12 grid gap-7 md:grid-cols-[0.7fr_1.3fr] md:items-end">

        <div>

          <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
            Capabilities
          </p>

          <p className="mt-5 max-w-xs text-sm leading-6 text-neutral-600">
            Different disciplines, one approach —
            combining technology, intelligence and
            visual thinking.
          </p>

        </div>

        <div>

          <h3 className="max-w-5xl text-4xl font-medium leading-[0.98] tracking-tight md:text-6xl lg:text-7xl">
            What I can
            <br />
            <span className="text-neutral-500">
              build and create.
            </span>
          </h3>

        </div>

      </div>

      {/* CAPABILITY CARDS */}

      <div className="grid gap-3 md:grid-cols-2">

        {capabilities.map(
          (capability, index) => {
            const Icon = capability.icon;
            const isActive =
              activeIndex === index;

            return (
              <article
                key={capability.number}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-2xl
                  border border-neutral-900
                  bg-[#080808]
                  transition-all duration-500
                  hover:-translate-y-0.5
                  hover:border-neutral-800
                "
                onMouseEnter={() =>
                  setActiveIndex(index)
                }
                onMouseLeave={() =>
                  setActiveIndex(null)
                }
              >

                {/* CARD HEADER */}

                <div className="p-5 md:p-6">

                  <div className="flex items-start justify-between">

                    <span
                      className={[
                        "font-mono text-[9px] tracking-widest transition-colors duration-300",
                        isActive
                          ? "text-[var(--portfolio-accent)]"
                          : "text-neutral-700",
                      ].join(" ")}
                    >
                      {capability.number}
                    </span>

                    <span
                      className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-xl
                        border border-neutral-900
                        bg-[#050505]
                        text-neutral-600
                        transition-all duration-300
                        group-hover:border-neutral-800
                        group-hover:text-[var(--portfolio-accent)]
                      "
                    >
                      <Icon size={16} />
                    </span>

                  </div>

                  <div className="mt-8 flex items-center gap-3">

                    <h4
                      className="
                        text-xl
                        font-medium
                        tracking-tight
                        text-neutral-200
                        transition-colors duration-300
                        group-hover:text-white
                        md:text-2xl
                      "
                    >
                      {capability.title}
                    </h4>

                    <ArrowUpRight
                      size={17}
                      className="
                        text-neutral-800
                        opacity-0
                        transition-all duration-300
                        group-hover:translate-x-1
                        group-hover:-translate-y-1
                        group-hover:text-[var(--portfolio-accent)]
                        group-hover:opacity-100
                      "
                    />

                  </div>

                  {/* DESCRIPTION */}

                  <div
                    className="
                      grid
                      grid-rows-[0fr]
                      opacity-0
                      transition-all duration-500 ease-out
                      group-hover:mt-4
                      group-hover:grid-rows-[1fr]
                      group-hover:opacity-100
                    "
                  >
                    <div className="min-h-0 overflow-hidden">

                      <p className="max-w-xl text-xs leading-6 text-neutral-500">
                        {capability.description}
                      </p>

                    </div>
                  </div>

                  {/* CAPABILITY TAGS */}

                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">

                    {capability.capabilities.map(
                      (item, itemIndex) => (
                        <div
                          key={item}
                          className="
                            flex items-center gap-2
                            text-[10px]
                            text-neutral-600
                            transition-colors duration-300
                            group-hover:text-neutral-400
                          "
                        >

                          <span
                            className="
                              h-px w-3 shrink-0
                              bg-neutral-800
                              transition-colors duration-300
                              group-hover:bg-[var(--portfolio-accent)]
                            "
                          />

                          <span>
                            {item}
                          </span>

                          <span className="ml-auto font-mono text-[8px] text-neutral-800">
                            {String(
                              itemIndex + 1
                            ).padStart(2, "0")}
                          </span>

                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* ACCENT LINE */}

                <span
                  className="
                    absolute bottom-0 left-5 right-5
                    h-px
                    origin-left
                    scale-x-0
                    bg-[var(--portfolio-accent)]
                    transition-transform duration-500
                    group-hover:scale-x-100
                  "
                />

              </article>
            );
          }
        )}

      </div>

      {/* CLOSING STATEMENT */}

      <div className="mt-12 flex flex-col gap-4 md:mt-14 md:flex-row md:items-end md:justify-between">

        <p className="max-w-xl text-sm leading-7 text-neutral-600">
          I approach each project as an opportunity
          to combine different disciplines rather
          than staying inside a single category.
        </p>

        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-700">
          CODE × DESIGN × INTELLIGENCE
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   METADATA
   ========================================================= */

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">

      <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-700">
        {label}
      </span>

      <span className="text-xs leading-5 text-neutral-400">
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   LOADING STATE
   ========================================================= */

function SkillsLoading() {
  return (
    <div className="border-t border-neutral-900">

      {[1, 2, 3].map((group) => (
        <div
          key={group}
          className="
            grid gap-8
            border-b border-neutral-900
            py-10
            md:grid-cols-[0.72fr_1.28fr]
            md:gap-12
            md:py-12
          "
        >

          <div className="space-y-4">

            <div className="h-3 w-10 animate-pulse bg-neutral-900" />

            <div className="h-7 w-36 animate-pulse bg-neutral-900" />

            <div className="h-4 w-full max-w-sm animate-pulse bg-neutral-900" />

            <div className="h-4 w-4/5 max-w-sm animate-pulse bg-neutral-900" />

          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  h-16
                  animate-pulse
                  rounded-xl
                  border border-neutral-900
                  bg-[#080808]
                "
              />
            ))}

          </div>

        </div>
      ))}

    </div>
  );
}