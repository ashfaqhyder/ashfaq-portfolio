"use client";

import { FormEvent, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase/auth";

import {
  createExperience,
  deleteExperience,
  getExperience,
  updateExperience,
  Experience,
} from "@/services/experience";

const emptyForm: Omit<
  Experience,
  "id" | "createdAt" | "updatedAt"
> = {
  organization: "",
  role: "",
  organizationLogoUrl: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  location: "",
  type: "Internship",
  description: "",
  responsibilities: [],
  technologies: [],
  featured: false,
  published: true,
  displayOrder: 1,
};

export default function ExperiencePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [responsibilitiesText, setResponsibilitiesText] =
    useState("");

  const [technologiesText, setTechnologiesText] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          router.replace("/admin/login");
          return;
        }

        try {
          const tokenResult =
            await currentUser.getIdTokenResult();

          if (tokenResult.claims.admin !== true) {
            router.replace("/admin/login");
            return;
          }

          setUser(currentUser);
          setChecking(false);
        } catch {
          router.replace("/admin/login");
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  async function loadExperiences() {
    try {
      setLoading(true);
      const data = await getExperience();
      setExperiences(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load experiences.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checking && user) {
      loadExperiences();
    }
  }, [checking, user]);

  function resetForm() {
    setForm({
      ...emptyForm,
      displayOrder: experiences.length + 1,
    });

    setResponsibilitiesText("");
    setTechnologiesText("");
    setEditingId(null);
    setError("");
  }

  function editExperience(experience: Experience) {
    setEditingId(experience.id ?? null);

    setForm({
      organization: experience.organization,
      role: experience.role,
      organizationLogoUrl:
        experience.organizationLogoUrl ?? "",
      startDate: experience.startDate,
      endDate: experience.endDate ?? "",
      currentlyWorking:
        experience.currentlyWorking ?? false,
      location: experience.location ?? "",
      type: experience.type,
      description: experience.description,
      responsibilities:
        experience.responsibilities ?? [],
      technologies:
        experience.technologies ?? [],
      featured: experience.featured,
      published: experience.published,
      displayOrder: experience.displayOrder,
    });

    setResponsibilitiesText(
      (experience.responsibilities ?? []).join("\n")
    );

    setTechnologiesText(
      (experience.technologies ?? []).join(", ")
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!form.organization.trim()) {
      setError("Organization is required.");
      return;
    }

    if (!form.role.trim()) {
      setError("Role is required.");
      return;
    }

    if (!form.startDate.trim()) {
      setError("Start date is required.");
      return;
    }

    if (
      !form.currentlyWorking &&
      !form.endDate?.trim()
    ) {
      setError(
        "Enter an end date or enable Currently Working."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,

        endDate: form.currentlyWorking
          ? ""
          : form.endDate?.trim() ?? "",

        responsibilities:
          responsibilitiesText
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),

        technologies:
          technologiesText
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
      };

      if (editingId) {
        await updateExperience(
          editingId,
          payload
        );
      } else {
        await createExperience(payload);
      }

      resetForm();
      await loadExperiences();
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while saving the experience."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this experience?"
    );

    if (!confirmed) return;

    try {
      await deleteExperience(id);
      await loadExperiences();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete experience.");
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-neutral-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white px-6 py-10 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col gap-6 border-b border-neutral-900 pb-8 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-xs tracking-[0.3em] text-neutral-500">
              ASHFAQ HYDER / ADMIN
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Experience
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              Manage your professional experience and
              highlight your current role.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-neutral-800 px-5 py-2.5 text-sm transition hover:border-neutral-600"
            >
              + New Experience
            </button>
          )}

        </div>

        {/* FORM */}

        <section className="mt-10 rounded-2xl border border-neutral-900 bg-[#080808] p-6 md:p-8">

          <div className="mb-8">
            <p className="text-xs tracking-[0.2em] text-neutral-600">
              {editingId
                ? "EDIT EXPERIENCE"
                : "ADD EXPERIENCE"}
            </p>

            <h2 className="mt-2 text-2xl font-medium">
              {editingId
                ? "Update experience"
                : "New experience"}
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ORGANIZATION + ROLE */}

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Organization
                </label>

                <input
                  value={form.organization}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      organization:
                        e.target.value,
                    })
                  }
                  placeholder="HOPE Foundation"
                  className="admin-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Role
                </label>

                <input
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value,
                    })
                  }
                  placeholder="AI with Python Intern"
                  className="admin-input"
                  required
                />
              </div>

            </div>

            {/* LOGO */}

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Organization Logo URL
              </label>

              <input
                value={form.organizationLogoUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    organizationLogoUrl:
                      e.target.value,
                  })
                }
                placeholder="https://..."
                className="admin-input"
              />
            </div>

            {/* DATES */}

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Start Date
                </label>

                <input
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      startDate:
                        e.target.value,
                    })
                  }
                  placeholder="Sep 2026"
                  className="admin-input"
                  required
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm ${
                    form.currentlyWorking
                      ? "text-neutral-700"
                      : "text-neutral-400"
                  }`}
                >
                  End Date
                </label>

                <input
                  value={form.endDate}
                  disabled={form.currentlyWorking}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endDate:
                        e.target.value,
                    })
                  }
                  placeholder="Nov 2026"
                  className="admin-input disabled:cursor-not-allowed disabled:opacity-30"
                />
              </div>

            </div>

            {/* CURRENTLY WORKING */}

            <div
              className={`rounded-xl border p-5 transition ${
                form.currentlyWorking
                  ? "border-[#B6FF3B]/40 bg-[#B6FF3B]/5"
                  : "border-neutral-900 bg-neutral-950"
              }`}
            >

              <label className="flex cursor-pointer items-start gap-4">

                <input
                  type="checkbox"
                  checked={
                    form.currentlyWorking
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      currentlyWorking:
                        e.target.checked,
                      endDate:
                        e.target.checked
                          ? ""
                          : form.endDate,
                    })
                  }
                  className="mt-1 h-4 w-4 accent-[#B6FF3B]"
                />

                <div>
                  <div className="flex items-center gap-3">

                    <span className="font-medium">
                      Currently Working
                    </span>

                    {form.currentlyWorking && (
                      <span className="rounded-full border border-[#B6FF3B]/30 px-2 py-0.5 text-[10px] tracking-widest text-[#B6FF3B]">
                        CURRENT
                      </span>
                    )}

                  </div>

                  <p className="mt-1 text-sm text-neutral-500">
                    Enable this for an ongoing role.
                    The public portfolio will display
                    it as Present and highlight it.
                  </p>
                </div>

              </label>

            </div>

            {/* LOCATION + TYPE */}

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Location
                </label>

                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      location:
                        e.target.value,
                    })
                  }
                  placeholder="Bengaluru, India"
                  className="admin-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Type
                </label>

                <input
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value,
                    })
                  }
                  placeholder="Internship"
                  className="admin-input"
                />
              </div>

            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
                rows={5}
                placeholder="Describe your experience..."
                className="admin-input resize-y"
              />
            </div>

            {/* RESPONSIBILITIES */}

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Responsibilities
              </label>

              <textarea
                value={
                  responsibilitiesText
                }
                onChange={(e) =>
                  setResponsibilitiesText(
                    e.target.value
                  )
                }
                rows={6}
                placeholder={`One responsibility per line`}
                className="admin-input resize-y"
              />

              <p className="mt-2 text-xs text-neutral-600">
                Enter one responsibility per line.
              </p>
            </div>

            {/* TECHNOLOGIES */}

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Technologies
              </label>

              <input
                value={technologiesText}
                onChange={(e) =>
                  setTechnologiesText(
                    e.target.value
                  )
                }
                placeholder="Python, AI, Prompt Engineering"
                className="admin-input"
              />

              <p className="mt-2 text-xs text-neutral-600">
                Separate technologies with commas.
              </p>
            </div>

            {/* OPTIONS */}

            <div className="grid gap-4 md:grid-cols-3">

              <div>
                <label className="mb-2 block text-sm text-neutral-400">
                  Display Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    form.displayOrder
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      displayOrder:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className="admin-input"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-900 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      featured:
                        e.target.checked,
                    })
                  }
                  className="accent-[#B6FF3B]"
                />

                <span className="text-sm">
                  Featured
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-900 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      published:
                        e.target.checked,
                    })
                  }
                  className="accent-[#B6FF3B]"
                />

                <span className="text-sm">
                  Published
                </span>
              </label>

            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* BUTTONS */}

            <div className="flex flex-wrap gap-3 pt-2">

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Experience"
                  : "Add Experience"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-neutral-800 px-6 py-3 text-sm transition hover:border-neutral-600"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </section>

        {/* EXPERIENCE LIST */}

        <section className="mt-12">

          <div className="mb-6">
            <p className="text-xs tracking-[0.2em] text-neutral-600">
              SAVED EXPERIENCES
            </p>

            <h2 className="mt-2 text-2xl font-medium">
              Your experience
            </h2>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-neutral-900 p-8 text-neutral-500">
              Loading experiences...
            </div>
          ) : experiences.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-900 p-8 text-neutral-600">
              No experiences added yet.
            </div>
          ) : (
            <div className="space-y-4">

              {experiences.map(
                (experience) => (
                  <article
                    key={experience.id}
                    className={`rounded-2xl border p-6 transition ${
                      experience.currentlyWorking
                        ? "border-[#B6FF3B]/30 bg-[#B6FF3B]/[0.03]"
                        : "border-neutral-900 bg-[#080808]"
                    }`}
                  >

                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-xl font-medium">
                            {experience.role}
                          </h3>

                          {experience.currentlyWorking && (
                            <span className="rounded-full border border-[#B6FF3B]/30 px-2.5 py-1 text-[10px] tracking-widest text-[#B6FF3B]">
                              CURRENT
                            </span>
                          )}

                          {experience.featured && (
                            <span className="rounded-full border border-neutral-700 px-2.5 py-1 text-[10px] tracking-widest text-neutral-400">
                              FEATURED
                            </span>
                          )}

                        </div>

                        <p className="mt-2 text-neutral-400">
                          {experience.organization}
                        </p>

                        <p className="mt-2 text-sm text-neutral-600">
                          {experience.startDate}
                          {" — "}
                          {experience.currentlyWorking
                            ? "Present"
                            : experience.endDate}
                        </p>

                      </div>

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            editExperience(
                              experience
                            )
                          }
                          className="rounded-full border border-neutral-800 px-4 py-2 text-sm hover:border-neutral-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            experience.id &&
                            handleDelete(
                              experience.id
                            )
                          }
                          className="rounded-full border border-red-950 px-4 py-2 text-sm text-red-400 hover:border-red-800"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>

      </div>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #262626;
          background: #050505;
          padding: 0.8rem 1rem;
          color: white;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .admin-input::placeholder {
          color: #525252;
        }

        .admin-input:focus {
          border-color: #525252;
        }

        textarea.admin-input {
          line-height: 1.6;
        }
      `}</style>
    </main>
  );
}