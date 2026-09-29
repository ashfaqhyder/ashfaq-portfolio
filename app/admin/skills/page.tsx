"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  createSkill,
  deleteSkill,
  getSkills,
  learningContexts,
  proficiencyLevels,
  skillGroups,
  Skill,
  SkillGroup,
  ProficiencyLevel,
  LearningContext,
  updateSkill,
} from "@/services/skills";

const emptyForm = {
  name: "",
  group: "Programming" as SkillGroup,
  proficiency: "" as ProficiencyLevel | "",
  learningContext: [] as LearningContext[],
  yearsOfExperience: "",
  displayOrder: "1",
  published: true,
};

export default function SkillsAdminPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadSkills() {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (error) {
      console.error("Failed to load skills:", error);
      setMessage("Failed to load skills.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  function updateForm(
    field: keyof typeof emptyForm,
    value: string | boolean | LearningContext[]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  }

  function toggleLearningContext(
    context: LearningContext
  ) {
    setForm((current) => {
      const exists =
        current.learningContext.includes(context);

      return {
        ...current,
        learningContext: exists
          ? current.learningContext.filter(
              (item) => item !== context
            )
          : [
              ...current.learningContext,
              context,
            ],
      };
    });

    setMessage("");
  }

  function editSkill(skill: Skill) {
    setEditingId(skill.id ?? null);

    setForm({
      name: skill.name,
      group: skill.group,
      proficiency: skill.proficiency ?? "",
      learningContext:
        skill.learningContext ?? [],
      yearsOfExperience:
        skill.yearsOfExperience !== undefined
          ? String(skill.yearsOfExperience)
          : "",
      displayOrder: String(skill.displayOrder),
      published: skill.published,
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

    if (!form.name.trim()) {
      setMessage("Skill name is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const years =
        form.yearsOfExperience.trim() === ""
          ? undefined
          : Number(form.yearsOfExperience);

      const skillData = {
        name: form.name.trim(),
        group: form.group,
        ...(form.proficiency
          ? {
              proficiency:
                form.proficiency,
            }
          : {}),
        ...(form.learningContext.length > 0
          ? {
              learningContext:
                form.learningContext,
            }
          : {}),
        ...(years !== undefined &&
        !Number.isNaN(years)
          ? {
              yearsOfExperience: years,
            }
          : {}),
        displayOrder:
          Number(form.displayOrder) || 1,
        published: form.published,
      };

      if (editingId) {
        await updateSkill(
          editingId,
          skillData
        );

        setMessage(
          "Skill updated successfully."
        );
      } else {
        await createSkill(skillData);

        setMessage(
          "Skill created successfully."
        );
      }

      resetForm();
      await loadSkills();
    } catch (error) {
      console.error(
        "Failed to save skill:",
        error
      );

      setMessage(
        "Failed to save skill."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this skill? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSkill(id);

      setMessage(
        "Skill deleted successfully."
      );

      if (editingId === id) {
        resetForm();
      }

      await loadSkills();
    } catch (error) {
      console.error(
        "Failed to delete skill:",
        error
      );

      setMessage(
        "Failed to delete skill."
      );
    }
  }

  const groupedSkills = skillGroups.map(
    (group) => ({
      group,
      skills: skills
        .filter(
          (skill) => skill.group === group
        )
        .sort(
          (a, b) =>
            a.displayOrder -
            b.displayOrder
        ),
    })
  );

  return (
    <main className="p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Content Management
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Skills
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage technical skills, creative
            abilities, soft skills and languages.
            Proficiency and experience are optional.
          </p>
        </div>

        {/* Editor */}
        <section className="mb-12 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                {editingId
                  ? "Edit Skill"
                  : "New Skill"}
              </p>

              <h2 className="mt-2 text-xl font-medium">
                {editingId
                  ? "Update skill"
                  : "Add a skill"}
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
            {/* Name + Group */}
            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label="Skill Name"
                value={form.name}
                onChange={(value) =>
                  updateForm(
                    "name",
                    value
                  )
                }
                placeholder="Python"
                required
              />

              <SelectField
                label="Group"
                value={form.group}
                options={skillGroups}
                onChange={(value) =>
                  updateForm(
                    "group",
                    value as SkillGroup
                  )
                }
              />
            </div>

            {/* Proficiency + Experience */}
            <div className="grid gap-6 md:grid-cols-2">
              <SelectField
                label="Proficiency"
                value={form.proficiency}
                options={[
                  "Not specified",
                  ...proficiencyLevels,
                ]}
                onChange={(value) =>
                  updateForm(
                    "proficiency",
                    value ===
                      "Not specified"
                      ? ""
                      : value
                  )
                }
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Years of Experience
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={
                    form.yearsOfExperience
                  }
                  onChange={(event) =>
                    updateForm(
                      "yearsOfExperience",
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
                />

                <p className="text-xs text-neutral-600">
                  Optional. Leave empty if you
                  don't want to make a yearly
                  experience claim.
                </p>
              </div>
            </div>

            {/* Learning Context */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-300">
                  Learning Context
                </label>

                <p className="mt-1 text-xs text-neutral-600">
                  Select how you learned or used
                  this skill. Optional.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {learningContexts.map(
                  (context) => {
                    const selected =
                      form.learningContext.includes(
                        context
                      );

                    return (
                      <button
                        key={context}
                        type="button"
                        onClick={() =>
                          toggleLearningContext(
                            context
                          )
                        }
                        className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                          selected
                            ? "border-white bg-white text-black"
                            : "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        {context}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Order + Published */}
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
                    updateForm(
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
                  checked={form.published}
                  onChange={(event) =>
                    updateForm(
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
                  ? "Update Skill"
                  : "Add Skill"}
              </button>
            </div>
          </form>
        </section>

        {/* Skills List */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Skill Library
              </p>

              <h2 className="mt-2 text-xl font-medium">
                {skills.length}{" "}
                {skills.length === 1
                  ? "skill"
                  : "skills"}
              </h2>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-neutral-500">
              Loading skills...
            </p>
          ) : skills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center">
              <p className="text-sm text-neutral-500">
                No skills added yet.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {groupedSkills.map(
                ({ group, skills }) => {
                  if (skills.length === 0) {
                    return null;
                  }

                  return (
                    <div key={group}>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white">
                          {group}
                        </h3>

                        <span className="text-xs text-neutral-600">
                          {skills.length}
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-neutral-800">
                        {skills.map(
                          (skill, index) => (
                            <div
                              key={skill.id}
                              className={`flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between ${
                                index !==
                                skills.length -
                                  1
                                  ? "border-b border-neutral-800"
                                  : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h4 className="font-medium text-white">
                                    {skill.name}
                                  </h4>

                                  {!skill.published && (
                                    <span className="rounded-full border border-neutral-800 px-2 py-1 text-[10px] uppercase tracking-wider text-neutral-600">
                                      Draft
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
                                  {skill.proficiency && (
                                    <span>
                                      {
                                        skill.proficiency
                                      }
                                    </span>
                                  )}

                                  {skill.yearsOfExperience !==
                                    undefined && (
                                    <span>
                                      {
                                        skill.yearsOfExperience
                                      }{" "}
                                      {skill.yearsOfExperience ===
                                      1
                                        ? "year"
                                        : "years"}
                                    </span>
                                  )}

                                  {skill.learningContext &&
                                    skill
                                      .learningContext
                                      .length >
                                      0 && (
                                      <span>
                                        {skill.learningContext.join(
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
                                    editSkill(
                                      skill
                                    )
                                  }
                                  className="rounded-lg border border-neutral-800 px-4 py-2 text-xs text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    skill.id &&
                                    handleDelete(
                                      skill.id
                                    )
                                  }
                                  className="rounded-lg border border-neutral-800 px-4 py-2 text-xs text-neutral-500 transition-colors hover:border-red-900 hover:text-red-400"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                }
              )}
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
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-neutral-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-300">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-neutral-500"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}