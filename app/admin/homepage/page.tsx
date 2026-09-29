"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase/auth";

import {
  defaultHomepageSettings,
  getHomepageSettings,
  HomepageSettings,
  saveHomepageSettings,
} from "@/services/homepage";

export default function HomepageAdminPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [checking, setChecking] =
    useState(true);

  const [form, setForm] =
    useState<HomepageSettings>(
      defaultHomepageSettings
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * ============================================
   * AUTHENTICATION
   * ============================================
   */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (!currentUser) {
            router.replace(
              "/admin/login"
            );
            return;
          }

          try {
            const tokenResult =
              await currentUser.getIdTokenResult();

            if (
              tokenResult.claims.admin !==
              true
            ) {
              await signOut(auth);

              router.replace(
                "/admin/login"
              );

              return;
            }

            setUser(currentUser);
            setChecking(false);
          } catch (err) {
            console.error(
              "Authentication check failed:",
              err
            );

            await signOut(auth);

            router.replace(
              "/admin/login"
            );
          }
        }
      );

    return () => unsubscribe();
  }, [router]);

  /*
   * ============================================
   * LOAD HOMEPAGE
   * ============================================
   */

  useEffect(() => {
    if (!user) {
      return;
    }

    loadHomepage();
  }, [user]);

  async function loadHomepage() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const settings =
        await getHomepageSettings();

      setForm(settings);
    } catch (err) {
      console.error(
        "Failed to load homepage:",
        err
      );

      setError(
        "Unable to load homepage settings."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================
   * GENERIC FIELD UPDATE
   * ============================================
   */

  function updateField(
    field: keyof HomepageSettings,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
   * ============================================
   * CAPABILITY HELPERS
   * ============================================
   */

  function updateCapability(
    index: number,
    field:
      | "number"
      | "title"
      | "description",
    value: string
  ) {
    setForm((current) => ({
      ...current,

      capabilities:
        current.capabilities.map(
          (
            capability,
            capabilityIndex
          ) =>
            capabilityIndex === index
              ? {
                  ...capability,
                  [field]: value,
                }
              : capability
        ),
    }));
  }

  function addCapability() {
    setForm((current) => {
      const nextNumber =
        String(
          current.capabilities.length +
            1
        ).padStart(2, "0");

      return {
        ...current,

        capabilities: [
          ...current.capabilities,
          {
            number: nextNumber,
            title: "New Capability",
            description:
              "Describe this capability.",
          },
        ],
      };
    });
  }

  function removeCapability(
    index: number
  ) {
    setForm((current) => ({
      ...current,

      capabilities:
        current.capabilities
          .filter(
            (_, capabilityIndex) =>
              capabilityIndex !== index
          )
          .map(
            (
              capability,
              capabilityIndex
            ) => ({
              ...capability,
              number: String(
                capabilityIndex + 1
              ).padStart(2, "0"),
            })
          ),
    }));
  }

  /*
   * ============================================
   * SAVE
   * ============================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveHomepageSettings({
        heroEyebrow:
          form.heroEyebrow,

        heroTitle:
          form.heroTitle,

        heroTitleAccent:
          form.heroTitleAccent,

        heroDescription:
          form.heroDescription,

        heroCta:
          form.heroCta,

        introLabel:
          form.introLabel,

        introTitle:
          form.introTitle,

        introAccent:
          form.introAccent,

        introDescription:
          form.introDescription,

        capabilitiesLabel:
          form.capabilitiesLabel,

        capabilitiesTitle:
          form.capabilitiesTitle,

        capabilities:
          form.capabilities,

        contactLabel:
          form.contactLabel,

        contactTitle:
          form.contactTitle,

        contactAccent:
          form.contactAccent,

        contactCta:
          form.contactCta,

        contactEmail:
          form.contactEmail,
      });

      setMessage(
        "Homepage settings saved successfully."
      );
    } catch (err) {
      console.error(
        "Failed to save homepage:",
        err
      );

      setError(
        "Unable to save homepage settings."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================
   * AUTH CHECK
   * ============================================
   */

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-neutral-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  /*
   * ============================================
   * PAGE
   *
   * Navigation is intentionally NOT rendered here.
   * app/admin/layout.tsx provides the global sidebar.
   * ============================================
   */

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="px-6 py-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-5xl">

          {/* HEADER */}

          <div className="border-b border-neutral-900 pb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
              CMS / Homepage
            </p>

            <h1 className="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
              Homepage
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              Control the main content visitors see when
              they enter the portfolio.
            </p>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="mt-10 space-y-5">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-48 animate-pulse rounded-2xl bg-[#080808]"
                  />
                )
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-10 space-y-10"
            >

              {/* ================================== */}
              {/* HERO                                */}
              {/* ================================== */}

              <section className="rounded-2xl border border-neutral-900 bg-[#080808] p-6 md:p-8">
                <SectionHeader
                  number="01"
                  title="Hero"
                  description="The first message visitors see."
                />

                <div className="mt-8 space-y-6">

                  <Field
                    label="Eyebrow"
                    value={
                      form.heroEyebrow
                    }
                    onChange={(value) =>
                      updateField(
                        "heroEyebrow",
                        value
                      )
                    }
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Main Title"
                      value={
                        form.heroTitle
                      }
                      onChange={(value) =>
                        updateField(
                          "heroTitle",
                          value
                        )
                      }
                    />

                    <Field
                      label="Accent Title"
                      value={
                        form.heroTitleAccent
                      }
                      onChange={(value) =>
                        updateField(
                          "heroTitleAccent",
                          value
                        )
                      }
                    />
                  </div>

                  <TextArea
                    label="Hero Description"
                    value={
                      form.heroDescription
                    }
                    onChange={(value) =>
                      updateField(
                        "heroDescription",
                        value
                      )
                    }
                  />

                  <Field
                    label="CTA Label"
                    value={
                      form.heroCta
                    }
                    onChange={(value) =>
                      updateField(
                        "heroCta",
                        value
                      )
                    }
                  />
                </div>
              </section>

              {/* ================================== */}
              {/* INTRODUCTION                        */}
              {/* ================================== */}

              <section className="rounded-2xl border border-neutral-900 bg-[#080808] p-6 md:p-8">
                <SectionHeader
                  number="02"
                  title="Introduction"
                  description="Your primary introduction statement."
                />

                <div className="mt-8 space-y-6">

                  <Field
                    label="Section Label"
                    value={
                      form.introLabel
                    }
                    onChange={(value) =>
                      updateField(
                        "introLabel",
                        value
                      )
                    }
                  />

                  <Field
                    label="Main Statement"
                    value={
                      form.introTitle
                    }
                    onChange={(value) =>
                      updateField(
                        "introTitle",
                        value
                      )
                    }
                  />

                  <Field
                    label="Accent Statement"
                    value={
                      form.introAccent
                    }
                    onChange={(value) =>
                      updateField(
                        "introAccent",
                        value
                      )
                    }
                  />

                  <TextArea
                    label="Description"
                    value={
                      form.introDescription
                    }
                    onChange={(value) =>
                      updateField(
                        "introDescription",
                        value
                      )
                    }
                  />
                </div>
              </section>

              {/* ================================== */}
              {/* CAPABILITIES                        */}
              {/* ================================== */}

              <section className="rounded-2xl border border-neutral-900 bg-[#080808] p-6 md:p-8">
                <SectionHeader
                  number="03"
                  title="Capabilities"
                  description="Control the capabilities displayed on the homepage."
                />

                <div className="mt-8 space-y-6">

                  {/* SECTION HEADING */}

                  <div className="space-y-6">
                    <Field
                      label="Section Label"
                      value={
                        form.capabilitiesLabel
                      }
                      onChange={(value) =>
                        updateField(
                          "capabilitiesLabel",
                          value
                        )
                      }
                    />

                    <Field
                      label="Section Title"
                      value={
                        form.capabilitiesTitle
                      }
                      onChange={(value) =>
                        updateField(
                          "capabilitiesTitle",
                          value
                        )
                      }
                    />
                  </div>

                  {/* CAPABILITY ITEMS */}

                  <div className="border-t border-neutral-900 pt-8">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          Capability Items
                        </p>

                        <p className="mt-1 text-xs text-neutral-600">
                          Edit the services and
                          disciplines shown to visitors.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          addCapability
                        }
                        className="shrink-0 rounded-full border border-neutral-800 px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:border-white hover:text-white"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="mt-6 space-y-4">
                      {form.capabilities.map(
                        (
                          capability,
                          index
                        ) => (
                          <div
                            key={`${index}-${capability.number}`}
                            className="rounded-xl border border-neutral-900 bg-black p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                                  Capability{" "}
                                  {String(
                                    index + 1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </p>
                              </div>

                              {form
                                .capabilities
                                .length >
                                1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeCapability(
                                      index
                                    )
                                  }
                                  className="text-[10px] uppercase tracking-[0.15em] text-neutral-700 transition-colors hover:text-red-400"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="mt-5 grid gap-5 md:grid-cols-[100px_1fr]">
                              <Field
                                label="Number"
                                value={
                                  capability.number
                                }
                                onChange={(
                                  value
                                ) =>
                                  updateCapability(
                                    index,
                                    "number",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Title"
                                value={
                                  capability.title
                                }
                                onChange={(
                                  value
                                ) =>
                                  updateCapability(
                                    index,
                                    "title",
                                    value
                                  )
                                }
                              />
                            </div>

                            <div className="mt-5">
                              <TextArea
                                label="Description"
                                value={
                                  capability.description
                                }
                                onChange={(
                                  value
                                ) =>
                                  updateCapability(
                                    index,
                                    "description",
                                    value
                                  )
                                }
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {form.capabilities
                      .length === 0 && (
                      <div className="mt-6 rounded-xl border border-dashed border-neutral-800 p-8 text-center">
                        <p className="text-sm text-neutral-600">
                          No capabilities added.
                        </p>

                        <button
                          type="button"
                          onClick={
                            addCapability
                          }
                          className="mt-4 text-xs uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-white"
                        >
                          Add your first capability →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ================================== */}
              {/* CONTACT                             */}
              {/* ================================== */}

              <section className="rounded-2xl border border-neutral-900 bg-[#080808] p-6 md:p-8">
                <SectionHeader
                  number="04"
                  title="Contact"
                  description="Control the final call-to-action visitors see."
                />

                <div className="mt-8 space-y-6">

                  <Field
                    label="Section Label"
                    value={
                      form.contactLabel
                    }
                    onChange={(value) =>
                      updateField(
                        "contactLabel",
                        value
                      )
                    }
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Main Title"
                      value={
                        form.contactTitle
                      }
                      onChange={(value) =>
                        updateField(
                          "contactTitle",
                          value
                        )
                      }
                    />

                    <Field
                      label="Accent Title"
                      value={
                        form.contactAccent
                      }
                      onChange={(value) =>
                        updateField(
                          "contactAccent",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Button Label"
                      value={
                        form.contactCta
                      }
                      onChange={(value) =>
                        updateField(
                          "contactCta",
                          value
                        )
                      }
                    />

                    <Field
                      label="Contact Email"
                      type="email"
                      value={
                        form.contactEmail
                      }
                      onChange={(value) =>
                        updateField(
                          "contactEmail",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="rounded-xl border border-neutral-900 bg-black p-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                      Email Preview
                    </p>

                    <p className="mt-3 text-sm text-neutral-400">
                      {form.contactEmail ||
                        "No email configured"}
                    </p>

                    {form.contactEmail && (
                      <p className="mt-2 text-xs text-neutral-700">
                        Clicking the contact button
                        will open the visitor&apos;s
                        email client.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* ================================== */}
              {/* SAVE BAR                            */}
              {/* ================================== */}

              <div className="sticky bottom-5 z-20 flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-900 bg-[#080808]/95 p-4 backdrop-blur-xl">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-white px-7 py-3 text-xs font-medium uppercase tracking-[0.15em] text-black transition-opacity disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Homepage"}
                </button>

                <button
                  type="button"
                  onClick={
                    loadHomepage
                  }
                  disabled={saving}
                  className="rounded-full border border-neutral-800 px-6 py-3 text-xs uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
                >
                  Reset
                </button>

                {message && (
                  <p
                    className="text-sm"
                    style={{
                      color:
                        "var(--portfolio-accent)",
                    }}
                  >
                    {message}
                  </p>
                )}

                {error && (
                  <p className="text-sm text-red-400">
                    {error}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

/*
 * ============================================
 * SECTION HEADER
 * ============================================
 */

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-neutral-900 pb-5">
      <div className="flex items-center gap-4">
        <span className="text-xs text-neutral-700">
          {number}
        </span>

        <h2 className="text-2xl font-medium">
          {title}
        </h2>
      </div>

      <p className="mt-2 text-sm text-neutral-600">
        {description}
      </p>
    </div>
  );
}

/*
 * ============================================
 * TEXT FIELD
 * ============================================
 */

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: "text" | "email";
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-neutral-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
      />
    </div>
  );
}

/*
 * ============================================
 * TEXT AREA
 * ============================================
 */

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-neutral-500">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        rows={5}
        className="w-full resize-none rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-neutral-500"
      />
    </div>
  );
}