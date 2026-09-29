"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = credential.user;

      // Force Firebase to refresh the ID token so the latest
      // custom admin claim is loaded.
      const tokenResult = await user.getIdTokenResult(true);

      if (tokenResult.claims.admin !== true) {
        await auth.signOut();

        setError(
          "This account is authenticated, but it does not have administrator access."
        );

        return;
      }

      router.replace("/admin/dashboard");
    } catch (error: unknown) {
      console.error("Admin login error:", error);

      if (
        error &&
        typeof error === "object" &&
        "code" in error
      ) {
        const firebaseError = error as {
          code?: string;
          message?: string;
        };

        switch (firebaseError.code) {
          case "auth/invalid-credential":
          case "auth/invalid-login-credentials":
            setError("Incorrect email or password.");
            break;

          case "auth/user-not-found":
            setError("No account exists with this email address.");
            break;

          case "auth/wrong-password":
            setError("Incorrect password.");
            break;

          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;

          case "auth/user-disabled":
            setError("This account has been disabled.");
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
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <p className="text-xs tracking-[0.25em] text-neutral-500">
            ASHFAQ HYDER
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Admin Login
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Sign in to manage your portfolio.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-neutral-400"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3.5 text-white outline-none transition focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-neutral-400"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3.5 pr-20 text-white outline-none transition focus:border-white"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-neutral-400 transition hover:text-white"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "Hide" : "View"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3">
              <p className="text-sm leading-6 text-red-400">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3.5 font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}