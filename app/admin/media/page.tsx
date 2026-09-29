"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createMedia,
  getMedia,
  MediaItem,
  MediaType,
  MediaFolder,
  removeMedia,
  updateMedia,
} from "@/services/media";

const ACCENT = "var(--portfolio-accent)";

const EMPTY_FORM = {
  name: "",
  url: "",
  type: "image" as MediaType,
  folder: "general" as MediaFolder,
  altText: "",
  description: "",
};

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<"all" | MediaType>("all");
  const [folderFilter, setFolderFilter] =
    useState<"all" | MediaFolder>("all");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      setLoading(true);
      setError("");

      const items = await getMedia();
      setMedia(items);
    } catch (err) {
      console.error(err);
      setError("Unable to load media library.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof typeof EMPTY_FORM,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function startEdit(item: MediaItem) {
    setEditingId(item.id ?? null);

    setForm({
      name: item.name,
      url: item.url,
      type: item.type,
      folder: item.folder as MediaFolder,
      altText: item.altText ?? "",
      description: item.description ?? "",
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setMessage("");
    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Media name is required.");
      return;
    }

    if (!form.url.trim()) {
      setError("Media path is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        name: form.name.trim(),
        url: form.url.trim(),
        type: form.type,
        folder: form.folder,
        altText: form.altText.trim(),
        description: form.description.trim(),
      };

      if (editingId) {
        await updateMedia(editingId, payload);
        setMessage("Media item updated successfully.");
      } else {
        await createMedia(payload);
        setMessage("Media item registered successfully.");
      }

      await loadMedia();

      setEditingId(null);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save media item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(item: MediaItem) {
    if (!item.id) return;

    const confirmed = window.confirm(
      `Remove "${item.name}" from the Media Library?\n\nThis only removes the CMS registration. It does not delete the actual file from public/.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await removeMedia(item.id);

      setMedia((current) =>
        current.filter(
          (mediaItem) => mediaItem.id !== item.id
        )
      );

      setMessage(
        `"${item.name}" was removed from the Media Library.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove media item."
      );
    }
  }

  async function copyPath(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Asset path copied.");
      setError("");
    } catch {
      setError("Unable to copy the asset path.");
    }
  }

  const filteredMedia = useMemo(() => {
    const query = search.trim().toLowerCase();

    return media.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query) ||
        item.folder.toLowerCase().includes(query) ||
        (item.altText ?? "")
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "all" ||
        item.type === typeFilter;

      const matchesFolder =
        folderFilter === "all" ||
        item.folder === folderFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesFolder
      );
    });
  }, [
    media,
    search,
    typeFilter,
    folderFilter,
  ]);

  return (
    <main className="min-h-screen bg-[#050505] text-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <header className="mb-10 border-b border-[#252525] pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p
                className="mb-3 text-xs tracking-[0.28em]"
                style={{ color: ACCENT }}
              >
                ADMIN / MEDIA LIBRARY
              </p>

              <h1 className="text-4xl font-semibold tracking-tight">
                Media Library
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8A8A8A]">
                Register and organize permanent assets
                stored inside the portfolio repository.
              </p>
            </div>

            <button
              type="button"
              onClick={startCreate}
              className="border px-5 py-3 text-sm font-medium transition hover:bg-white hover:text-black"
              style={{ borderColor: ACCENT }}
            >
              + Register Asset
            </button>
          </div>
        </header>

        {message && (
          <div
            className="mb-6 border px-4 py-3 text-sm"
            style={{
              borderColor: ACCENT,
              color: ACCENT,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 border border-red-500/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {showForm && (
          <section className="mb-10 border border-[#252525] bg-[#0B0B0B] p-6 lg:p-8">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p
                  className="mb-2 text-xs tracking-[0.22em]"
                  style={{ color: ACCENT }}
                >
                  {editingId
                    ? "EDIT ASSET"
                    : "NEW ASSET"}
                </p>

                <h2 className="text-xl font-medium">
                  {editingId
                    ? "Edit Media Registration"
                    : "Register Media Asset"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#8A8A8A]">
                  This does not upload files. It registers
                  an existing asset from the public repository.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelForm}
                className="text-sm text-[#8A8A8A] transition hover:text-white"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Field
                  label="Asset Name"
                  value={form.name}
                  onChange={(value) =>
                    updateField("name", value)
                  }
                  placeholder="Hero video"
                  required
                />

                <Field
                  label="Asset Path / URL"
                  value={form.url}
                  onChange={(value) =>
                    updateField("url", value)
                  }
                  placeholder="/images/photography/image1.jpg"
                  required
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <SelectField
                  label="Type"
                  value={form.type}
                  onChange={(value) =>
                    updateField(
                      "type",
                      value as MediaType
                    )
                  }
                  options={[
                    ["image", "Image"],
                    ["video", "Video"],
                    ["pdf", "PDF"],
                    ["other", "Other"],
                  ]}
                />

                <SelectField
                  label="Folder"
                  value={form.folder}
                  onChange={(value) =>
                    updateField(
                      "folder",
                      value as MediaFolder
                    )
                  }
                  options={[
                    ["projects", "Projects"],
                    ["photography", "Photography"],
                    ["portraits", "Portraits"],
                    ["creative", "Creative"],
                    ["videos", "Videos"],
                    ["general", "General"],
                  ]}
                />
              </div>

              <Field
                label="Alt Text"
                value={form.altText}
                onChange={(value) =>
                  updateField("altText", value)
                }
                placeholder="Describe the image for accessibility"
              />

              <TextareaField
                label="Description"
                value={form.description}
                onChange={(value) =>
                  updateField(
                    "description",
                    value
                  )
                }
                placeholder="Optional internal description."
                rows={4}
              />

              <div className="flex flex-col gap-3 border-t border-[#252525] pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="border border-[#252525] px-5 py-3 text-sm text-[#8A8A8A] transition hover:border-white hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="border px-5 py-3 text-sm font-medium transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    borderColor: ACCENT,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Asset"
                    : "Register Asset"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search assets..."
              className="min-w-0 flex-1 border border-[#252525] bg-[#111111] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#555] focus:border-[var(--portfolio-accent)]"
            />

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | "all"
                    | MediaType
                )
              }
              className="border border-[#252525] bg-[#111111] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[var(--portfolio-accent)]"
            >
              <option value="all">
                All Types
              </option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="pdf">PDFs</option>
              <option value="other">Other</option>
            </select>

            <select
              value={folderFilter}
              onChange={(event) =>
                setFolderFilter(
                  event.target.value as
                    | "all"
                    | MediaFolder
                )
              }
              className="border border-[#252525] bg-[#111111] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[var(--portfolio-accent)]"
            >
              <option value="all">
                All Folders
              </option>
              <option value="projects">
                Projects
              </option>
              <option value="photography">
                Photography
              </option>
              <option value="portraits">
                Portraits
              </option>
              <option value="creative">
                Creative
              </option>
              <option value="videos">
                Videos
              </option>
              <option value="general">
                General
              </option>
            </select>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs tracking-[0.18em] text-[#8A8A8A]">
              {filteredMedia.length}{" "}
              {filteredMedia.length === 1
                ? "ASSET"
                : "ASSETS"}
            </p>
          </div>

          {loading ? (
            <p className="py-12 text-sm text-[#8A8A8A]">
              Loading media library...
            </p>
          ) : filteredMedia.length === 0 ? (
            <div className="border border-dashed border-[#252525] px-6 py-16 text-center">
              <p className="text-sm text-[#8A8A8A]">
                No media assets found.
              </p>

              <button
                type="button"
                onClick={startCreate}
                className="mt-4 text-sm transition hover:text-white"
                style={{ color: ACCENT }}
              >
                Register your first asset →
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMedia.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onEdit={() =>
                    startEdit(item)
                  }
                  onRemove={() =>
                    handleRemove(item)
                  }
                  onCopy={() =>
                    copyPath(item.url)
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MediaCard({
  item,
  onEdit,
  onRemove,
  onCopy,
}: {
  item: MediaItem;
  onEdit: () => void;
  onRemove: () => void;
  onCopy: () => void;
}) {
  const isImage = item.type === "image";
  const isVideo = item.type === "video";

  return (
    <article className="group overflow-hidden border border-[#252525] bg-[#0B0B0B] transition hover:border-[#444]">
      <div className="relative aspect-video overflow-hidden border-b border-[#252525] bg-[#111111]">
        {isImage ? (
          <img
            src={item.url}
            alt={item.altText || item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : isVideo ? (
          <video
            src={item.url}
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p
                className="text-xs font-medium tracking-[0.2em]"
                style={{ color: ACCENT }}
              >
                {item.type.toUpperCase()}
              </p>

              <p className="mt-2 max-w-[220px] truncate px-4 text-sm text-[#8A8A8A]">
                {item.name}
              </p>
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3 border border-black/30 bg-black/75 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          {item.folder}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h3 className="truncate text-sm font-medium text-[#F5F5F5]">
            {item.name}
          </h3>

          <p className="mt-2 truncate text-xs text-[#666]">
            {item.url}
          </p>
        </div>

        {item.description && (
          <p className="mb-4 line-clamp-2 text-xs leading-5 text-[#8A8A8A]">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="border border-[#252525] px-3 py-2 text-xs transition hover:border-white hover:text-white"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onCopy}
            className="border border-[#252525] px-3 py-2 text-xs transition hover:border-white hover:text-white"
          >
            Copy Path
          </button>

          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="border border-[#252525] px-3 py-2 text-xs transition hover:border-white hover:text-white"
          >
            Open
          </a>

          <button
            type="button"
            onClick={onRemove}
            className="border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:border-red-500/50"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
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
      <label className="mb-2 block text-sm text-[#F5F5F5]">
        {label}
        {required && (
          <span className="ml-1" style={{ color: ACCENT }}>
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
        className="w-full border border-[#252525] bg-[#111111] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#555] transition focus:border-[var(--portfolio-accent)]"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-[#F5F5F5]">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y border border-[#252525] bg-[#111111] px-4 py-3 text-sm leading-6 text-[#F5F5F5] outline-none placeholder:text-[#555] transition focus:border-[var(--portfolio-accent)]"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-[#F5F5F5]">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full border border-[#252525] bg-[#111111] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition focus:border-[var(--portfolio-accent)]"
      >
        {options.map(([optionValue, label]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}