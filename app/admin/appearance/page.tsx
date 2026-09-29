"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  AppearanceSettings,
  defaultAppearanceSettings,
  getAppearanceSettings,
  saveAppearanceSettings,
} from "@/services/appearance";

export default function AppearanceAdminPage() {
  const [settings, setSettings] =
    useState<AppearanceSettings>(
      defaultAppearanceSettings
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadAppearance() {
      try {
        const data =
          await getAppearanceSettings();

        setSettings(data);
      } catch (error) {
        console.error(
          "Failed to load Appearance settings:",
          error
        );

        setMessage(
          "Failed to load Appearance settings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAppearance();
  }, []);

  function updateField<
    K extends keyof AppearanceSettings
  >(
    field: K,
    value: AppearanceSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  }

  function resetSettings() {
    setSettings(defaultAppearanceSettings);
    setMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      await saveAppearanceSettings({
        backgroundColor:
          settings.backgroundColor,
        surfaceColor:
          settings.surfaceColor,
        textColor:
          settings.textColor,
        mutedColor:
          settings.mutedColor,
        borderColor:
          settings.borderColor,
        accentColor:
          settings.accentColor,
        animationsEnabled:
          settings.animationsEnabled,
        smoothScrollEnabled:
          settings.smoothScrollEnabled,
      });

      setMessage(
        "Appearance settings saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save Appearance settings:",
        error
      );

      setMessage(
        "Failed to save Appearance settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-neutral-500">
            Loading Appearance settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Site Configuration
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Appearance
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage the visual foundation of the
            portfolio without editing CSS or code.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-10"
        >

          {/* ================================================= */}
          {/* COLORS                                            */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">

            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Color System
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Visual identity
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                These values control the core palette
                used throughout the portfolio.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <ColorField
                label="Background"
                value={
                  settings.backgroundColor
                }
                onChange={(value) =>
                  updateField(
                    "backgroundColor",
                    value
                  )
                }
                description="Main page background."
              />

              <ColorField
                label="Surface"
                value={
                  settings.surfaceColor
                }
                onChange={(value) =>
                  updateField(
                    "surfaceColor",
                    value
                  )
                }
                description="Cards, panels and elevated surfaces."
              />

              <ColorField
                label="Primary Text"
                value={
                  settings.textColor
                }
                onChange={(value) =>
                  updateField(
                    "textColor",
                    value
                  )
                }
                description="Main typography."
              />

              <ColorField
                label="Muted Text"
                value={
                  settings.mutedColor
                }
                onChange={(value) =>
                  updateField(
                    "mutedColor",
                    value
                  )
                }
                description="Secondary and supporting text."
              />

              <ColorField
                label="Border"
                value={
                  settings.borderColor
                }
                onChange={(value) =>
                  updateField(
                    "borderColor",
                    value
                  )
                }
                description="Dividers, outlines and subtle borders."
              />

              <ColorField
                label="Accent"
                value={
                  settings.accentColor
                }
                onChange={(value) =>
                  updateField(
                    "accentColor",
                    value
                  )
                }
                description="Primary interactive accent."
              />

            </div>

            {/* Preview */}
            <div className="mt-8 overflow-hidden rounded-xl border border-neutral-800">
              <div
                className="p-6"
                style={{
                  backgroundColor:
                    settings.backgroundColor,
                  color:
                    settings.textColor,
                }}
              >
                <div className="flex flex-wrap items-center gap-4">

                  <span
                    className="rounded-full px-4 py-2 text-xs"
                    style={{
                      backgroundColor:
                        settings.surfaceColor,
                      border: `1px solid ${settings.borderColor}`,
                      color:
                        settings.mutedColor,
                    }}
                  >
                    Surface
                  </span>

                  <span
                    className="rounded-full px-4 py-2 text-xs"
                    style={{
                      backgroundColor:
                        settings.accentColor,
                      color:
                        settings.backgroundColor,
                    }}
                  >
                    Accent
                  </span>

                  <span
                    className="text-sm"
                    style={{
                      color:
                        settings.mutedColor,
                    }}
                  >
                    Muted text preview
                  </span>

                </div>

                <h3 className="mt-6 text-2xl font-medium">
                  Appearance preview
                </h3>

                <p
                  className="mt-2 max-w-xl text-sm leading-6"
                  style={{
                    color:
                      settings.mutedColor,
                  }}
                >
                  This preview updates as you edit
                  the color values.
                </p>
              </div>
            </div>

          </section>


          {/* ================================================= */}
          {/* MOTION                                             */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">

            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Motion
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Interaction preferences
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Control global motion behavior for
                the public portfolio.
              </p>
            </div>

            <div className="space-y-4">

              <ToggleField
                label="Animations"
                description="Enable motion and transition effects throughout the public portfolio."
                checked={
                  settings.animationsEnabled
                }
                onChange={(value) =>
                  updateField(
                    "animationsEnabled",
                    value
                  )
                }
              />

              <ToggleField
                label="Smooth Scrolling"
                description="Enable smooth scrolling behavior for the public portfolio."
                checked={
                  settings.smoothScrollEnabled
                }
                onChange={(value) =>
                  updateField(
                    "smoothScrollEnabled",
                    value
                  )
                }
              />

            </div>

          </section>


          {/* ================================================= */}
          {/* CURRENT VALUES                                     */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">

            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Current Theme
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Configuration
              </h2>
            </div>

            <div className="grid gap-3 text-sm">

              <ValueRow
                label="Background"
                value={
                  settings.backgroundColor
                }
              />

              <ValueRow
                label="Surface"
                value={
                  settings.surfaceColor
                }
              />

              <ValueRow
                label="Text"
                value={
                  settings.textColor
                }
              />

              <ValueRow
                label="Muted"
                value={
                  settings.mutedColor
                }
              />

              <ValueRow
                label="Border"
                value={
                  settings.borderColor
                }
              />

              <ValueRow
                label="Accent"
                value={
                  settings.accentColor
                }
              />

              <ValueRow
                label="Animations"
                value={
                  settings.animationsEnabled
                    ? "Enabled"
                    : "Disabled"
                }
              />

              <ValueRow
                label="Smooth Scroll"
                value={
                  settings.smoothScrollEnabled
                    ? "Enabled"
                    : "Disabled"
                }
              />

            </div>

          </section>


          {/* ================================================= */}
          {/* SAVE                                               */}
          {/* ================================================= */}

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

            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={resetSettings}
                className="rounded-lg border border-neutral-800 px-6 py-3 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Appearance"}
              </button>

            </div>

          </div>

        </form>
      </div>
    </main>
  );
}


/* ========================================================= */
/* COLOR FIELD                                               */
/* ========================================================= */

function ColorField({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description: string;
}) {
  return (
    <div className="space-y-3">

      <div>
        <label className="block text-sm font-medium text-neutral-300">
          {label}
        </label>

        <p className="mt-1 text-xs leading-5 text-neutral-600">
          {description}
        </p>
      </div>

      <div className="flex gap-3">

        <input
          type="color"
          value={
            isValidHex(value)
              ? value
              : "#000000"
          }
          onChange={(event) =>
            onChange(
              event.target.value.toUpperCase()
            )
          }
          className="h-12 w-14 cursor-pointer rounded-lg border border-neutral-800 bg-black p-1"
          aria-label={`${label} color picker`}
        />

        <input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="#050505"
          maxLength={7}
          className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-black px-4 py-3 font-mono text-sm text-white uppercase outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
        />

      </div>

      {!isValidHex(value) && (
        <p className="text-xs text-red-400">
          Enter a valid HEX color such as #B6FF3B.
        </p>
      )}

    </div>
  );
}


/* ========================================================= */
/* TOGGLE                                                    */
/* ========================================================= */

function ToggleField({
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
    <label className="flex cursor-pointer items-start justify-between gap-6 rounded-xl border border-neutral-800 bg-black p-5 transition-colors hover:border-neutral-700">

      <div>
        <p className="text-sm font-medium text-neutral-300">
          {label}
        </p>

        <p className="mt-1 max-w-xl text-xs leading-5 text-neutral-600">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 h-4 w-4 shrink-0 accent-lime-400"
      />

    </label>
  );
}


/* ========================================================= */
/* VALUE ROW                                                 */
/* ========================================================= */

function ValueRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-neutral-900 py-3 last:border-b-0">

      <span className="text-neutral-500">
        {label}
      </span>

      <span className="font-mono text-xs text-neutral-300">
        {value}
      </span>

    </div>
  );
}


/* ========================================================= */
/* HEX VALIDATION                                            */
/* ========================================================= */

function isValidHex(
  value: string
) {
  return /^#[0-9A-Fa-f]{6}$/.test(
    value
  );
}