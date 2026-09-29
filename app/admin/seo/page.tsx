"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  defaultSeoSettings,
  getSeoSettings,
  saveSeoSettings,
  SeoSettings,
} from "@/services/seo";

const ACCENT = "var(--portfolio-accent)";

export default function SeoPage() {
  const [settings, setSettings] =
    useState<SeoSettings>(defaultSeoSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getSeoSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load SEO settings."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function updateField(
    field: keyof SeoSettings,
    value: string | boolean | string[]
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const {
        updatedAt,
        ...settingsToSave
      } = settings;

      await saveSeoSettings(settingsToSave);

      setMessage(
        "SEO settings saved successfully."
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save SEO settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-10 text-[#F5F5F5] lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-[#8A8A8A]">
            Loading SEO settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-[#F5F5F5]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <div className="mb-12 border-b border-[#252525] pb-8">
          <p
            className="mb-3 text-xs font-medium tracking-[0.28em]"
            style={{ color: ACCENT }}
          >
            ADMIN / SEO
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Search Engine Optimization
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8A8A8A]">
            Control the metadata, indexing behavior and
            social sharing information used by your portfolio.
          </p>
        </div>

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

        <form
          onSubmit={handleSubmit}
          className="space-y-10"
        >
          <section className="border border-[#252525] bg-[#0B0B0B] p-6 lg:p-8">
            <div className="mb-8">
              <p
                className="mb-2 text-xs tracking-[0.22em]"
                style={{ color: ACCENT }}
              >
                01 / CORE
              </p>

              <h2 className="text-xl font-medium">
                Basic SEO
              </h2>

              <p className="mt-2 text-sm text-[#8A8A8A]">
                Primary information used by search engines.
              </p>
            </div>

            <div className="grid gap-6">
              <Field
                label="Site Name"
                value={settings.siteName}
                onChange={(value) =>
                  updateField("siteName", value)
                }
                placeholder="Ashfaq Hyder"
              />

              <Field
                label="Page Title"
                value={settings.title}
                onChange={(value) =>
                  updateField("title", value)
                }
                placeholder="Ashfaq Hyder — Creative Developer & AI/ML Enthusiast"
              />

              <TextareaField
                label="Meta Description"
                value={settings.description}
                onChange={(value) =>
                  updateField("description", value)
                }
                placeholder="A short description of your portfolio."
                rows={4}
              />

              <Field
                label="Author"
                value={settings.author}
                onChange={(value) =>
                  updateField("author", value)
                }
                placeholder="Ashfaq Hyder"
              />

              <Field
                label="Keywords"
                value={settings.keywords.join(", ")}
                onChange={(value) =>
                  updateField(
                    "keywords",
                    value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="AI, ML, Web Development, Creative Developer"
              />
            </div>
          </section>

          <section className="border border-[#252525] bg-[#0B0B0B] p-6 lg:p-8">
            <div className="mb-8">
              <p
                className="mb-2 text-xs tracking-[0.22em]"
                style={{ color: ACCENT }}
              >
                02 / URLS
              </p>

              <h2 className="text-xl font-medium">
                Site URLs
              </h2>
            </div>

            <div className="grid gap-6">
              <Field
                label="Site URL"
                value={settings.siteUrl}
                onChange={(value) =>
                  updateField("siteUrl", value)
                }
                placeholder="https://example.com"
              />

              <Field
                label="Canonical URL"
                value={settings.canonicalUrl}
                onChange={(value) =>
                  updateField("canonicalUrl", value)
                }
                placeholder="https://example.com"
              />
            </div>
          </section>

          <section className="border border-[#252525] bg-[#0B0B0B] p-6 lg:p-8">
            <div className="mb-8">
              <p
                className="mb-2 text-xs tracking-[0.22em]"
                style={{ color: ACCENT }}
              >
                03 / SOCIAL
              </p>

              <h2 className="text-xl font-medium">
                Open Graph
              </h2>

              <p className="mt-2 text-sm text-[#8A8A8A]">
                Controls how the portfolio appears when shared
                on social platforms.
              </p>
            </div>

            <div className="grid gap-6">
              <Field
                label="OG Title"
                value={settings.ogTitle}
                onChange={(value) =>
                  updateField("ogTitle", value)
                }
                placeholder="Ashfaq Hyder"
              />

              <TextareaField
                label="OG Description"
                value={settings.ogDescription}
                onChange={(value) =>
                  updateField(
                    "ogDescription",
                    value
                  )
                }
                rows={4}
              />

              <Field
                label="OG Image"
                value={settings.ogImage}
                onChange={(value) =>
                  updateField("ogImage", value)
                }
                placeholder="/images/og-image.jpg"
              />

              <div>
                <label className="mb-2 block text-sm text-[#F5F5F5]">
                  Twitter Card
                </label>

                <select
                  value={settings.twitterCard}
                  onChange={(event) =>
                    updateField(
                      "twitterCard",
                      event.target.value
                    )
                  }
                  className="w-full border border-[#252525] bg-[#111111] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition focus:border-[var(--portfolio-accent)]"
                >
                  <option value="summary">
                    Summary
                  </option>
                  <option value="summary_large_image">
                    Summary Large Image
                  </option>
                </select>
              </div>
            </div>
          </section>

          <section className="border border-[#252525] bg-[#0B0B0B] p-6 lg:p-8">
            <div className="mb-8">
              <p
                className="mb-2 text-xs tracking-[0.22em]"
                style={{ color: ACCENT }}
              >
                04 / INDEXING
              </p>

              <h2 className="text-xl font-medium">
                Search Visibility
              </h2>
            </div>

            <div className="space-y-5">
              <Toggle
                label="Allow Search Engine Indexing"
                description="Allow search engines to index the portfolio."
                checked={settings.robotsIndex}
                onChange={(value) =>
                  updateField(
                    "robotsIndex",
                    value
                  )
                }
              />

              <Toggle
                label="Allow Search Engine Following"
                description="Allow search engines to follow links on the site."
                checked={settings.robotsFollow}
                onChange={(value) =>
                  updateField(
                    "robotsFollow",
                    value
                  )
                }
              />
            </div>
          </section>

          <div className="flex justify-end border-t border-[#252525] pt-8">
            <button
              type="submit"
              disabled={saving}
              className="border px-6 py-3 text-sm font-medium transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: ACCENT,
              }}
            >
              {saving
                ? "Saving..."
                : "Save SEO Settings"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-[#F5F5F5]">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
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
    <label className="flex cursor-pointer items-start gap-4 border border-[#252525] bg-[#111111] p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 h-4 w-4 accent-[var(--portfolio-accent)]"
      />

      <span>
        <span className="block text-sm font-medium text-[#F5F5F5]">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-[#8A8A8A]">
          {description}
        </span>
      </span>
    </label>
  );
}