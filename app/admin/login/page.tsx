
"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase/auth";

import {
  AppearanceSettings,
  defaultAppearanceSettings,
  getAppearanceSettings,
} from "@/services/appearance";

import DitheredLogo from "@/components/DitheredLogo";

const LOGO_SRC = "/hyder-icon-logo.png";

const LOGIN_MESSAGES = [
  "Your digital workspace is ready.",
  "Build quietly. Make something remarkable.",
  "The studio is waiting for you.",
  "Shape ideas into something unforgettable.",
  "Welcome back to the control room.",
  "Code. Design. Intelligence. Continue.",
  "Everything is ready. Let’s create.",
  "Your portfolio, your rules.",
  "Good ideas deserve a beautiful place.",
  "Back to building something extraordinary.",
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }

  return "Good night";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [appearance, setAppearance] =
    useState<AppearanceSettings>(
      defaultAppearanceSettings
    );

  const [appearanceLoading, setAppearanceLoading] =
    useState(true);

  const [greeting, setGreeting] =
    useState("Welcome");

  const [loginMessage, setLoginMessage] =
    useState(LOGIN_MESSAGES[0]);

  /*
   * ============================================
   * LOAD APPEARANCE CMS
   * ============================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadAppearance() {
      try {
        const settings =
          await getAppearanceSettings();

        if (mounted) {
          setAppearance(settings);
        }
      } catch (error) {
        console.error(
          "Failed to load Appearance settings:",
          error
        );
      } finally {
        if (mounted) {
          setAppearanceLoading(false);
        }
      }
    }

    loadAppearance();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================
   * TIME-BASED GREETING
   * ============================================
   */

  useEffect(() => {
    function updateGreeting() {
      setGreeting(getGreeting());
    }

    updateGreeting();

    setLoginMessage(
      LOGIN_MESSAGES[
        Math.floor(Math.random() * LOGIN_MESSAGES.length)
      ]
    );

    const interval = window.setInterval(
      updateGreeting,
      60_000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /*
   * ============================================
   * LOGIN
   * ============================================
   */

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = credential.user;

      /*
       * Force Firebase to refresh the ID token
       * so the latest admin custom claim is loaded.
       */
      const tokenResult =
        await user.getIdTokenResult(true);

      /*
       * Only users with the admin custom claim
       * are allowed into the CMS.
       */
      if (tokenResult.claims.admin !== true) {
        await auth.signOut();

        setError(
          "This account is authenticated, but it does not have administrator access."
        );

        return;
      }

      router.replace("/admin/dashboard");
    } catch (error: unknown) {
      console.error(
        "Admin login error:",
        error
      );

      if (
        error &&
        typeof error === "object" &&
        "code" in error
      ) {
        const firebaseError =
          error as {
            code?: string;
            message?: string;
          };

        switch (firebaseError.code) {
          case "auth/invalid-credential":
          case "auth/invalid-login-credentials":
            setError(
              "Incorrect email or password."
            );
            break;

          case "auth/user-not-found":
            setError(
              "No account exists with this email address."
            );
            break;

          case "auth/wrong-password":
            setError(
              "Incorrect password."
            );
            break;

          case "auth/invalid-email":
            setError(
              "Please enter a valid email address."
            );
            break;

          case "auth/user-disabled":
            setError(
              "This account has been disabled."
            );
            break;

          case "auth/too-many-requests":
            setError(
              "Too many login attempts. Please wait and try again."
            );
            break;

          case "auth/network-request-failed":
            setError(
              "Network error. Check your internet connection and try again."
            );
            break;

          default:
            setError(
              firebaseError.message ||
                "Unable to sign in. Please try again."
            );
        }
      } else {
        setError(
          "Unable to sign in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================
   * THEME VALUES
   * ============================================
   */

  const theme = useMemo(
    () => ({
      background:
        appearance.backgroundColor,

      surface:
        appearance.surfaceColor,

      text:
        appearance.textColor,

      muted:
        appearance.mutedColor,

      border:
        appearance.borderColor,

      accent:
        appearance.accentColor,
    }),
    [appearance]
  );

  const animationsEnabled =
    appearance.animationsEnabled !== false;

  return (
    <main
      className="relative h-screen w-full overflow-hidden px-5 py-8 sm:px-8"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* ============================================
          AMBIENT BACKGROUND
          ============================================ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(
              circle at 50% 32%,
              color-mix(
                in srgb,
                ${theme.accent} 7%,
                transparent
              ) 0%,
              transparent 34%
            )
          `,
          opacity: animationsEnabled ? 1 : 0.7,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(
              ${theme.text} 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              ${theme.text} 1px,
              transparent 1px
            )
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* ============================================
          TOP META
          ============================================ */}

      <header className="absolute left-5 right-5 top-8 z-20 flex items-center justify-between sm:left-8 sm:right-8">
        <div>
          <p
            className="text-[9px] font-medium uppercase tracking-[0.32em]"
            style={{
              color: theme.muted,
            }}
          >
            ASHFAQ HYDER
          </p>

          <p
            className="mt-1 text-[8px] uppercase tracking-[0.24em]"
            style={{
              color: theme.muted,
              opacity: 0.65,
            }}
          >
            Portfolio Administration
          </p>
        </div>

        <div
          className="flex items-center gap-2 text-[8px] uppercase tracking-[0.22em]"
          style={{
            color: theme.muted,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: theme.accent,
              boxShadow: `0 0 12px ${theme.accent}`,
            }}
          />

          Secure Access
        </div>
      </header>

      {/* ============================================
          MAIN LOGIN EXPERIENCE
          ============================================ */}

      <div className="absolute inset-0 z-10 flex items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-[440px]">

          {/* ==========================================
              INTERACTIVE LOGO
              ========================================== */}

          <div
            className={[
              "mx-auto flex justify-center",
              animationsEnabled
                ? "animate-[fadeIn_900ms_ease-out]"
                : "",
            ].join(" ")}
            style={{
              color: theme.text,
            }}
          >
            {!appearanceLoading && (
              <DitheredLogo
                imageSrc={LOGO_SRC}
                particleColor={theme.text}
                className="h-56 w-56 sm:h-64 sm:w-64"
              />
            )}
          </div>

          {/* ==========================================
              WELCOME
              ========================================== */}

          <div className="mt-1 text-center">

            <p
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{
                color: theme.accent,
              }}
            >
              {greeting}
            </p>

            <h1
              className="mt-3 text-3xl font-medium tracking-[-0.035em] sm:text-4xl"
              style={{
                color: theme.text,
              }}
            >
              Welcome back, Hyder.
            </h1>

            <div
              className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-3"
              style={{
                color: theme.muted,
              }}
            >
              <span
                aria-hidden="true"
                className="h-px w-8 shrink-0"
                style={{
                  backgroundColor: theme.border,
                }}
              />

              <p
                className="text-center text-[11px] font-medium leading-5 tracking-[0.04em]"
                style={{
                  color: theme.muted,
                }}
              >
                {loginMessage}
              </p>

              <span
                aria-hidden="true"
                className="h-px w-8 shrink-0"
                style={{
                  backgroundColor: theme.border,
                }}
              />
            </div>
          </div>

          {/* ==========================================
              LOGIN FORM
              ========================================== */}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4"
          >
            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[10px] uppercase tracking-[0.2em]"
                style={{
                  color: theme.muted,
                }}
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                autoComplete="email"
                disabled={loading}
                className="h-12 w-full rounded-xl px-4 text-sm outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor: theme.surface,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    theme.accent;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    theme.border;
                }}
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[10px] uppercase tracking-[0.2em]"
                style={{
                  color: theme.muted,
                }}
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-12 w-full rounded-xl px-4 pr-20 text-sm outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor:
                      theme.surface,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      theme.accent;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      theme.border;
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-2 text-[9px] uppercase tracking-[0.15em] transition-colors disabled:cursor-not-allowed"
                  style={{
                    color: theme.muted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color =
                      theme.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color =
                      theme.muted;
                  }}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "View"}
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="rounded-xl px-4 py-3"
                style={{
                  backgroundColor:
                    `color-mix(in srgb, ${theme.accent} 7%, ${theme.surface})`,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div className="flex gap-3">
                  <span
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        theme.accent,
                    }}
                  />

                  <p
                    className="text-xs leading-5"
                    style={{
                      color: theme.text,
                    }}
                  >
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 h-12 w-full overflow-hidden rounded-xl text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed"
              style={{
                backgroundColor:
                  theme.accent,
                color:
                  theme.background,
                opacity: loading ? 0.65 : 1,
              }}
            >
              <span className="relative z-10">
                {loading
                  ? "Authenticating..."
                  : "Enter Admin"}
              </span>

              {!loading &&
                animationsEnabled && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-0"
                    style={{
                      backgroundColor:
                        theme.text,
                      opacity: 0.08,
                    }}
                  />
                )}
            </button>
          </form>

          {/* ==========================================
              FOOTER META
              ========================================== */}

          <div
            className="mt-6 flex items-center justify-center gap-3"
          >
            <span
              className="h-px w-8"
              style={{
                backgroundColor:
                  theme.border,
              }}
            />

            <span
              className="text-[8px] uppercase tracking-[0.25em]"
              style={{
                color: theme.muted,
                opacity: 0.65,
              }}
            >
              Private administration
            </span>

            <span
              className="h-px w-8"
              style={{
                backgroundColor:
                  theme.border,
              }}
            />
          </div>
        </div>
      </div>

      {/* ============================================
          LOCAL ANIMATION
          ============================================ */}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
