"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  AboutSettings,
  defaultAboutSettings,
  getAboutSettings,
  saveAboutSettings,
} from "@/services/about";

export default function AboutAdminPage() {
  const [settings, setSettings] =
    useState<AboutSettings>(defaultAboutSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAbout() {
      try {
        const data = await getAboutSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load About settings:", error);
        setMessage("Failed to load About content.");
      } finally {
        setLoading(false);
      }
    }

    loadAbout();
  }, []);

  function updateField(
    field: keyof AboutSettings,
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      await saveAboutSettings({
        eyebrow: settings.eyebrow,
        title: settings.title,
        titleAccent: settings.titleAccent,
        shortBio: settings.shortBio,
        biography: settings.biography,
        location: settings.location,
        availability: settings.availability,
        profileImageUrl: settings.profileImageUrl,
        email: settings.email,
        githubUrl: settings.githubUrl,
        linkedinUrl: settings.linkedinUrl,
        instagramUrl: settings.instagramUrl,
      });

      setMessage("About content saved successfully.");
    } catch (error) {
      console.error("Failed to save About settings:", error);
      setMessage("Failed to save About content.");
    } finally {
      setSaving(false);
    }
  }

    const cmsStyle = (
    <style jsx global>{`
      .admin-cms-field::placeholder {
        color: var(--portfolio-muted);
        opacity: 0.55;
      }

      .admin-cms-field:focus {
        border-color: var(--portfolio-accent);
        box-shadow: 0 0 0 1px var(--portfolio-accent);
      }

      .admin-cms-field:-webkit-autofill,
      .admin-cms-field:-webkit-autofill:hover,
      .admin-cms-field:-webkit-autofill:focus {
        -webkit-text-fill-color: var(--portfolio-text);
        -webkit-box-shadow: 0 0 0 1000px var(--portfolio-background) inset;
        transition: background-color 5000s ease-in-out 0s;
      }
    `}</style>
  );


  if (loading) {
  return (
    <>
      {cmsStyle}
      <main
        className="min-h-full p-6 text-[var(--portfolio-text)] md:p-10"
        style={{
          backgroundColor: "var(--portfolio-background)",
          color: "var(--portfolio-text)",
        }}
      >
        <div className="max-w-5xl">
          <p className="text-sm text-[var(--portfolio-muted)]">
            Loading About content...
          </p>
        </div>
      </main>
    </>
  );
}

  return (
    <>
      {cmsStyle}
      <main className="min-h-full p-6 text-[var(--portfolio-text)] md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--portfolio-muted)]">
            Content Management
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            About
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--portfolio-muted)]">
            Manage the personal introduction, biography,
            profile image and contact information shown in
            the public About section.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-10"
        >
          {/* Main Content */}
          <section className="rounded-2xl border border-[var(--portfolio-border)] bg-transparent p-6 md:p-8">
            <div className="mb-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--portfolio-muted)]">
                Main Content
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Introduction
              </h2>
            </div>

            <div className="space-y-6">
              <Field
                label="Eyebrow"
                value={settings.eyebrow}
                onChange={(value) =>
                  updateField("eyebrow", value)
                }
                placeholder="ABOUT"
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Title"
                  value={settings.title}
                  onChange={(value) =>
                    updateField("title", value)
                  }
                  placeholder="Building at the intersection of"
                />

                <Field
                  label="Title Accent"
                  value={settings.titleAccent}
                  onChange={(value) =>
                    updateField("titleAccent", value)
                  }
                  placeholder="technology and creativity."
                />
              </div>

              <TextAreaField
                label="Short Bio"
                value={settings.shortBio}
                onChange={(value) =>
                  updateField("shortBio", value)
                }
                rows={4}
                placeholder="Short introduction shown prominently on the site."
              />

              <TextAreaField
                label="Biography"
                value={settings.biography}
                onChange={(value) =>
                  updateField("biography", value)
                }
                rows={7}
                placeholder="Longer personal biography."
              />
            </div>
          </section>

          {/* Personal Details */}
          <section className="rounded-2xl border border-[var(--portfolio-border)] bg-transparent p-6 md:p-8">
            <div className="mb-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--portfolio-muted)]">
                Personal Details
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Information
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Location"
                  value={settings.location}
                  onChange={(value) =>
                    updateField("location", value)
                  }
                  placeholder="India"
                />

                <Field
                  label="Availability"
                  value={settings.availability}
                  onChange={(value) =>
                    updateField("availability", value)
                  }
                  placeholder="Open to opportunities..."
                />
              </div>

              <Field
                label="Profile Image Path"
                value={settings.profileImageUrl}
                onChange={(value) =>
                  updateField("profileImageUrl", value)
                }
                placeholder="/images/about/profile.jpg"
              />

              <p className="text-xs leading-5 text-[var(--portfolio-muted)]">
                Since permanent media is stored with the
                project, enter the public path here rather
                than uploading the image to Firebase.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-[var(--portfolio-border)] bg-transparent p-6 md:p-8">
            <div className="mb-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--portfolio-muted)]">
                Contact & Social
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Links
              </h2>
            </div>

            <div className="space-y-6">
              <Field
                label="Email"
                type="email"
                value={settings.email}
                onChange={(value) =>
                  updateField("email", value)
                }
                placeholder="your@email.com"
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="GitHub URL"
                  value={settings.githubUrl}
                  onChange={(value) =>
                    updateField("githubUrl", value)
                  }
                  placeholder="https://github.com/..."
                />

                <Field
                  label="LinkedIn URL"
                  value={settings.linkedinUrl}
                  onChange={(value) =>
                    updateField("linkedinUrl", value)
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <Field
                label="Instagram URL"
                value={settings.instagramUrl}
                onChange={(value) =>
                  updateField("instagramUrl", value)
                }
                placeholder="https://instagram.com/..."
              />
            </div>
          </section>

          {/* Save */}
          <div className="flex flex-col gap-4 border-t border-[var(--portfolio-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {message && (
                <p
                  className={`text-sm ${
                    message.includes("successfully")
                      ? "text-[var(--portfolio-accent)]"
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
              className="rounded-lg bg-[var(--portfolio-accent)] px-6 py-3 text-sm font-medium text-[var(--portfolio-background)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save About"}
            </button>
          </div>
        </form>
      </div>
      </main>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="admin-cms-field w-full rounded-lg border border-[var(--portfolio-border)] bg-[var(--portfolio-background)] px-4 py-3 text-sm text-[var(--portfolio-text)] outline-none transition-colors placeholder:text-[var(--portfolio-muted)] focus:border-[var(--portfolio-accent)]"
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
        className="admin-cms-field w-full resize-y rounded-lg border border-[var(--portfolio-border)] bg-[var(--portfolio-background)] px-4 py-3 text-sm leading-6 text-[var(--portfolio-text)] outline-none transition-colors placeholder:text-[var(--portfolio-muted)] focus:border-[var(--portfolio-accent)]"
      />
    </div>
  );
}