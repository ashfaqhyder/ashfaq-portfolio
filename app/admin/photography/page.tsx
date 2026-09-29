"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  createPhotography,
  deletePhotography,
  getPhotography,
  Photography,
  updatePhotography,
} from "@/services/photography";

const emptyForm = {
  photo: "",
  title: "",
  location: "",
  date: "",
  description: "",
  displayOrder: "",
  published: true,
};

export default function PhotographyAdminPage() {
  const [photography, setPhotography] = useState<
    Photography[]
  >([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPhotography() {
    try {
      const data = await getPhotography();
      setPhotography(data);
    } catch (error) {
      console.error(
        "Failed to load photography:",
        error
      );

      setMessage(
        "Failed to load photography."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPhotography();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  function updateForm(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  }

  function editPhotography(
    item: Photography
  ) {
    setEditingId(item.id ?? null);

    setForm({
      photo: item.photo,
      title: item.title,
      location: item.location,
      date: item.date ?? "",
      description: item.description ?? "",
      displayOrder:
        item.displayOrder !== undefined
          ? String(item.displayOrder)
          : "",
      published:
        item.published ?? true,
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.photo.trim()) {
      setMessage("Photo path is required.");
      return;
    }

    if (!form.title.trim()) {
      setMessage("Title is required.");
      return;
    }

    if (!form.location.trim()) {
      setMessage("Location is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const displayOrder =
        form.displayOrder.trim() === ""
          ? undefined
          : Number(form.displayOrder);

      const photographyData = {
        photo: form.photo.trim(),
        title: form.title.trim(),
        location: form.location.trim(),

        ...(form.date.trim()
          ? {
              date: form.date.trim(),
            }
          : {}),

        ...(form.description.trim()
          ? {
              description:
                form.description.trim(),
            }
          : {}),

        ...(displayOrder !== undefined &&
        !Number.isNaN(displayOrder)
          ? {
              displayOrder,
            }
          : {}),

        published: form.published,
      };

      if (editingId) {
        await updatePhotography(
          editingId,
          photographyData
        );

        setMessage(
          "Photography entry updated successfully."
        );
      } else {
        await createPhotography(
          photographyData
        );

        setMessage(
          "Photography entry created successfully."
        );
      }

      resetForm();
      await loadPhotography();
    } catch (error) {
      console.error(
        "Failed to save photography:",
        error
      );

      setMessage(
        "Failed to save photography."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this photography entry? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePhotography(id);

      setMessage(
        "Photography entry deleted successfully."
      );

      if (editingId === id) {
        resetForm();
      }

      await loadPhotography();
    } catch (error) {
      console.error(
        "Failed to delete photography:",
        error
      );

      setMessage(
        "Failed to delete photography."
      );
    }
  }

  return (
    <main className="p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Creative Lab
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Photography
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage the photographs shown in the
            personal &quot;Outside the Code&quot;
            section. Images are permanent assets in
            the project; this CMS manages their
            metadata and visibility.
          </p>
        </div>

        {/* Editor */}
        <section className="mb-12 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                {editingId
                  ? "Edit Photograph"
                  : "New Photograph"}
              </p>

              <h2 className="mt-2 text-xl font-medium">
                {editingId
                  ? "Update photograph"
                  : "Add a photograph"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-neutral-500 transition-colors hover:text-white"
              >
                Cancel editing
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Photo */}
            <section className="rounded-xl border border-neutral-800 bg-black p-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-300">
                  Photo Path
                  <span className="ml-1 text-[#B6FF3B]">
                    *
                  </span>
                </label>

                <p className="mt-1 text-xs leading-5 text-neutral-600">
                  Enter the path of an image already
                  stored inside the project&apos;s
                  public folder.
                </p>
              </div>

              <input
                type="text"
                value={form.photo}
                onChange={(event) =>
                  updateForm(
                    "photo",
                    event.target.value
                  )
                }
                placeholder="/images/photography/photo-01.jpg"
                required
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
              />

              <p className="mt-2 text-xs text-neutral-700">
                Example:
                /images/photography/photo-01.jpg
              </p>
            </section>

            {/* Required Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label="Title"
                required
                value={form.title}
                onChange={(value) =>
                  updateForm(
                    "title",
                    value
                  )
                }
                placeholder="Monsoon Streets"
              />

              <Field
                label="Location"
                required
                value={form.location}
                onChange={(value) =>
                  updateForm(
                    "location",
                    value
                  )
                }
                placeholder="Bengaluru"
              />
            </div>

            {/* Optional Information */}
            <div className="border-t border-neutral-800 pt-6">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
                  Optional Information
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label="Date"
                    value={form.date}
                    onChange={(value) =>
                      updateForm(
                        "date",
                        value
                      )
                    }
                    placeholder="September 2026"
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Display Order
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        form.displayOrder
                      }
                      onChange={(event) =>
                        updateForm(
                          "displayOrder",
                          event.target.value
                        )
                      }
                      placeholder="Optional"
                      className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
                    />
                  </div>
                </div>

                <TextAreaField
                  label="Description"
                  value={form.description}
                  onChange={(value) =>
                    updateForm(
                      "description",
                      value
                    )
                  }
                  placeholder="A short story or thought behind the photograph."
                  rows={5}
                />

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(event) =>
                      updateForm(
                        "published",
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 accent-lime-400"
                  />

                  <div>
                    <span className="block text-sm text-neutral-300">
                      Published
                    </span>

                    <span className="block text-xs text-neutral-600">
                      Show this photograph in the
                      public spiral.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Save */}
            <div className="flex flex-col gap-4 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {message && (
                  <p
                    className={`text-sm ${
                      message.includes(
                        "successfully"
                      )
                        ? "text-lime-400"
                        : "text-red-400"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Photograph"
                  : "Add Photograph"}
              </button>
            </div>
          </form>
        </section>

        {/* Photography Library */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Photography Library
              </p>

              <h2 className="mt-2 text-xl font-medium">
                {photography.length}{" "}
                {photography.length === 1
                  ? "photograph"
                  : "photographs"}
              </h2>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-neutral-500">
              Loading photography...
            </p>
          ) : photography.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center">
              <p className="text-sm text-neutral-500">
                No photographs added yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {photography.map((item) => (
                <PhotographyCard
                  key={item.id}
                  item={item}
                  onEdit={() =>
                    editPhotography(item)
                  }
                  onDelete={() =>
                    item.id &&
                    handleDelete(item.id)
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

function PhotographyCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Photography;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-neutral-900">
        <img
          src={item.photo}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Information */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-white">
              {item.title}
            </h3>

            <p className="mt-1 text-xs text-neutral-600">
              {item.location}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2 py-1 text-[9px] uppercase tracking-wider ${
              item.published
                ? "border-neutral-800 text-neutral-500"
                : "border-neutral-900 text-neutral-700"
            }`}
          >
            {item.published
              ? "Published"
              : "Draft"}
          </span>
        </div>

        {(item.date ||
          item.description) && (
          <div className="mt-4 border-t border-neutral-900 pt-4">
            {item.date && (
              <p className="text-xs text-neutral-600">
                {item.date}
              </p>
            )}

            {item.description && (
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-neutral-600">
                {item.description}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-lg border border-neutral-800 px-4 py-2 text-xs text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex-1 rounded-lg border border-neutral-800 px-4 py-2 text-xs text-neutral-500 transition-colors hover:border-red-900 hover:text-red-400"
          >
            Delete
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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-300">
        {label}

        {required && (
          <span className="ml-1 text-[#B6FF3B]">
            *
          </span>
        )}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows: number;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-300">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
      />
    </div>
  );
}