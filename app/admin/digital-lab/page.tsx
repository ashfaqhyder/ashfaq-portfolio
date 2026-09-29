"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  createDigitalLabItem,
  deleteDigitalLabItem,
  DigitalLabItem,
  getDigitalLabItems,
  updateDigitalLabItem,
} from "@/services/digitalLab";

const emptyForm = {
  title: "",
  category: "",
  description: "",
  imageUrl: "",
  technologies: "",
  projectUrl: "",
  displayOrder: "1",
  published: true,
};

export default function DigitalLabAdminPage() {
  const [items, setItems] = useState<
    DigitalLabItem[]
  >([]);

  const [form, setForm] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function loadItems() {
    try {
      const data =
        await getDigitalLabItems();

      setItems(data);
    } catch (error) {
      console.error(
        "Failed to load Digital Lab:",
        error
      );

      setMessage(
        "Failed to load Digital Lab."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  }

  function editItem(item: DigitalLabItem) {
    setEditingId(item.id ?? null);

    setForm({
      title: item.title,
      category: item.category,
      description: item.description,
      imageUrl: item.imageUrl ?? "",
      technologies:
        item.technologies.join(", "),
      projectUrl: item.projectUrl ?? "",
      displayOrder: String(
        item.displayOrder
      ),
      published: item.published,
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

    if (!form.title.trim()) {
      setMessage(
        "Title is required."
      );
      return;
    }

    if (!form.category.trim()) {
      setMessage(
        "Category is required."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const technologies =
        form.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

      const itemData = {
        title: form.title.trim(),
        category: form.category.trim(),
        description:
          form.description.trim(),
        technologies,
        ...(form.imageUrl.trim()
          ? {
              imageUrl:
                form.imageUrl.trim(),
            }
          : {}),
        ...(form.projectUrl.trim()
          ? {
              projectUrl:
                form.projectUrl.trim(),
            }
          : {}),
        displayOrder:
          Number(form.displayOrder) || 1,
        published: form.published,
      };

      if (editingId) {
        await updateDigitalLabItem(
          editingId,
          itemData
        );

        setMessage(
          "Digital Lab item updated successfully."
        );
      } else {
        await createDigitalLabItem(
          itemData
        );

        setMessage(
          "Digital Lab item created successfully."
        );
      }

      resetForm();
      await loadItems();
    } catch (error) {
      console.error(
        "Failed to save Digital Lab item:",
        error
      );

      setMessage(
        "Failed to save Digital Lab item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this Digital Lab item? This cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDigitalLabItem(id);

      setMessage(
        "Digital Lab item deleted successfully."
      );

      if (editingId === id) {
        resetForm();
      }

      await loadItems();
    } catch (error) {
      console.error(
        "Failed to delete Digital Lab item:",
        error
      );

      setMessage(
        "Failed to delete Digital Lab item."
      );
    }
  }

  return (
    <main className="p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Content Management
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Digital Lab
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage experiments involving code,
            AI, interaction, 3D, creative technology
            and prototypes.
          </p>

          <p className="mt-4 max-w-2xl text-xs leading-5 text-neutral-700">
            If there are no published items,
            Digital Lab automatically disappears
            from the public portfolio.
          </p>
        </div>

        {/* Editor */}
        <section className="mb-12 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                {editingId
                  ? "Edit Experiment"
                  : "New Experiment"}
              </p>

              <h2 className="mt-2 text-xl font-medium">
                {editingId
                  ? "Update digital experiment"
                  : "Add digital experiment"}
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
            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label="Title"
                value={form.title}
                onChange={(value) =>
                  updateField(
                    "title",
                    value
                  )
                }
                placeholder="Interactive AI Experiment"
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
                placeholder="AI / Interaction"
                required
              />
            </div>

            <TextAreaField
              label="Description"
              value={form.description}
              onChange={(value) =>
                updateField(
                  "description",
                  value
                )
              }
              rows={5}
              placeholder="Describe what you experimented with and what you built."
            />

            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label="Image Path"
                value={form.imageUrl}
                onChange={(value) =>
                  updateField(
                    "imageUrl",
                    value
                  )
                }
                placeholder="/images/digital-lab/experiment.jpg"
              />

              <Field
                label="Project URL"
                value={form.projectUrl}
                onChange={(value) =>
                  updateField(
                    "projectUrl",
                    value
                  )
                }
                placeholder="https://..."
              />
            </div>

            <Field
              label="Technologies"
              value={form.technologies}
              onChange={(value) =>
                updateField(
                  "technologies",
                  value
                )
              }
              placeholder="Next.js, Three.js, Python, TensorFlow"
            />

            <p className="text-xs leading-5 text-neutral-600">
              Separate technologies with commas.
              Images should be permanent assets
              inside your project's public folder.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Display Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    form.displayOrder
                  }
                  onChange={(event) =>
                    updateField(
                      "displayOrder",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-neutral-500"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 pt-7">
                <input
                  type="checkbox"
                  checked={
                    form.published
                  }
                  onChange={(event) =>
                    updateField(
                      "published",
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 accent-lime-400"
                />

                <span className="text-sm text-neutral-300">
                  Published
                </span>
              </label>
            </div>

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
                  ? "Update Item"
                  : "Add Item"}
              </button>
            </div>
          </form>
        </section>

        {/* List */}
        <section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Digital Library
            </p>

            <h2 className="mt-2 text-xl font-medium">
              {items.length}{" "}
              {items.length === 1
                ? "experiment"
                : "experiments"}
            </h2>
          </div>

          {loading ? (
            <p className="text-sm text-neutral-500">
              Loading Digital Lab...
            </p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center">
              <p className="text-sm text-neutral-500">
                No Digital Lab experiments yet.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-800">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between ${
                    index !==
                    items.length - 1
                      ? "border-b border-neutral-800"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-medium text-white">
                        {item.title}
                      </h3>

                      <span className="rounded-full border border-neutral-800 px-2 py-1 text-[10px] uppercase tracking-wider text-neutral-600">
                        {item.category}
                      </span>

                      {!item.published && (
                        <span className="rounded-full border border-neutral-800 px-2 py-1 text-[10px] uppercase tracking-wider text-neutral-600">
                          Draft
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
                      <span>
                        Order{" "}
                        {item.displayOrder}
                      </span>

                      {item.technologies.length >
                        0 && (
                        <span>
                          {item.technologies.join(
                            " · "
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        editItem(item)
                      }
                      className="rounded-lg border border-neutral-800 px-4 py-2 text-xs text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        item.id &&
                        handleDelete(
                          item.id
                        )
                      }
                      className="rounded-lg border border-neutral-800 px-4 py-2 text-xs text-neutral-500 transition-colors hover:border-red-900 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
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
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
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
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
      />
    </div>
  );
}