"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import {
  Achievement,
  AchievementStructure,
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
  structure: AchievementStructure;
  parentId: string;
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
  structure: "standalone",
  parentId: "",
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
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AchievementForm>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [expandedMasters, setExpandedMasters] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [structureFilter, setStructureFilter] = useState("all");

  const filteredAchievements = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return achievements.filter((item) => {
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.organization.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && item.published) ||
        (statusFilter === "draft" && !item.published) ||
        (statusFilter === "featured" && item.featured);

      const matchesStructure =
        structureFilter === "all" ||
        (item.structure ?? "standalone") === structureFilter;

      return matchesQuery && matchesType && matchesStatus && matchesStructure;
    });
  }, [achievements, searchQuery, typeFilter, statusFilter, structureFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    structureFilter !== "all";

  function clearFilters() {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setStructureFilter("all");
  }

  const masters = useMemo(
    () =>
      achievements.filter(
        (item) => item.structure === "master" && item.id !== editingId
      ),
    [achievements, editingId]
  );

  const groups = useMemo(
    () => ({
      masters: filteredAchievements.filter(
        (item) =>
          item.structure === "master" ||
          (item.structure !== "course" && !item.parentId)
      ),
      standalone: filteredAchievements.filter(
        (item) => item.structure === "standalone" && !item.parentId
      ),
      courses: filteredAchievements.filter((item) => item.structure === "course"),
    }),
    [filteredAchievements]
  );

  const stats = useMemo(
    () => ({
      total: achievements.length,
      published: achievements.filter((item) => item.published).length,
      masters: achievements.filter((item) => item.structure === "master").length,
      courses: achievements.filter((item) => item.structure === "course").length,
      featured: achievements.filter((item) => item.featured).length,
    }),
    [achievements]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/admin/login");
        return;
      }

      try {
        const token = await currentUser.getIdTokenResult();
        if (token.claims.admin !== true) {
          await signOut(auth);
          router.replace("/admin/login");
          return;
        }
        setUser(currentUser);
        setChecking(false);
      } catch {
        await signOut(auth);
        router.replace("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) loadAchievements();
  }, [user]);

  async function loadAchievements() {
    try {
      setLoading(true);
      setError("");
      setAchievements(await getAchievements());
    } catch (err) {
      console.error(err);
      setError("Unable to load achievements.");
    } finally {
      setLoading(false);
    }
  }

  function field<K extends keyof AchievementForm>(
    key: K,
    value: AchievementForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function edit(item: Achievement) {
    setEditingId(item.id ?? null);
    setForm({
      title: item.title,
      organization: item.organization,
      organizationLogoUrl: item.organizationLogoUrl ?? "",
      date: item.date,
      type: item.type,
      description: item.description,
      verificationUrl: item.verificationUrl ?? "",
      featured: item.featured,
      published: item.published,
      displayOrder: item.displayOrder,
      structure: item.structure ?? "standalone",
      parentId: item.parentId ?? "",
    });
    setMessage("");
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const title = form.title.trim();
      const organization = form.organization.trim();
      const date = form.date.trim();
      const description = form.description.trim();
      const logo = form.organizationLogoUrl.trim();
      const verification = form.verificationUrl.trim();

      if (!title) throw new Error("Title is required.");
      if (!organization) throw new Error("Organization is required.");
      if (!date) throw new Error("Date is required.");
      if (!description) throw new Error("Description is required.");
      if (form.structure === "course" && !form.parentId) {
        throw new Error("Select a master certificate for this course.");
      }
      if (editingId && form.parentId === editingId) {
        throw new Error("An achievement cannot be its own parent.");
      }

      if (verification) {
        try {
          new URL(verification);
        } catch {
          throw new Error("Verification URL is invalid.");
        }
      }

      const data = {
        title,
        organization,
        organizationLogoUrl: logo,
        date,
        type: form.type,
        description,
        verificationUrl: verification,
        featured: form.featured,
        published: form.published,
        displayOrder: Number(form.displayOrder) || 0,
        structure: form.structure,
        parentId: form.structure === "course" ? form.parentId : null,
      };

      if (editingId) {
        await updateAchievement(editingId, data);
        setMessage("Achievement updated successfully.");
      } else {
        await createAchievement(data);
        setMessage("Achievement created successfully.");
      }

      closeForm();
      setMessage(
        editingId
          ? "Achievement updated successfully."
          : "Achievement created successfully."
      );
      await loadAchievements();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unable to save achievement."
      );
      setShowForm(true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Achievement) {
    if (!item.id) return;

    const children = achievements.filter((child) => child.parentId === item.id);
    if (children.length) {
      setError(
        `"${item.title}" has ${children.length} child course${
          children.length === 1 ? "" : "s"
        }. Reassign or delete them first.`
      );
      return;
    }

    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteAchievement(item.id);
      setAchievements((current) =>
        current.filter((entry) => entry.id !== item.id)
      );
      if (editingId === item.id) closeForm();
      setMessage("Achievement deleted successfully.");
      setError("");
    } catch {
      setError("Unable to delete achievement.");
    }
  }

  function toggleMaster(id: string) {
    setExpandedMasters((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center cms-page">
        <div className="flex items-center gap-3 text-sm cms-muted">
          <span className="h-2 w-2 animate-pulse rounded-full cms-accent-bg" />
          Checking authentication...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen cms-page">
      <section className="px-5 py-6 md:px-8 md:py-8 xl:px-12">
        <div className="mx-auto max-w-[1500px]">
          <header className="relative border-b pb-8 cms-border">
            <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-[0.28em] cms-muted">
                    Ashfaq Hyder / Admin
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.22em] cms-accent">CMS / Achievements</span>
                </div>
                <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-[0.92] tracking-[-0.055em]">
                  Achievements
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 cms-muted">
                  Manage certifications, master certificates, courses, hackathons,
                  research and other milestones while keeping their public hierarchy intact.
                </p>
              </div>

              
            </div>
          </header>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <Stat label="Total" value={stats.total} />
            <Stat label="Published" value={stats.published} />
            <Stat label="Master" value={stats.masters} />
            <Stat label="Sub-certs" value={stats.courses} />
            <Stat label="Featured" value={stats.featured} />
          </div>

          <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-[9px] uppercase tracking-[0.2em] transition-all duration-300 cms-border cms-text hover:-translate-y-0.5 cms-hover-accent-border"
              >
                <Plus size={14} strokeWidth={1.5} />
                New achievement
              </button>
          </div>

          <section className="mt-6 border-b pb-6 cms-border">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border cms-border">
                  <SlidersHorizontal size={14} strokeWidth={1.4} className="cms-accent" />
                </span>
                <div>
                  <h2 className="text-sm font-medium">Browse recognition</h2>
                  <p className="mt-1 text-[10px] cms-muted">
                    {filteredAchievements.length} of {achievements.length} entries
                  </p>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[9px] uppercase tracking-[0.16em] transition-colors cms-border cms-muted hover:opacity-70"
                >
                  <X size={11} /> Reset
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.7fr)_repeat(3,minmax(145px,1fr))]">
              <label className="relative block">
                <span className="sr-only">Search achievements</span>
                <Search size={14} strokeWidth={1.5} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 cms-muted" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="cms-input pl-10"
                  placeholder="Search title, organization, description"
                />
              </label>
              <label className="block">
                <span className="sr-only">Filter by type</span>
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="cms-input">
                  <option value="all">Every type</option>
                  {achievementTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="sr-only">Filter by status</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="cms-input">
                  <option value="all">Every status</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                  <option value="featured">Featured</option>
                </select>
              </label>
              <label className="block">
                <span className="sr-only">Filter by structure</span>
                <select value={structureFilter} onChange={(event) => setStructureFilter(event.target.value)} className="cms-input">
                  <option value="all">Every structure</option>
                  <option value="master">Master certificates</option>
                  <option value="standalone">Standalone</option>
                  <option value="course">Courses / sub-certificates</option>
                </select>
              </label>
            </div>
          </section>

          {(message || error) && (
            <div className={`mt-5 rounded-2xl border px-4 py-3 ${error ? "cms-error" : "cms-success"}`}>
              <p className="text-xs leading-5">{error || message}</p>
            </div>
          )}

          <div className="mt-8 grid gap-8">
            <div className="min-w-0 space-y-8">
              {loading ? (
                <div className="rounded-[1.75rem] border cms-panel p-8">
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-24 animate-pulse rounded-2xl cms-skeleton" />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <Group
                    title="Master certificates"
                    subtitle="Parent credentials with linked sub-certificates"
                    items={groups.masters}
                    all={achievements}
                    expanded={expandedMasters}
                    onToggle={toggleMaster}
                    edit={edit}
                    remove={remove}
                  />
                  <Group
                    title="Standalone recognition"
                    subtitle="Independent awards, certifications and milestones"
                    items={groups.standalone}
                    all={achievements}
                    expanded={expandedMasters}
                    onToggle={toggleMaster}
                    edit={edit}
                    remove={remove}
                  />
                  <Group
                    title="Courses / sub-certificates"
                    subtitle="Certificates attached to a master credential"
                    items={groups.courses}
                    all={achievements}
                    expanded={expandedMasters}
                    onToggle={toggleMaster}
                    edit={edit}
                    remove={remove}
                  />
                  {filteredAchievements.length === 0 && (
                    <div className="rounded-[1.5rem] border border-dashed p-10 text-center cms-border">
                      <Search size={19} strokeWidth={1.3} className="mx-auto cms-muted" />
                      <p className="mt-3 text-sm">No matching achievements</p>
                      <p className="mt-1 text-xs cms-muted">Try changing your search or filters.</p>
                      {hasActiveFilters && (
                        <button type="button" onClick={clearFilters} className="mt-4 rounded-full border px-4 py-2 text-[9px] uppercase tracking-[0.16em] cms-border cms-text">
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {showForm && (
              <div className="w-full">
                <AchievementFormPanel
                  form={form}
                  editingId={editingId}
                  saving={saving}
                  masters={masters}
                  field={field}
                  submit={submit}
                  closeForm={closeForm}
                />
              </div>
            )}
          </div>

          {!showForm && !loading && achievements.length === 0 && (
            <div className="mt-8 rounded-[2rem] border border-dashed cms-border p-14 text-center">
              <Trophy size={22} strokeWidth={1.2} className="mx-auto cms-muted" />
              <p className="mt-4 text-sm cms-muted">No achievements created yet.</p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-5 rounded-full border px-5 py-2.5 text-[9px] uppercase tracking-[0.18em] cms-border cms-text cms-hover-accent-border"
              >
                Create the first one
              </button>
            </div>
          )}
        </div>
      </section>

      <style jsx global>{`
        :root {
          --cms-bg: var(--portfolio-background, #050505);
          --cms-text: var(--portfolio-text, #f5f5f5);
          --cms-muted: var(--portfolio-muted, #737373);
          --cms-border: var(--portfolio-border, #242424);
          --cms-surface: var(--portfolio-surface, #090909);
          --cms-accent: var(--portfolio-accent, #ffffff);
        }

        .cms-page {
          background: var(--cms-bg);
          color: var(--cms-text);
        }

        .cms-panel {
          background: transparent;
          border-color: var(--cms-border);
        }

        .cms-surface {
          background: transparent;
        }

        .cms-border {
          border-color: var(--cms-border);
        }

        .cms-text {
          color: var(--cms-text);
        }

        .cms-muted {
          color: var(--cms-muted);
        }

        .cms-accent {
          color: var(--cms-accent);
        }

        .cms-accent-bg {
          background: var(--cms-accent);
        }

        .cms-accent-border:hover,
        .cms-hover-accent-border:hover {
          border-color: var(--cms-accent) !important;
        }

        .cms-hover-accent:hover,
        .group:hover .cms-hover-accent {
          color: var(--cms-accent) !important;
        }

        .cms-grid {
          opacity: 0.18;
          background-image: linear-gradient(var(--cms-border) 1px, transparent 1px), linear-gradient(90deg, var(--cms-border) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: linear-gradient(to bottom, black, transparent 80%);
        }

        .cms-success {
          border-color: color-mix(in srgb, var(--cms-accent) 35%, var(--cms-border));
          background: color-mix(in srgb, var(--cms-accent) 5%, transparent);
          color: var(--cms-accent);
        }

        .cms-error {
          border-color: rgba(248, 113, 113, 0.28);
          background: rgba(248, 113, 113, 0.05);
          color: rgb(248, 113, 113);
        }

        .cms-skeleton {
          background: color-mix(in srgb, var(--cms-border) 45%, transparent);
        }

        .cms-input {
          width: 100%;
          border: 1px solid var(--cms-border);
          border-radius: 14px;
          background: var(--cms-bg);
          padding: 11px 13px;
          color: var(--cms-text);
          font-size: 13px;
          outline: none;
          transition: border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease;
        }

        .cms-input::placeholder {
          color: color-mix(in srgb, var(--cms-muted) 65%, transparent);
        }

        .cms-input:focus {
          border-color: var(--cms-accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--cms-accent) 8%, transparent);
        }

        select.cms-input option {
          background: var(--cms-bg);
          color: var(--cms-text);
        }
      `}</style>
    </main>
  );
}

function AchievementFormPanel({
  form,
  editingId,
  saving,
  masters,
  field,
  submit,
  closeForm,
}: {
  form: AchievementForm;
  editingId: string | null;
  saving: boolean;
  masters: Achievement[];
  field: <K extends keyof AchievementForm>(key: K, value: AchievementForm[K]) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  closeForm: () => void;
}) {
  return (
    <form onSubmit={submit} className="overflow-hidden rounded-2xl border cms-panel">
      <div className="border-b p-6 cms-border md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[8px] uppercase tracking-[0.28em] cms-accent">
              {editingId ? "Edit achievement" : "Create achievement"}
            </p>
            <h2 className="mt-2 text-xl font-medium tracking-[-0.025em]">
              {editingId ? "Update entry" : "New entry"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeForm}
            aria-label="Close form"
            className="flex h-8 w-8 items-center justify-center rounded-full border cms-border cms-muted transition-all hover:rotate-90 cms-hover-accent"
          >
            <X size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-2 md:p-8">
        <Field label="Structure">
          <select
            value={form.structure}
            onChange={(event) => {
              const value = event.target.value as AchievementStructure;
              field("structure", value);
              if (value !== "course") field("parentId", "");
            }}
            className="cms-input"
          >
            <option value="standalone">Standalone</option>
            <option value="master">Master certificate</option>
            <option value="course">Course / sub-certificate</option>
          </select>
        </Field>

        {form.structure === "course" && (
          <Field label="Master certificate">
            <select
              value={form.parentId}
              onChange={(event) => field("parentId", event.target.value)}
              className="cms-input"
            >
              <option value="">Select master certificate</option>
              {masters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.title}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Title">
          <input value={form.title} onChange={(event) => field("title", event.target.value)} className="cms-input" placeholder="Certificate or achievement title" />
        </Field>

        <Field label="Organization">
          <input value={form.organization} onChange={(event) => field("organization", event.target.value)} className="cms-input" placeholder="Issuing organization" />
        </Field>

        <Field label="Organization logo URL">
          <input value={form.organizationLogoUrl} onChange={(event) => field("organizationLogoUrl", event.target.value)} className="cms-input" placeholder="https://..." />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input value={form.date} onChange={(event) => field("date", event.target.value)} className="cms-input" placeholder="June 2026" />
          </Field>
          <Field label="Order">
            <input type="number" value={form.displayOrder} onChange={(event) => field("displayOrder", Number(event.target.value))} className="cms-input" min="0" />
          </Field>
        </div>

        <Field label="Type">
          <select value={form.type} onChange={(event) => field("type", event.target.value)} className="cms-input">
            {achievementTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
        <Field label="Description">
          <textarea value={form.description} onChange={(event) => field("description", event.target.value)} className="cms-input min-h-32 resize-y leading-6" placeholder="Describe the achievement..." />
        </Field>
        </div>

        <Field label="Verification URL">
          <input value={form.verificationUrl} onChange={(event) => field("verificationUrl", event.target.value)} className="cms-input" placeholder="https://..." />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Toggle label="Featured" checked={form.featured} onChange={(value) => field("featured", value)} />
          <Toggle label="Published" checked={form.published} onChange={(value) => field("published", value)} />
        </div>

        <button
          disabled={saving}
          className="sm:col-span-2 group flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-[9px] uppercase tracking-[0.2em] transition-all duration-300 cms-border cms-text hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "var(--cms-accent)", color: "var(--cms-bg)", borderColor: "var(--cms-accent)" }}
          type="submit"
        >
          {saving ? "Saving..." : editingId ? "Update achievement" : "Create achievement"}
        </button>

      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[8px] uppercase tracking-[0.22em] cms-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border p-3.5 cms-border cms-surface">
      <span className="text-[8px] uppercase tracking-[0.18em] cms-muted">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className="relative h-5 w-9 rounded-full transition-colors duration-300"
        style={{ backgroundColor: checked ? "var(--cms-accent)" : "color-mix(in srgb, var(--cms-border) 85%, transparent)" }}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full transition-transform duration-300 ${checked ? "translate-x-4" : "translate-x-0.5"}`} style={{ background: checked ? "var(--cms-bg)" : "var(--cms-muted)" }} />
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="group rounded-xl border p-4 transition-all duration-300 cms-border hover:-translate-y-0.5">
      <p className="text-[8px] uppercase tracking-[0.22em] cms-muted">{label}</p>
      <p className="mt-2 text-2xl font-medium tracking-[-0.04em]">{value}</p>
    </div>
  );
}

function Group({
  title,
  subtitle,
  items,
  all,
  expanded,
  onToggle,
  edit,
  remove,
}: {
  title: string;
  subtitle: string;
  items: Achievement[];
  all: Achievement[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  edit: (item: Achievement) => void;
  remove: (item: Achievement) => void;
}) {
  if (!items.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] cms-accent">{title}</p>
          <p className="mt-1 text-xs cms-muted">{subtitle}</p>
        </div>
        <span className="text-[9px] cms-muted">{items.length.toString().padStart(2, "0")}</span>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const children = all.filter((child) => child.parentId === item.id);
          const isMaster = item.structure === "master";
          const isExpanded = Boolean(item.id && expanded.has(item.id));
          const parent = item.parentId ? all.find((entry) => entry.id === item.parentId) : null;

          return (
            <div key={item.id} className="group rounded-[1.35rem] border cms-border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl" style={{ background: "color-mix(in srgb, var(--cms-surface) 20%, transparent)" }}>
              <article className="p-4 md:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border cms-border" style={{ background: "transparent" }}>
                    {item.organizationLogoUrl ? (
                      <img src={item.organizationLogoUrl} alt="" className="max-h-8 max-w-8 object-contain" />
                    ) : (
                      <span className="text-[10px] font-medium cms-muted">{getOrganizationInitials(item.organization)}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border px-2 py-1 text-[7px] uppercase tracking-[0.16em] cms-border cms-muted">
                        {item.structure ?? "standalone"}
                      </span>
                      {item.published && <span className="rounded-full border px-2 py-1 text-[7px] uppercase tracking-[0.16em] cms-border cms-muted">Published</span>}
                      {!item.published && <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-[7px] uppercase tracking-[0.16em] text-amber-400">Draft</span>}
                      {item.featured && <span className="text-[7px] uppercase tracking-[0.16em] cms-accent">Featured</span>}
                    </div>

                    <h3 className="mt-2 text-base font-medium leading-tight tracking-[-0.02em] md:text-lg">{item.title}</h3>
                    <p className="mt-1 text-xs cms-muted">{item.organization} · {item.date}</p>

                    {isMaster && children.length > 0 && (
                      <button type="button" onClick={() => item.id && onToggle(item.id)} className="mt-3 inline-flex items-center gap-1.5 text-[8px] uppercase tracking-[0.16em] cms-accent">
                        {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        {children.length} linked sub-certificate{children.length === 1 ? "" : "s"}
                      </button>
                    )}

                    {!isMaster && parent && (
                      <p className="mt-3 text-[8px] uppercase tracking-[0.16em] cms-muted">Master · {parent.title}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {item.verificationUrl && (
                      <a href={item.verificationUrl} target="_blank" rel="noopener noreferrer" aria-label="Open verification" className="hidden h-8 w-8 items-center justify-center rounded-full border cms-border cms-muted transition-all cms-hover-accent md:flex">
                        <ExternalLink size={12} />
                      </a>
                    )}
                    <button type="button" onClick={() => edit(item)} aria-label="Edit achievement" className="flex h-8 w-8 items-center justify-center rounded-full border cms-border cms-muted transition-all cms-hover-accent">
                      <Edit3 size={12} />
                    </button>
                    <button type="button" onClick={() => remove(item)} aria-label="Delete achievement" className="flex h-8 w-8 items-center justify-center rounded-full border cms-border cms-muted transition-all hover:border-red-400/40 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </article>

              {isMaster && children.length > 0 && (
                <div className={`grid transition-[grid-template-rows,opacity] duration-500 ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="min-h-0 overflow-hidden">
                    <div className="border-t p-4 cms-border md:p-5">
                      <div className="grid gap-2 md:grid-cols-2">
                        {children.map((child) => (
                          <button key={child.id} type="button" onClick={() => edit(child)} className="group/sub flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-300 cms-border" style={{ background: "var(--cms-bg)" }}>
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border cms-border">
                              <span className="text-[8px] cms-muted">SUB</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">{child.title}</p>
                              <p className="mt-0.5 truncate text-[9px] cms-muted">{child.organization} · {child.date}</p>
                            </div>
                            <ChevronRight size={13} className="shrink-0 cms-muted transition-transform group-hover/sub:translate-x-0.5 group-hover/sub:cms-hover-accent" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getOrganizationInitials(organization: string) {
  const words = organization.replace(/[×&]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "ORG";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");
}
