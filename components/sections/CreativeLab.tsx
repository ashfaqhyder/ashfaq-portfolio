"use client";

import { useEffect, useState } from "react";

import {
  CreativeLabItem,
  getPublishedCreativeLabItems,
} from "@/services/creativeLab";

export default function CreativeLab() {
  const [items, setItems] = useState<
    CreativeLabItem[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCreativeLab() {
      try {
        const data =
          await getPublishedCreativeLabItems();

        setItems(data);
      } catch (error) {
        console.error(
          "Failed to load Creative Lab:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadCreativeLab();
  }, []);

  /*
   * The section does not exist publicly when there
   * are no published items.
   */
  if (!loading && items.length === 0) {
    return null;
  }

  if (loading) {
    return null;
  }

  return (
    <section
      id="creative-lab"
      className="border-t border-neutral-900 bg-[#050505] px-6 py-20 text-white md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-14 grid gap-7 md:grid-cols-[0.7fr_1.3fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
              08 / Creative Lab
            </p>
          </div>

          <div>
            <h2 className="max-w-5xl text-4xl font-medium leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
              Visual experiments,
              <br />
              <span className="text-neutral-500">
                ideas and expression.
              </span>
            </h2>
          </div>
        </div>

        {/* CREATIVE GRID */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <CreativeCard
              key={item.id}
              item={item}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CreativeCard({
  item,
  index,
}: {
  item: CreativeLabItem;
  index: number;
}) {
  const content = (
    <article
      className="
        group relative
        overflow-hidden
        rounded-2xl
        border border-neutral-900
        bg-[#080808]
        transition-all duration-500 ease-out
        hover:-translate-y-1
        hover:border-neutral-800
      "
    >

      {/* IMAGE */}
      <div className="relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading={index < 3 ? "eager" : "lazy"}
            className="
              aspect-[4/3]
              w-full
              object-cover
              grayscale
              transition-all duration-700 ease-out
              group-hover:scale-[1.04]
              group-hover:grayscale-0
            "
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-[#090909]">
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-700">
              Creative Experiment
            </span>
          </div>
        )}

        {/* IMAGE OVERLAY */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            bg-black/15
            transition-opacity duration-500
            group-hover:opacity-0
          "
        />

        {/* INDEX */}
        <span
          className="
            absolute right-4 top-4
            rounded-full
            border border-white/10
            bg-black/60
            px-2.5 py-1.5
            text-[9px]
            tracking-[0.18em]
            text-neutral-500
            backdrop-blur-sm
          "
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* CARD CONTENT */}
      <div className="p-5 md:p-6">

        {/* CATEGORY */}
        <span className="text-[9px] uppercase tracking-[0.22em] text-neutral-600">
          {item.category}
        </span>

        {/* TITLE */}
        <h3
          className="
            mt-3
            text-xl
            font-medium
            leading-tight
            tracking-tight
            text-white
            transition-colors duration-300
            group-hover:text-[var(--portfolio-accent)]
          "
        >
          {item.title}
        </h3>

        {/* EXPANDABLE DETAILS */}
        <div
          className="
            grid
            grid-rows-[0fr]
            opacity-0
            transition-all duration-500 ease-out
            group-hover:mt-4
            group-hover:grid-rows-[1fr]
            group-hover:opacity-100
            group-focus-within:mt-4
            group-focus-within:grid-rows-[1fr]
            group-focus-within:opacity-100
          "
        >
          <div className="min-h-0 overflow-hidden">

            {/* DESCRIPTION */}
            {item.description && (
              <p className="text-xs leading-6 text-neutral-500">
                {item.description}
              </p>
            )}

            {/* PROJECT LINK */}
            {item.projectUrl && (
              <div className="mt-5">
                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    border-b
                    border-neutral-800
                    pb-1
                    text-[9px]
                    uppercase
                    tracking-[0.2em]
                    text-neutral-500
                    transition-colors duration-300
                    group-hover:border-[var(--portfolio-accent)]
                    group-hover:text-[var(--portfolio-accent)]
                  "
                >
                  View project

                  <span
                    className="
                      transition-transform duration-300
                      group-hover:-translate-y-1
                      group-hover:translate-x-1
                    "
                  >
                    ↗
                  </span>
                </span>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ACCENT LINE */}
      <div
        className="
          pointer-events-none
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

  if (item.projectUrl) {
    return (
      <a
        href={item.projectUrl}
        target="_blank"
        rel="noreferrer"
        className="block outline-none"
      >
        {content}
      </a>
    );
  }

  return content;
}