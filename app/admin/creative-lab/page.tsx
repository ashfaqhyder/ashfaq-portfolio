"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  createCreativeLabItem,
  CreativeLabItem,
  deleteCreativeLabItem,
  getCreativeLabItems,
  updateCreativeLabItem,
} from "@/services/creativeLab";

const emptyForm = {
  title: "",
  category: "",
  description: "",
  imageUrl: "",
  projectUrl: "",
  displayOrder: "1",
  published: true,
};

export default function CreativeLabAdminPage() {
  const [items, setItems] = useState<
    CreativeLabItem[]
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
        await getCreativeLabItems();

      setItems(data);
    } catch (error) {
      console.error(
        "Failed to load Creative Lab:",
        error
      );

      setMessage(
        "Failed to load Creative Lab."
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

  function editItem(item: CreativeLabItem) {
    setEditingId(item.id ?? null);

    setForm({
      title: item.title,
      category: item.category,
      description: item.description,
      imageUrl: item.imageUrl ?? "",
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
      const itemData = {
        title: form.title.trim(),
        category: form.category.trim(),
        description:
          form.description.trim(),
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
        await updateCreativeLabItem(
          editingId,
          itemData
        );

        setMessage(
          "Creative Lab item updated successfully."
        );
      } else {
        await createCreativeLabItem(
          itemData
        );

        setMessage(
          "Creative Lab item created successfully."
        );
      }

      resetForm();
      await loadItems();
    } catch (error) {
      console.error(
        "Failed to save Creative Lab item:",
        error
      );

      setMessage(
        "Failed to save Creative Lab item."
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
        "Delete this Creative Lab item? This cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCreativeLabItem(id);

      setMessage(
        "Creative Lab item deleted successfully."
      );

      if (editingId === id) {
        resetForm();
      }

      await loadItems();
    } catch (error) {
      console.error(
        "Failed to delete Creative Lab item:",
        error
      );

      setMessage(
        "Failed to delete Creative Lab item."
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
            Creative Lab
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage visual experiments, graphic
            design, multimedia work and other
            creative explorations.
          </p>

          <p className="mt-4 max-w-2xl text-xs leading-5 text-neutral-700">
            If there are no published items,
            Creative Lab automatically disappears
            from the public portfolio.
          </p>
        </div>

        {/* Editor */}
        <section className="mb-12 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                {editingId
                  ? "Edit Item"
                  : "New Item"}
              </p>

              <h2 className="mt-2 text-xl font-medium">
                {editingId
                  ? "Update creative work"
                  : "Add creative work"}
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
                placeholder="Visual Identity Study"
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
                placeholder="Graphic Design"
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
              placeholder="Describe the creative work or experiment."
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
                placeholder="/images/creative-lab/project.jpg"
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

            <p className="text-xs leading-5 text-neutral-600">
              Images should be permanent assets
              inside your project's public folder.
              Example:
              /images/creative-lab/poster.jpg
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
              Creative Library
            </p>

            <h2 className="mt-2 text-xl font-medium">
              {items.length}{" "}
              {items.length === 1
                ? "item"
                : "items"}
            </h2>
          </div>

          {loading ? (
            <p className="text-sm text-neutral-500">
              Loading Creative Lab...
            </p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center">
              <p className="text-sm text-neutral-500">
                No Creative Lab items yet.
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

                    <p className="mt-2 text-xs text-neutral-600">
                      Order {item.displayOrder}
                    </p>
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