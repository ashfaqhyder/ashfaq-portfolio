"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
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
  createProject,
  deleteProject,
  getProjects,
  Project,
  updateProject,
} from "@/services/projects";

import MediaPicker from "@/components/admin/MediaPicker";

interface ProjectForm {
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  githubUrl: string;
  technologies: string;
  featured: boolean;
  published: boolean;
  displayOrder: number;
}

const emptyForm: ProjectForm = {
  title: "",
  slug: "",
  description: "",
  category: "",
  imageUrl: "",
  githubUrl: "",
  technologies: "",
  featured: false,
  published: false,
  displayOrder: 0,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isValidUrl(value: string) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProjectsAdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] =
    useState<ProjectForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const publishedCount = useMemo(
    () =>
      projects.filter(
        (project) => project.published
      ).length,
    [projects]
  );

  const draftCount = projects.length - publishedCount;

  const featuredCount = useMemo(
    () =>
      projects.filter(
        (project) => project.featured
      ).length,
    [projects]
  );

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
      }
    );

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    loadProjects();
  }, [user]);

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const data = await getProjects();

      setProjects(
        [...data].sort(
          (a, b) =>
            a.displayOrder - b.displayOrder
        )
      );
    } catch (err) {
      console.error(
        "Failed to load projects:",
        err
      );

      setError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      ...(editingId
        ? {}
        : {
            slug: slugify(value),
          }),
    }));
  }

  function startEdit(project: Project) {
    setEditingId(project.id ?? null);

    setForm({
      title: project.title,
      slug: project.slug,
      description: project.description,
      category: project.category,
      imageUrl: project.imageUrl ?? "",
      githubUrl: project.githubUrl ?? "",
      technologies:
        project.technologies.join(", "),
      featured: project.featured,
      published: project.published,
      displayOrder: project.displayOrder,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const technologies = form.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const title = form.title.trim();
      const slug = form.slug.trim().toLowerCase();
      const description =
        form.description.trim();
      const category = form.category.trim();
      const imageUrl = form.imageUrl.trim();
      const githubUrl = form.githubUrl.trim();

      if (!title) {
        throw new Error(
          "Project title is required."
        );
      }

      if (!slug) {
        throw new Error(
          "Project slug is required."
        );
      }

      if (!isValidSlug(slug)) {
        throw new Error(
          "Slug can contain only lowercase letters, numbers, and hyphens."
        );
      }

      if (!description) {
        throw new Error(
          "Project description is required."
        );
      }

      if (!category) {
        throw new Error(
          "Project category is required."
        );
      }

      if (!isValidUrl(githubUrl)) {
        throw new Error(
          "Enter a valid GitHub URL."
        );
      }

      const duplicateSlug = projects.some(
        (project) =>
          project.slug.toLowerCase() === slug &&
          project.id !== editingId
      );

      if (duplicateSlug) {
        throw new Error(
          "A project with this slug already exists."
        );
      }

      const projectData = {
        title,
        slug,
        description,
        category,
        imageUrl,
        githubUrl,
        technologies,
        featured: form.featured,
        published: form.published,
        displayOrder:
          Number.isFinite(form.displayOrder)
            ? Number(form.displayOrder)
            : 0,
      };

      if (editingId) {
        await updateProject(
          editingId,
          projectData
        );

        setMessage(
          `"${title}" updated successfully.`
        );
      } else {
        await createProject(projectData);

        setMessage(
          `"${title}" created successfully.`
        );
      }

      setEditingId(null);
      setForm(emptyForm);

      await loadProjects();
    } catch (err) {
      console.error(
        "Failed to save project:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to save project."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishToggle(
    project: Project
  ) {
    if (!project.id || updatingId) return;

    const nextPublished =
      !project.published;

    const confirmed = window.confirm(
      nextPublished
        ? `Publish "${project.title}"? It will become visible on the public portfolio.`
        : `Unpublish "${project.title}"? It will become a draft and disappear from the public portfolio.`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(project.id);
      setError("");
      setMessage("");

      await updateProject(project.id, {
        published: nextPublished,
      });

      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? {
                ...item,
                published: nextPublished,
              }
            : item
        )
      );

      if (editingId === project.id) {
        setForm((current) => ({
          ...current,
          published: nextPublished,
        }));
      }

      setMessage(
        nextPublished
          ? `"${project.title}" is now published.`
          : `"${project.title}" is now a draft.`
      );
    } catch (err) {
      console.error(
        "Failed to change publication status:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to change publication status."
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(
    project: Project
  ) {
    if (!project.id || updatingId) return;

    const confirmed = window.confirm(
      `Delete "${project.title}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(project.id);
      setError("");
      setMessage("");

      await deleteProject(project.id);

      setProjects((current) =>
        current.filter(
          (item) => item.id !== project.id
        )
      );

      if (editingId === project.id) {
        resetForm();
      }

      setMessage(
        `"${project.title}" deleted.`
      );
    } catch (err) {
      console.error(
        "Failed to delete project:",
        err
      );

      setError(
        "Unable to delete project."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-sm text-neutral-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="px-6 py-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <header className="border-b border-neutral-900 pb-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600">
                  CMS / Projects
                </p>

                <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
                  Projects
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                  Manage the projects that appear
                  across your public portfolio.
                </p>
              </div>

              <button
                type="button"
                onClick={loadProjects}
                disabled={loading}
                className="self-start rounded-full border border-neutral-800 px-5 py-2.5 text-[10px] uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white disabled:opacity-40 md:self-auto"
              >
                {loading
                  ? "Refreshing..."
                  : "Refresh ↻"}
              </button>
            </div>

            {/* Overview */}
            <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-neutral-900 bg-neutral-900 sm:grid-cols-3">
              <OverviewStat
                label="Total"
                value={projects.length}
              />

              <OverviewStat
                label="Published"
                value={publishedCount}
              />

              <OverviewStat
                label="Featured"
                value={featuredCount}
              />
            </div>
          </header>

          {/* Notifications */}
          {(message || error) && (
            <div className="mt-6">
              {message && (
                <div className="rounded-xl border border-neutral-800 bg-[#080808] px-5 py-4">
                  <p className="text-sm text-[#B6FF3B]">
                    {message}
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-xl border border-red-900/40 bg-red-950/10 px-5 py-4">
                  <p className="text-sm text-red-400">
                    {error}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Editor */}
          <section className="mt-10 rounded-2xl border border-neutral-900 bg-[#080808]">
            <div className="border-b border-neutral-900 px-6 py-6 md:px-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600">
                    {editingId
                      ? "Editing"
                      : "Create"}
                  </p>

                  <h2 className="mt-2 text-2xl font-medium">
                    {editingId
                      ? "Update project"
                      : "New project"}
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
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-8 p-6 md:p-8"
            >
              {/* Basic Information */}
              <div>
                <SectionLabel>
                  Basic Information
                </SectionLabel>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Field
                    label="Title"
                    value={form.title}
                    onChange={
                      handleTitleChange
                    }
                    placeholder="Valorynn"
                    required
                  />

                  <Field
                    label="Slug"
                    value={form.slug}
                    onChange={(value) =>
                      updateField(
                        "slug",
                        slugify(value)
                      )
                    }
                    placeholder="valorynn"
                    required
                  />

                  <Field
                    label="Category"
                    value={form.category}
                    onChange={(value) =>
                      updateField(
                        "category",
                        value
                      )
                    }
                    placeholder="AI / Security"
                    required
                  />

                  <Field
                    label="GitHub URL"
                    value={form.githubUrl}
                    onChange={(value) =>
                      updateField(
                        "githubUrl",
                        value
                      )
                    }
                    placeholder="https://github.com/..."
                  />
                </div>

                <p className="mt-3 text-[10px] text-neutral-700">
                  Slugs are used for public project
                  URLs and must be unique.
                </p>
              </div>

              {/* Description */}
              <div>
                <SectionLabel>
                  Description
                </SectionLabel>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  rows={6}
                  placeholder="Describe what the project does, the problem it solves, and what makes it meaningful..."
                  required
                  className="mt-5 w-full resize-y rounded-xl border border-neutral-800 bg-black px-4 py-4 text-sm leading-6 outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
                />

                <div className="mt-2 flex justify-between text-[10px] text-neutral-700">
                  <span>
                    Keep the description concise
                    and portfolio-focused.
                  </span>

                  <span>
                    {form.description.length}
                  </span>
                </div>
              </div>

              {/* Media */}
              <div>
                <SectionLabel>
                  Project Media
                </SectionLabel>

                <div className="mt-5">
                  <MediaPicker
                    value={form.imageUrl}
                    onChange={(url) =>
                      updateField(
                        "imageUrl",
                        url
                      )
                    }
                  />
                </div>
              </div>

              {/* Technologies */}
              <div>
                <SectionLabel>
                  Technologies
                </SectionLabel>

                <input
                  value={form.technologies}
                  onChange={(event) =>
                    updateField(
                      "technologies",
                      event.target.value
                    )
                  }
                  placeholder="Next.js, TypeScript, Firebase, AI"
                  className="mt-5 w-full rounded-xl border border-neutral-800 bg-black px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
                />

                <p className="mt-2 text-[10px] text-neutral-700">
                  Separate technologies with
                  commas.
                </p>
              </div>

              {/* Publishing */}
              <div>
                <SectionLabel>
                  Publishing
                </SectionLabel>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs text-neutral-500">
                      Display Order
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={form.displayOrder}
                      onChange={(event) =>
                        updateField(
                          "displayOrder",
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="w-full rounded-xl border border-neutral-800 bg-black px-4 py-3.5 text-sm outline-none transition-colors focus:border-neutral-500"
                    />
                  </div>

                  <Toggle
                    label="Featured"
                    description="Highlight this project."
                    checked={form.featured}
                    onChange={(value) =>
                      updateField(
                        "featured",
                        value
                      )
                    }
                  />

                  <Toggle
                    label="Published"
                    description="Show it publicly."
                    checked={form.published}
                    onChange={(value) =>
                      updateField(
                        "published",
                        value
                      )
                    }
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 border-t border-neutral-900 pt-7">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-white px-7 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Project"
                      : "Create Project"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-full border border-neutral-800 px-7 py-3 text-[10px] uppercase tracking-[0.16em] text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white disabled:opacity-40"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Project List */}
          <section className="mt-14">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600">
                  Portfolio Content
                </p>

                <h2 className="mt-2 text-2xl font-medium">
                  All Projects
                </h2>

                <p className="mt-2 text-sm text-neutral-600">
                  {publishedCount} published ·{" "}
                  {draftCount} drafts
                </p>
              </div>

              {projects.length > 0 && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-700">
                  {projects.length} total
                </p>
              )}
            </div>

            {loading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-[430px] animate-pulse rounded-2xl border border-neutral-900 bg-[#080808]"
                    />
                  )
                )}
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-900 bg-[#080808] px-6 py-20 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-700">
                  Empty
                </p>

                <h3 className="mt-3 text-xl font-medium text-neutral-300">
                  No projects yet
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">
                  Create your first project
                  above and publish it when
                  it is ready.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {projects.map(
                  (project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      updating={
                        updatingId ===
                        project.id
                      }
                      onEdit={startEdit}
                      onDelete={handleDelete}
                      onPublishToggle={
                        handlePublishToggle
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>

          <footer className="mt-16 border-t border-neutral-900 pt-6 pb-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-700">
              Portfolio CMS / Projects
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}

function OverviewStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-[#080808] px-5 py-5">
      <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-600">
        {label}
      </p>

      <p className="mt-2 text-2xl font-medium">
        {value}
      </p>
    </div>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-600">
      {children}
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-neutral-500">
        {label}
        {required && (
          <span className="ml-1 text-neutral-700">
            *
          </span>
        )}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-neutral-800 bg-black px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
      />
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
        checked
          ? "border-neutral-700 bg-neutral-950"
          : "border-neutral-800 bg-black"
      }`}
    >
      <div>
        <p className="text-sm">
          {label}
        </p>

        <p className="mt-1 text-[10px] text-neutral-700">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-4 w-4 accent-[#B6FF3B]"
      />
    </label>
  );
}

function ProjectCard({
  project,
  updating,
  onEdit,
  onDelete,
  onPublishToggle,
}: {
  project: Project;
  updating: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onPublishToggle: (
    project: Project
  ) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-900 bg-[#080808] transition-colors hover:border-neutral-800">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-black">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-700">
              No Image
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex flex-wrap gap-2">
            {project.featured && (
              <span className="rounded-full border border-[#B6FF3B]/20 bg-black/70 px-3 py-1.5 text-[9px] uppercase tracking-wider text-[#B6FF3B] backdrop-blur-md">
                Featured
              </span>
            )}

            <span
              className={`rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-wider backdrop-blur-md ${
                project.published
                  ? "border-white/10 bg-black/70 text-white/70"
                  : "border-yellow-500/20 bg-black/70 text-yellow-500"
              }`}
            >
              {project.published
                ? "Published"
                : "Draft"}
            </span>
          </div>

          <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[9px] uppercase tracking-wider text-white/50 backdrop-blur-md">
            #{project.displayOrder}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-600">
              {project.category ||
                "Uncategorized"}
            </p>

            <h3 className="mt-2 truncate text-xl font-medium">
              {project.title}
            </h3>

            <p className="mt-1 truncate text-[10px] text-neutral-700">
              /{project.slug}
            </p>
          </div>
        </div>

        <p className="mt-5 line-clamp-3 text-sm leading-6 text-neutral-600">
          {project.description}
        </p>

        {project.technologies.length >
          0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.technologies
              .slice(0, 6)
              .map((technology) => (
                <span
                  key={technology}
                  className="rounded-full border border-neutral-800 px-2.5 py-1 text-[9px] uppercase tracking-wider text-neutral-600"
                >
                  {technology}
                </span>
              ))}

            {project.technologies.length >
              6 && (
              <span className="px-1 py-1 text-[9px] text-neutral-700">
                +
                {project.technologies.length -
                  6}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-neutral-900 pt-5">
          <button
            type="button"
            onClick={() =>
              onEdit(project)
            }
            disabled={updating}
            className="rounded-full border border-neutral-800 px-4 py-2 text-[10px] uppercase tracking-wider text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white disabled:opacity-40"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onPublishToggle(project)
            }
            disabled={updating}
            className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-wider transition-colors disabled:opacity-40 ${
              project.published
                ? "border-neutral-800 text-neutral-500 hover:border-yellow-500/30 hover:text-yellow-500"
                : "border-[#B6FF3B]/20 text-[#B6FF3B] hover:border-[#B6FF3B]/40"
            }`}
          >
            {updating
              ? "Updating..."
              : project.published
                ? "Unpublish"
                : "Publish"}
          </button>

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-neutral-800 px-4 py-2 text-[10px] uppercase tracking-wider text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
            >
              GitHub ↗
            </a>
          )}

          {project.published && (
            <a
              href={`/projects/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-neutral-800 px-4 py-2 text-[10px] uppercase tracking-wider text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
            >
              View ↗
            </a>
          )}

          <button
            type="button"
            onClick={() =>
              onDelete(project)
            }
            disabled={updating}
            className="ml-auto rounded-full border border-neutral-800 px-4 py-2 text-[10px] uppercase tracking-wider text-red-400 transition-colors hover:border-red-400/40 hover:bg-red-400/5 disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}