"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  defaultSiteSettings,
  getSiteSettings,
  resetSiteSettings,
  saveSiteSettings,
  SiteSettings,
} from "@/services/settings";

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<SiteSettings>(
      defaultSiteSettings
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [resetting, setResetting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(
    field: keyof SiteSettings,
    value: string | boolean
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

    setSaving(true);
    setMessage("");

    try {
      const {
        updatedAt,
        ...settingsToSave
      } = settings;

      await saveSiteSettings(
        settingsToSave
      );

      setMessage(
        "Settings saved successfully."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(
      "Reset all site settings to their default values?"
    );

    if (!confirmed) return;

    setResetting(true);
    setMessage("");

    try {
      const data =
        await resetSiteSettings();

      setSettings(
        data.settings ??
          defaultSiteSettings
      );

      setMessage(
        "Settings reset successfully."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to reset settings."
      );
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white md:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-neutral-500">
            Loading settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
            SITE CONFIGURATION
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Settings
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500">
            Manage operational settings,
            contact information and social
            connections for the portfolio.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Site Status */}
          <section className="border border-neutral-800 bg-neutral-950 p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                01 / SITE STATUS
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Availability
              </h2>
            </div>

            <div className="space-y-6">
              <label className="flex items-center justify-between gap-6 border-b border-neutral-900 pb-6">
                <div>
                  <p className="text-sm font-medium">
                    Site enabled
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Controls whether the public
                    portfolio is considered active.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={settings.siteEnabled}
                  onChange={(event) =>
                    updateField(
                      "siteEnabled",
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-[var(--portfolio-accent)]"
                />
              </label>

              <label className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-medium">
                    Maintenance mode
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Reserved for temporary
                    maintenance.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(event) =>
                    updateField(
                      "maintenanceMode",
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-[var(--portfolio-accent)]"
                />
              </label>
            </div>
          </section>

          {/* Contact */}
          <section className="border border-neutral-800 bg-neutral-950 p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                02 / CONTACT
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Contact information
              </h2>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-neutral-500">
                Primary Email
              </label>

              <input
                type="email"
                value={settings.contactEmail}
                onChange={(event) =>
                  updateField(
                    "contactEmail",
                    event.target.value
                  )
                }
                placeholder="hello@example.com"
                className="w-full border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--portfolio-accent)]"
              />
            </div>
          </section>

          {/* Social */}
          <section className="border border-neutral-800 bg-neutral-950 p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                03 / SOCIAL
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Social connections
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-neutral-500">
                  GitHub
                </label>

                <input
                  type="url"
                  value={settings.githubUrl}
                  onChange={(event) =>
                    updateField(
                      "githubUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://github.com/..."
                  className="w-full border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--portfolio-accent)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-neutral-500">
                  LinkedIn
                </label>

                <input
                  type="url"
                  value={settings.linkedinUrl}
                  onChange={(event) =>
                    updateField(
                      "linkedinUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://www.linkedin.com/in/..."
                  className="w-full border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--portfolio-accent)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-neutral-500">
                  Instagram
                </label>

                <input
                  type="url"
                  value={settings.instagramUrl}
                  onChange={(event) =>
                    updateField(
                      "instagramUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://www.instagram.com/..."
                  className="w-full border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--portfolio-accent)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-neutral-500">
                  X
                </label>

                <input
                  type="url"
                  value={settings.xUrl}
                  onChange={(event) =>
                    updateField(
                      "xUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://x.com/..."
                  className="w-full border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--portfolio-accent)]"
                />
              </div>
            </div>
          </section>

          {/* Content Defaults */}
          <section className="border border-neutral-800 bg-neutral-950 p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                04 / CONTENT DEFAULTS
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Publishing defaults
              </h2>
            </div>

            <div className="space-y-6">
              <SettingToggle
                label="New projects published by default"
                description="New project entries start as published."
                checked={
                  settings.newProjectsPublishedByDefault
                }
                onChange={(value) =>
                  updateField(
                    "newProjectsPublishedByDefault",
                    value
                  )
                }
              />

              <SettingToggle
                label="New achievements published by default"
                description="New achievement entries start as published."
                checked={
                  settings.newAchievementsPublishedByDefault
                }
                onChange={(value) =>
                  updateField(
                    "newAchievementsPublishedByDefault",
                    value
                  )
                }
              />

              <SettingToggle
                label="New experience published by default"
                description="New experience entries start as published."
                checked={
                  settings.newExperiencePublishedByDefault
                }
                onChange={(value) =>
                  updateField(
                    "newExperiencePublishedByDefault",
                    value
                  )
                }
              />
            </div>
          </section>

          {/* CMS Preferences */}
          <section className="border border-neutral-800 bg-neutral-950 p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                05 / CMS PREFERENCES
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Editor preferences
              </h2>
            </div>

            <div className="space-y-6">
              <SettingToggle
                label="Confirm before delete"
                description="Ask for confirmation before deleting CMS content."
                checked={settings.confirmBeforeDelete}
                onChange={(value) =>
                  updateField(
                    "confirmBeforeDelete",
                    value
                  )
                }
              />

              <SettingToggle
                label="Auto-save"
                description="Reserved for future automatic CMS saving."
                checked={settings.autoSaveEnabled}
                onChange={(value) =>
                  updateField(
                    "autoSaveEnabled",
                    value
                  )
                }
              />
            </div>
          </section>

          {/* Site Defaults */}
          <section className="border border-neutral-800 bg-neutral-950 p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                06 / LOCALIZATION
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Language &amp; timezone
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-neutral-500">
                  Default Language
                </label>

                <select
                  value={settings.defaultLanguage}
                  onChange={(event) =>
                    updateField(
                      "defaultLanguage",
                      event.target.value
                    )
                  }
                  className="w-full border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--portfolio-accent)]"
                >
                  <option value="en">
                    English
                  </option>

                  <option value="en-IN">
                    English — India
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-neutral-500">
                  Timezone
                </label>

                <select
                  value={settings.timezone}
                  onChange={(event) =>
                    updateField(
                      "timezone",
                      event.target.value
                    )
                  }
                  className="w-full border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--portfolio-accent)]"
                >
                  <option value="Asia/Kolkata">
                    Asia/Kolkata
                  </option>

                  <option value="UTC">
                    UTC
                  </option>

                  <option value="America/New_York">
                    America/New_York
                  </option>

                  <option value="Europe/London">
                    Europe/London
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-5 border-t border-neutral-900 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div
              className={
                message.includes("successfully")
                  ? "text-sm text-[var(--portfolio-accent)]"
                  : "text-sm text-neutral-500"
              }
            >
              {message}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="border border-neutral-700 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition hover:border-[var(--portfolio-accent)] hover:text-[var(--portfolio-accent)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Settings"}
            </button>
          </div>

          {/* Danger Zone */}
          <section className="border border-red-950/60 bg-red-950/5 p-6 md:p-8">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-red-900">
                07 / DANGER ZONE
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Reset settings
              </h2>

              <p className="mt-3 max-w-xl text-xs leading-6 text-neutral-600">
                Restore operational, contact, social and
                publishing settings to their safe defaults.
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="border border-red-950 px-5 py-3 text-xs uppercase tracking-[0.18em] text-red-800 transition hover:border-red-800 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resetting
                ? "Resetting..."
                : "Reset Settings"}
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}

function SettingToggle({
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
    <label className="flex items-center justify-between gap-6 border-b border-neutral-900 pb-6 last:border-b-0 last:pb-0">
      <div>
        <p className="text-sm font-medium">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-neutral-500">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-5 w-5 shrink-0 accent-[var(--portfolio-accent)]"
      />
    </label>
  );
}