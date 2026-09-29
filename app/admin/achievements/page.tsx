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
  Achievement,
  createAchievement,
  deleteAchievement,
  getAchievements,
  updateAchievement,
} from "@/services/achievements";

interface AchievementForm {
  title: string;
  organization: string;
  organizationLogoUrl: string;
  date: string;
  type: string;
  description: string;
  verificationUrl: string;
  featured: boolean;
  published: boolean;
  displayOrder: number;
}

const emptyForm: AchievementForm = {
  title: "",
  organization: "",
  organizationLogoUrl: "",
  date: "",
  type: "Certification",
  description: "",
  verificationUrl: "",
  featured: false,
  published: false,
  displayOrder: 0,
};

const achievementTypes = [
  "Certification",
  "Hackathon",
  "Research",
  "Award",
  "Participation",
  "Workshop",
  "Competition",
  "Other",
];

export default function AchievementsAdminPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [checking, setChecking] =
    useState(true);

  const [achievements, setAchievements] =
    useState<Achievement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState<AchievementForm>({
      ...emptyForm,
    });

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * ------------------------------------------
   * AUTHENTICATION
   * ------------------------------------------
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
          } catch (authError) {
            console.error(
              "Authentication check failed:",
              authError
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
   * ------------------------------------------
   * LOAD
   * ------------------------------------------
   */

  useEffect(() => {
    if (!user) return;

    loadAchievements();
  }, [user]);

  async function loadAchievements() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAchievements();

      setAchievements(data);
    } catch (err) {
      console.error(
        "Failed to load achievements:",
        err
      );

      setError(
        "Unable to load achievements."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ------------------------------------------
   * FORM HELPERS
   * ------------------------------------------
   */

  function updateField<
    K extends keyof AchievementForm
  >(
    field: K,
    value: AchievementForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
    setError("");
  }

  function startEdit(
    achievement: Achievement
  ) {
    setEditingId(
      achievement.id ?? null
    );

    setForm({
      title: achievement.title,
      organization:
        achievement.organization,
      organizationLogoUrl:
        achievement.organizationLogoUrl ??
        "",
      date: achievement.date,
      type: achievement.type,
      description:
        achievement.description,
      verificationUrl:
        achievement.verificationUrl ??
        "",
      featured:
        achievement.featured,
      published:
        achievement.published,
      displayOrder:
        achievement.displayOrder,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * ------------------------------------------
   * SAVE
   * ------------------------------------------
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const title =
        form.title.trim();

      const organization =
        form.organization.trim();

      const date =
        form.date.trim();

      const description =
        form.description.trim();

      const organizationLogoUrl =
        form.organizationLogoUrl.trim();

      const verificationUrl =
        form.verificationUrl.trim();

      if (!title) {
        throw new Error(
          "Achievement title is required."
        );
      }

      if (!organization) {
        throw new Error(
          "Organization is required."
        );
      }

      if (!date) {
        throw new Error(
          "Date is required."
        );
      }

      if (!description) {
        throw new Error(
          "Description is required."
        );
      }

      if (organizationLogoUrl) {
        try {
          new URL(
            organizationLogoUrl
          );
        } catch {
          throw new Error(
            "Organization logo URL is invalid."
          );
        }
      }

      if (verificationUrl) {
        try {
          new URL(
            verificationUrl
          );
        } catch {
          throw new Error(
            "Verification URL is invalid."
          );
        }
      }

      const achievementData = {
        title,
        organization,
        organizationLogoUrl,
        date,
        type: form.type,
        description,
        verificationUrl,
        featured: form.featured,
        published: form.published,
        displayOrder:
          Number(form.displayOrder) || 0,
      };

      if (editingId) {
        await updateAchievement(
          editingId,
          achievementData
        );

        setMessage(
          "Achievement updated successfully."
        );
      } else {
        await createAchievement(
          achievementData
        );

        setMessage(
          "Achievement created successfully."
        );
      }

      resetForm();

      await loadAchievements();
    } catch (err) {
      console.error(
        "Failed to save achievement:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save achievement."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ------------------------------------------
   * DELETE
   * ------------------------------------------
   */

  async function handleDelete(
    achievement: Achievement
  ) {
    if (!achievement.id) return;

    const confirmed =
      window.confirm(
        `Delete "${achievement.title}"? This cannot be undone.`
      );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteAchievement(
        achievement.id
      );

      setAchievements((current) =>
        current.filter(
          (item) =>
            item.id !==
            achievement.id
        )
      );

      if (
        editingId ===
        achievement.id
      ) {
        resetForm();
      }

      setMessage(
        "Achievement deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete achievement:",
        err
      );

      setError(
        "Unable to delete achievement."
      );
    }
  }

  /*
   * ------------------------------------------
   * AUTH LOADING
   * ------------------------------------------
   */

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-sm text-neutral-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  /*
   * ------------------------------------------
   * PAGE
   *
   * IMPORTANT:
   * No sidebar is rendered here.
   * app/admin/layout.tsx provides the
   * global admin navigation.
   * ------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="px-6 py-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <header className="border-b border-neutral-900 pb-8">
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{
                color:
                  "var(--portfolio-accent)",
              }}
            >
              CMS / Achievements
            </p>

            <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
                  Achievements
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                  Manage certifications,
                  hackathons, research and
                  other achievements.
                </p>
              </div>

              <p className="text-xs text-neutral-600">
                {achievements.length}{" "}
                {achievements.length === 1
                  ? "achievement"
                  : "achievements"}
              </p>
            </div>
          </header>

          {/* STATUS */}
          {message && (
            <div
              className="mt-6 border px-4 py-3 text-sm"
              style={{
                borderColor:
                  "var(--portfolio-accent)",
                color:
                  "var(--portfolio-accent)",
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* FORM */}
          <div className="mt-10 rounded-2xl border border-neutral-900 bg-[#080808] p-6 md:p-8">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                  {editingId
                    ? "Edit Achievement"
                    : "New Achievement"}
                </p>

                <h2 className="mt-2 text-2xl font-medium">
                  {editingId
                    ? "Update achievement"
                    : "Create achievement"}
                </h2>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-neutral-600 transition-colors hover:text-white"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* BASIC INFORMATION */}
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Title"
                  value={form.title}
                  onChange={(value) =>
                    updateField(
                      "title",
                      value
                    )
                  }
                  placeholder="Data Interpretation & Insights"
                />

                <Field
                  label="Organization"
                  value={
                    form.organization
                  }
                  onChange={(value) =>
                    updateField(
                      "organization",
                      value
                    )
                  }
                  placeholder="Board Infinity × Coursera"
                />

                <Field
                  label="Date"
                  value={form.date}
                  onChange={(value) =>
                    updateField(
                      "date",
                      value
                    )
                  }
                  placeholder="June 23, 2026"
                />

                <div>
                  <label className="mb-2 block text-xs text-neutral-500">
                    Type
                  </label>

                  <select
                    value={form.type}
                    onChange={(event) =>
                      updateField(
                        "type",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-neutral-500"
                  >
                    {achievementTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* ORGANIZATION LOGO */}
              <div>
                <label className="mb-2 block text-xs text-neutral-500">
                  Organization Logo URL
                </label>

                <div className="flex flex-col gap-4 md:flex-row">
                  <input
                    type="url"
                    value={
                      form.organizationLogoUrl
                    }
                    onChange={(event) =>
                      updateField(
                        "organizationLogoUrl",
                        event.target.value
                      )
                    }
                    placeholder="https://example.com/logo.svg"
                    className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
                  />

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-800 bg-black">
                    {form.organizationLogoUrl ? (
                      <img
                        src={
                          form.organizationLogoUrl
                        }
                        alt="Organization logo preview"
                        className="max-h-10 max-w-10 object-contain"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider text-neutral-700">
                        Logo
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-[10px] leading-5 text-neutral-700">
                  Use a publicly accessible image
                  URL such as SVG, PNG, JPG or WebP.
                </p>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-xs text-neutral-500">
                  Description
                </label>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Describe this achievement..."
                  className="w-full resize-none rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
                />
              </div>

              {/* VERIFICATION */}
              <div>
                <label className="mb-2 block text-xs text-neutral-500">
                  Official Verification URL
                </label>

                <input
                  type="url"
                  value={
                    form.verificationUrl
                  }
                  onChange={(event) =>
                    updateField(
                      "verificationUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://coursera.org/verify/..."
                  className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
                />

                <p className="mt-2 text-[10px] leading-5 text-neutral-700">
                  Use the official issuer's
                  verification page. Certificate PDFs
                  are not uploaded.
                </p>
              </div>

              {/* OPTIONS */}
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs text-neutral-500">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.displayOrder
                    }
                    onChange={(event) =>
                      updateField(
                        "displayOrder",
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm outline-none transition-colors focus:border-neutral-500"
                  />
                </div>

                <Toggle
                  label="Featured"
                  description="Highlight this achievement on the public site."
                  checked={
                    form.featured
                  }
                  onChange={(value) =>
                    updateField(
                      "featured",
                      value
                    )
                  }
                />

                <Toggle
                  label="Published"
                  description="Make this achievement visible publicly."
                  checked={
                    form.published
                  }
                  onChange={(value) =>
                    updateField(
                      "published",
                      value
                    )
                  }
                />
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-4 border-t border-neutral-900 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
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

                <div className="flex gap-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-full border border-neutral-800 px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full border px-6 py-3 text-[10px] uppercase tracking-[0.15em] transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      borderColor:
                        "var(--portfolio-accent)",
                    }}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Achievement"
                      : "Create Achievement"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* LIST */}
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                  Published / Drafts
                </p>

                <h2 className="mt-2 text-2xl font-medium">
                  All Achievements
                </h2>
              </div>

              <button
                type="button"
                onClick={loadAchievements}
                className="text-xs text-neutral-600 transition-colors hover:text-white"
              >
                Refresh ↻
              </button>
            </div>

            {loading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-80 animate-pulse rounded-2xl border border-neutral-900 bg-[#080808]"
                    />
                  )
                )}
              </div>
            ) : achievements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-900 p-12 text-center">
                <p className="text-sm text-neutral-600">
                  No achievements created yet.
                </p>

                <p className="mt-2 text-xs text-neutral-700">
                  Add your certifications,
                  hackathons and research.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {achievements.map(
                  (achievement) => (
                    <AchievementCard
                      key={
                        achievement.id
                      }
                      achievement={
                        achievement
                      }
                      onEdit={
                        startEdit
                      }
                      onDelete={
                        handleDelete
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/*
 * ------------------------------------------
 * FIELD
 * ------------------------------------------
 */

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-neutral-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
      />
    </div>
  );
}

/*
 * ------------------------------------------
 * TOGGLE
 * ------------------------------------------
 */

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-800 bg-black p-4">
      <div>
        <p className="text-sm">
          {label}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-neutral-700">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
        className="h-4 w-4 accent-[var(--portfolio-accent)]"
      />
    </label>
  );
}

/*
 * ------------------------------------------
 * ACHIEVEMENT CARD
 * ------------------------------------------
 */

function AchievementCard({
  achievement,
  onEdit,
  onDelete,
}: {
  achievement: Achievement;
  onEdit: (
    achievement: Achievement
  ) => void;
  onDelete: (
    achievement: Achievement
  ) => void;
}) {
  const [logoError, setLogoError] =
    useState(false);

  const hasLogo =
    Boolean(
      achievement.organizationLogoUrl
    ) && !logoError;

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-900 bg-[#080808] transition-colors hover:border-neutral-800">

      {/* CARD HEADER */}
      <div className="border-b border-neutral-900 p-6">
        <div className="flex items-start gap-4">

          {/* LOGO */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-800 bg-black">
            {hasLogo ? (
              <img
                src={
                  achievement.organizationLogoUrl
                }
                alt={`${achievement.organization} logo`}
                className="max-h-9 max-w-9 object-contain"
                onError={() =>
                  setLogoError(true)
                }
              />
            ) : (
              <span className="text-sm font-medium uppercase text-neutral-700">
                {getOrganizationInitials(
                  achievement.organization
                )}
              </span>
            )}
          </div>

          {/* TITLE */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                {achievement.type}
              </p>

              {achievement.featured && (
                <span
                  className="rounded-full border px-2.5 py-1 text-[8px] uppercase tracking-wider"
                  style={{
                    borderColor:
                      "var(--portfolio-accent)",
                    color:
                      "var(--portfolio-accent)",
                  }}
                >
                  Featured
                </span>
              )}
            </div>

            <h3 className="mt-2 text-xl font-medium leading-tight">
              {achievement.title}
            </h3>

            <p className="mt-2 text-xs text-neutral-500">
              {achievement.organization}
            </p>
          </div>

          {/* ORDER */}
          <span className="shrink-0 text-xs text-neutral-700">
            #{achievement.displayOrder}
          </span>
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-neutral-700">
            {achievement.date}
          </p>

          <span
            className={`rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-wider ${
              achievement.published
                ? "border-white/10 bg-white/[0.03] text-white/50"
                : "border-yellow-500/20 bg-yellow-500/5 text-yellow-500"
            }`}
          >
            {achievement.published
              ? "Published"
              : "Draft"}
          </span>
        </div>

        <p className="mt-5 line-clamp-4 text-sm leading-6 text-neutral-600">
          {achievement.description}
        </p>

        {/* VERIFICATION */}
        {achievement.verificationUrl && (
          <a
            href={
              achievement.verificationUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center rounded-full border border-neutral-800 px-4 py-2 text-[10px] uppercase tracking-wider text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
          >
            Verify Certificate ↗
          </a>
        )}

        {/* ACTIONS */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-neutral-900 pt-5">
          <button
            type="button"
            onClick={() =>
              onEdit(achievement)
            }
            className="rounded-full border border-neutral-800 px-4 py-2 text-[10px] uppercase tracking-wider text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(achievement)
            }
            className="ml-auto rounded-full border border-neutral-800 px-4 py-2 text-[10px] uppercase tracking-wider text-red-400 transition-colors hover:border-red-400/40"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/*
 * ------------------------------------------
 * ORGANIZATION INITIALS
 * ------------------------------------------
 */

function getOrganizationInitials(
  organization: string
) {
  const words = organization
    .replace(/[×&]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "ORG";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join("");
}