"use client";

import {
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import {
  LayoutDashboard,
  Home,
  FolderKanban,
  BriefcaseBusiness,
  Trophy,
  UserRound,
  Sparkles,
  Camera,
  FlaskConical,
  MonitorCog,
  Images,
  Palette,
  Search,
  Settings,
  Eye,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { auth } from "@/lib/firebase/auth";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
}

const navigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Homepage",
    href: "/admin/homepage",
    icon: Home,
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    label: "Experience",
    href: "/admin/experience",
    icon: BriefcaseBusiness,
  },
  {
    label: "Achievements",
    href: "/admin/achievements",
    icon: Trophy,
  },
  {
    label: "About",
    href: "/admin/about",
    icon: UserRound,
  },
  {
    label: "Skills",
    href: "/admin/skills",
    icon: Sparkles,
  },
  {
    label: "Photography",
    href: "/admin/photography",
    icon: Camera,
  },
  {
    label: "Creative Lab",
    href: "/admin/creative-lab",
    icon: FlaskConical,
  },
  {
    label: "Digital Lab",
    href: "/admin/digital-lab",
    icon: MonitorCog,
  },
  {
    label: "Media Library",
    href: "/admin/media",
    icon: Images,
  },
  {
    label: "Appearance",
    href: "/admin/appearance",
    icon: Palette,
  },
  {
    label: "SEO",
    href: "/admin/seo",
    icon: Search,
  },
  {
    label: "Preview",
    href: "/admin/preview",
    icon: Eye,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [user, setUser] =
    useState<User | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  /*
   * Restore sidebar state after refresh.
   */
  useEffect(() => {
    const savedState =
      window.localStorage.getItem(
        "admin-sidebar-open"
      );

    if (savedState !== null) {
      setSidebarOpen(
        savedState === "true"
      );
    }
  }, []);

  /*
   * Persist sidebar state.
   */
  useEffect(() => {
    window.localStorage.setItem(
      "admin-sidebar-open",
      String(sidebarOpen)
    );
  }, [sidebarOpen]);

  /*
   * ============================================================
   * ADMIN AUTHENTICATION
   * ============================================================
   *
   * A user must satisfy BOTH:
   *
   * 1. Firebase authentication exists
   * 2. Firebase custom claim "admin" is exactly true
   *
   * Without both, the user is signed out and redirected
   * to the admin login page.
   */
  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          /*
           * No authenticated Firebase user.
           */
          if (!currentUser) {
            setUser(null);
            setIsAdmin(false);
            setAuthLoading(false);

            /*
             * Never allow unauthenticated users
             * to remain on an admin page.
             */
            if (pathname !== "/admin/login") {
              router.replace("/admin/login");
            }

            return;
          }

          /*
           * We have a Firebase user.
           * Now verify the ADMIN custom claim.
           */
          try {
            /*
             * Force refresh the ID token so that a recently
             * assigned/removed admin claim is picked up.
             */
            const tokenResult =
              await currentUser.getIdTokenResult(
                true
              );

            const adminClaim =
              tokenResult.claims.admin === true;

            /*
             * Authenticated but NOT an administrator.
             */
            if (!adminClaim) {
              console.warn(
                "Authenticated user does not have administrator access."
              );

              await signOut(auth);

              setUser(null);
              setIsAdmin(false);
              setAuthLoading(false);

              if (pathname !== "/admin/login") {
                router.replace("/admin/login");
              }

              return;
            }

            /*
             * Fully authenticated administrator.
             */
            setUser(currentUser);
            setIsAdmin(true);
            setAuthLoading(false);
          } catch (error) {
            console.error(
              "Failed to verify administrator access:",
              error
            );

            /*
             * If token verification fails, do not
             * allow access to the CMS.
             */
            try {
              await signOut(auth);
            } catch (signOutError) {
              console.error(
                "Failed to sign out invalid session:",
                signOutError
              );
            }

            setUser(null);
            setIsAdmin(false);
            setAuthLoading(false);

            if (pathname !== "/admin/login") {
              router.replace("/admin/login");
            }
          }
        }
      );

    return () => unsubscribe();
  }, [pathname, router]);

  /*
   * ============================================================
   * LOGIN PAGE
   * ============================================================
   *
   * The login page itself must remain accessible without
   * authentication.
   */
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  /*
   * ============================================================
   * AUTH LOADING
   * ============================================================
   *
   * Do not render any admin content while authentication
   * is being checked.
   */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-600">
            Verifying administrator access
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * HARD CLIENT-SIDE ADMIN GATE
   * ============================================================
   *
   * This prevents the admin children from rendering if:
   *
   * - no user exists
   * - admin claim is missing
   * - admin claim is false
   *
   * The redirect is already triggered above.
   */
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-600">
              Redirecting to login
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */
  async function handleLogout() {
    try {
      await signOut(auth);

      setUser(null);
      setIsAdmin(false);

      router.replace("/admin/login");
    } catch (error) {
      console.error(
        "Failed to sign out:",
        error
      );
    }
  }

  /*
   * ============================================================
   * ADMIN UI
   * ============================================================
   */
  return (
    <div className="min-h-screen bg-black text-white">

      {/* =====================================================
          MOBILE BACKDROP
      ====================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={[
          "fixed left-0 top-0 z-40 flex h-screen flex-col",
          "border-r border-neutral-900 bg-[#050505]",
          "transition-[width,transform] duration-300 ease-out",

          sidebarOpen
            ? "w-[270px]"
            : "w-[76px]",

          "max-md:w-[270px]",

          sidebarOpen
            ? "max-md:translate-x-0"
            : "max-md:-translate-x-full",
        ].join(" ")}
      >

        {/* =================================================
            SIDEBAR HEADER
        ================================================== */}

        <div
          className={[
            "flex h-20 shrink-0 items-center",
            "border-b border-neutral-900",

            sidebarOpen
              ? "justify-between px-5"
              : "justify-center px-2",
          ].join(" ")}
        >
          {sidebarOpen && (
            <Link
              href="/admin"
              className="group min-w-0"
            >
              <div className="truncate text-[11px] font-medium uppercase tracking-[0.28em] text-neutral-500 transition group-hover:text-white">
                Ashfaq Hyder
              </div>

              <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-neutral-700">
                Portfolio CMS
              </div>
            </Link>
          )}

          {/* Sidebar toggle */}

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(
                (current) => !current
              )
            }
            aria-label={
              sidebarOpen
                ? "Collapse navigation"
                : "Expand navigation"
            }
            title={
              sidebarOpen
                ? "Collapse navigation"
                : "Expand navigation"
            }
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center",
              "border border-neutral-800",
              "text-neutral-500",
              "transition",
              "hover:border-[var(--portfolio-accent)]",
              "hover:text-[var(--portfolio-accent)]",
            ].join(" ")}
          >
            {sidebarOpen ? (
              <X
                size={16}
                strokeWidth={1.5}
              />
            ) : (
              <Menu
                size={17}
                strokeWidth={1.5}
              />
            )}
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          {sidebarOpen && (
            <div className="mb-4 px-3 text-[9px] uppercase tracking-[0.3em] text-neutral-700">
              Navigation
            </div>
          )}

          {!sidebarOpen && (
            <div className="mb-4 h-3" />
          )}

          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href ||
                    pathname.startsWith(
                      `${item.href}/`
                    );

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    /*
                     * Automatically close on mobile.
                     */
                    if (
                      window.innerWidth < 768
                    ) {
                      setSidebarOpen(false);
                    }
                  }}
                  aria-label={item.label}
                  className={[
                    "group relative flex h-11 items-center",
                    "transition-all duration-200",

                    sidebarOpen
                      ? "gap-3 px-3"
                      : "justify-center px-2",

                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:bg-neutral-950 hover:text-white",
                  ].join(" ")}
                >

                  {/* Active indicator */}

                  <span
                    className={[
                      "absolute left-0 top-1/2 h-5 w-px -translate-y-1/2",
                      "transition-colors duration-200",

                      isActive
                        ? "bg-[var(--portfolio-accent)]"
                        : "bg-transparent",
                    ].join(" ")}
                  />

                  {/* =================================================
                      ICON
                  ================================================== */}

                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center",
                      "transition-all duration-200",

                      isActive
                        ? "text-[var(--portfolio-accent)]"
                        : "text-neutral-600 group-hover:text-neutral-300",
                    ].join(" ")}
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.5}
                    />
                  </span>

                  {/* =================================================
                      EXPANDED LABEL
                  ================================================== */}

                  {sidebarOpen && (
                    <span className="truncate text-xs font-medium">
                      {item.label}
                    </span>
                  )}

                  {/* =================================================
                      COLLAPSED TOOLTIP
                  ================================================== */}

                  {!sidebarOpen && (
                    <span
                      className={[
                        "pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[100]",
                        "-translate-y-1/2 translate-x-[-4px]",
                        "whitespace-nowrap",

                        "border border-neutral-800",
                        "bg-[#0b0b0b]",
                        "px-3 py-2",

                        "text-[10px] font-medium uppercase tracking-[0.16em]",
                        "text-neutral-300",

                        "opacity-0 shadow-2xl",

                        "transition-all duration-150",

                        "group-hover:translate-x-0",
                        "group-hover:opacity-100",
                      ].join(" ")}
                    >
                      {item.label}

                      {/* Tooltip arrow */}

                      <span
                        className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-neutral-800 bg-[#0b0b0b]"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* =================================================
            SIDEBAR FOOTER
        ================================================== */}

        <div className="shrink-0 border-t border-neutral-900 p-3">

          {sidebarOpen && user && (
            <div className="mb-3 border border-neutral-900 bg-neutral-950 px-3 py-3">
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-700">
                Administrator
              </p>

              <p className="mt-1 truncate text-[11px] text-neutral-500">
                {user.email}
              </p>
            </div>
          )}

          {/* Sign out */}

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            title={
              sidebarOpen
                ? undefined
                : "Sign out"
            }
            className={[
              "flex h-10 w-full items-center",
              "border border-neutral-900",
              "text-neutral-600",
              "transition",

              "hover:border-neutral-700",
              "hover:text-white",

              sidebarOpen
                ? "gap-3 px-3"
                : "justify-center px-2",
            ].join(" ")}
          >
            <LogOut
              size={15}
              strokeWidth={1.5}
            />

            {sidebarOpen && (
              <span className="text-[10px] uppercase tracking-[0.18em]">
                Sign out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className={[
          "min-h-screen transition-[margin] duration-300 ease-out",

          sidebarOpen
            ? "md:ml-[270px]"
            : "md:ml-[76px]",
        ].join(" ")}
      >

        {/* =================================================
            MOBILE OPEN BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            setSidebarOpen(true)
          }
          aria-label="Open admin navigation"
          title="Open navigation"
          className={[
            "fixed left-4 top-4 z-20",
            "flex h-9 w-9 items-center justify-center",
            "border border-neutral-800",
            "bg-[#050505]/90",
            "text-neutral-500",
            "backdrop-blur",
            "transition",

            "hover:border-[var(--portfolio-accent)]",
            "hover:text-[var(--portfolio-accent)]",

            "md:hidden",

            sidebarOpen
              ? "pointer-events-none opacity-0"
              : "opacity-100",
          ].join(" ")}
        >
          <Menu
            size={17}
            strokeWidth={1.5}
          />
        </button>

        {children}
      </div>
    </div>
  );
}