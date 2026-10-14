"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
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
  Clapperboard,
  Palette,
  Search,
  Settings,
  Eye,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { auth } from "@/lib/firebase/auth";
import {
  defaultAppearanceSettings,
  type AppearanceSettings,
} from "@/services/appearance";

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
    label: "Screen Culture",
    href: "/admin/screen-culture",
    icon: Clapperboard,
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

function MagneticAdminNavItem({
  item,
  isActive,
  sidebarOpen,
  mouseY,
  reducedMotion,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  sidebarOpen: boolean;
  mouseY: MotionValue<number>;
  reducedMotion: boolean;
  onNavigate: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseY, (value: number) => {
    if (!ref.current) return 9999;

    const rect = ref.current.getBoundingClientRect();
    const center = rect.top + rect.height / 2;

    return value - center;
  });

  const scale = useTransform(
    distance,
    [-110, 0, 110],
    [1, 1.08, 1]
  );

  const magneticX = useTransform(
    scale,
    (value) => (value - 1) * 10
  );

  const springConfig = {
    damping: 20,
    stiffness: 300,
    mass: 0.5,
  };

  const smoothScale = useSpring(scale, springConfig);
  const smoothX = useSpring(magneticX, springConfig);

  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      style={{
        scale: reducedMotion ? 1 : smoothScale,
        x: reducedMotion ? 0 : smoothX,
        transformOrigin: "left center",
      }}
      className="relative z-0"
    >
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-label={item.label}
        className={[
          "group relative flex h-11 items-center",
          "rounded-xl",
          "transition-colors duration-200",
          sidebarOpen
            ? "gap-3 px-3"
            : "justify-center px-2",
          isActive
            ? "text-white scale-[1.04] origin-left"
            : "text-neutral-500 hover:bg-transparent hover:text-[var(--portfolio-text)]",
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

        {/* Icon */}
        <span
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center",
            "transition-all duration-200",
            isActive
              ? "text-[var(--portfolio-accent)]"
              : "text-neutral-600 group-hover:text-neutral-300",
          ].join(" ")}
        >
          <Icon size={17} strokeWidth={1.5} />
        </span>

        {/* Expanded label */}
        {sidebarOpen && (
          <span className="truncate text-xs font-medium">
            {item.label}
          </span>
        )}

        {/* Collapsed tooltip */}
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

            <span
              className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-neutral-800 bg-[#0b0b0b]"
              aria-hidden="true"
            />
          </span>
        )}
      </Link>
    </motion.div>
  );
}

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

  const [appearance, setAppearance] =
    useState<AppearanceSettings>(
      defaultAppearanceSettings
    );

  /*
   * Magnetic sidebar navigation.
   * The mouse position is tracked vertically so nearby
   * menu items subtly scale and move toward the pointer.
   */
  const menuMouseY = useMotionValue(Infinity);
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    async function loadAdminAppearance() {
      try {
        const response = await fetch(
          "/api/admin/appearance",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load CMS Appearance."
          );
        }

        const result = await response.json();

        if (!cancelled && result?.settings) {
          setAppearance({
            ...defaultAppearanceSettings,
            ...result.settings,
          });
        }
      } catch (error) {
        console.error(
          "Failed to load CMS Appearance:",
          error
        );
      }
    }

    loadAdminAppearance();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, pathname]);

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

  useEffect(() => {
    if (!isAdmin) return;

    const root = document.documentElement;
    const body = document.body;

    root.dataset.adminAnimations = appearance.animationsEnabled
      ? "enabled"
      : "disabled";

    root.dataset.adminSmoothScroll = appearance.smoothScrollEnabled
      ? "enabled"
      : "disabled";

    root.dataset.ditherBackground = appearance.ditherBackgroundEnabled
      ? "enabled"
      : "disabled";

    /*
     * Keep the CMS Appearance values available globally.
     *
     * The admin shell has its own data-admin-theme wrapper, but
     * global elements such as the dither canvas, scrollbar and
     * html/body also need to read the same CMS variables.
     */
    root.style.setProperty(
      "--portfolio-background",
      appearance.backgroundColor
    );
    root.style.setProperty(
      "--portfolio-surface",
      appearance.surfaceColor
    );
    root.style.setProperty(
      "--portfolio-text",
      appearance.textColor
    );
    root.style.setProperty(
      "--portfolio-muted",
      appearance.mutedColor
    );
    root.style.setProperty(
      "--portfolio-border",
      appearance.borderColor
    );
    root.style.setProperty(
      "--portfolio-accent",
      appearance.accentColor
    );

    body.style.backgroundColor = appearance.backgroundColor;
    body.style.color = appearance.textColor;
    root.style.backgroundColor = appearance.backgroundColor;
    root.style.color = appearance.textColor;

    root.style.scrollBehavior = appearance.smoothScrollEnabled
      ? "smooth"
      : "auto";

    return () => {
      delete root.dataset.adminAnimations;
      delete root.dataset.adminSmoothScroll;
      delete root.dataset.ditherBackground;
      root.style.scrollBehavior = "auto";
    };
  }, [appearance, isAdmin]);

  /*
   * Listen for an Appearance save made from the CMS Appearance
   * page so every already-mounted admin section updates instantly.
   */
  useEffect(() => {
    if (!isAdmin) return;

    function handleAppearanceUpdate(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<AppearanceSettings>;

      if (!customEvent.detail) return;

      setAppearance({
        ...defaultAppearanceSettings,
        ...customEvent.detail,
      });
    }

    window.addEventListener(
      "portfolio-appearance-updated",
      handleAppearanceUpdate
    );

    return () => {
      window.removeEventListener(
        "portfolio-appearance-updated",
        handleAppearanceUpdate
      );
    };
  }, [isAdmin]);

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
      <div className="min-h-screen bg-transparent text-white">
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
      <div className="min-h-screen bg-transparent text-white">
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
    <div
      data-admin-theme="true"
      className="min-h-screen"
      style={{
        "--portfolio-background": appearance.backgroundColor,
        "--portfolio-surface": appearance.surfaceColor,
        "--portfolio-text": appearance.textColor,
        "--portfolio-muted": appearance.mutedColor,
        "--portfolio-border": appearance.borderColor,
        "--portfolio-accent": appearance.accentColor,
        backgroundColor: appearance.backgroundColor,
        color: appearance.textColor,
      } as React.CSSProperties}
    >

      <style jsx global>{`
        [data-admin-theme] {
          --cms-bg: var(--portfolio-background);
          --cms-surface: var(--portfolio-surface);
          --cms-text: var(--portfolio-text);
          --cms-muted: var(--portfolio-muted);
          --cms-border: var(--portfolio-border);
          --cms-accent: var(--portfolio-accent);
          background: var(--cms-bg);
          color: var(--cms-text);
        }

        [data-admin-theme] .bg-\[\#050505\],
        [data-admin-theme] .bg-\[\#080808\],
        [data-admin-theme] .bg-\[\#090909\] {
          background-color: var(--cms-bg) !important;
        }

        /* Keep explicitly transparent admin surfaces transparent so the
           global dither field can remain visible underneath them. */
        [data-admin-theme] .bg-transparent {
          background-color: transparent !important;
        }

        [data-admin-theme] .bg-neutral-900,
        [data-admin-theme] .bg-neutral-800 {
          background-color: var(--cms-surface) !important;
        }

        [data-admin-theme] .text-white,
        [data-admin-theme] .text-neutral-100,
        [data-admin-theme] .text-neutral-200 {
          color: var(--cms-text) !important;
        }

        [data-admin-theme] .text-neutral-300,
        [data-admin-theme] .text-neutral-400 {
          color: color-mix(in srgb, var(--cms-text) 78%, var(--cms-muted)) !important;
        }

        [data-admin-theme] .text-neutral-500,
        [data-admin-theme] .text-neutral-600,
        [data-admin-theme] .text-neutral-700 {
          color: var(--cms-muted) !important;
        }

        [data-admin-theme] .border-neutral-900,
        [data-admin-theme] .border-neutral-800,
        [data-admin-theme] .border-neutral-700 {
          border-color: var(--cms-border) !important;
        }

        [data-admin-theme] .hover\:text-white:hover {
          color: var(--cms-text) !important;
        }

        [data-admin-theme] .hover\:text-neutral-300:hover,
        [data-admin-theme] .hover\:text-neutral-400:hover {
          color: var(--cms-text) !important;
        }

        [data-admin-theme] .hover\:border-neutral-600:hover,
        [data-admin-theme] .hover\:border-neutral-700:hover,
        [data-admin-theme] .hover\:border-neutral-800:hover {
          border-color: var(--cms-accent) !important;
        }

        [data-admin-theme] input,
        [data-admin-theme] textarea,
        [data-admin-theme] select {
          color: var(--cms-text);
          background-color: var(--cms-bg);
          border-color: var(--cms-border);
        }

        [data-admin-theme] input::placeholder,
        [data-admin-theme] textarea::placeholder {
          color: var(--cms-muted);
        }

        [data-admin-theme] input:focus,
        [data-admin-theme] textarea:focus,
        [data-admin-theme] select:focus {
          border-color: var(--cms-accent);
          outline-color: var(--cms-accent);
        }

        [data-admin-theme] ::selection {
          background: var(--cms-accent);
          color: var(--cms-bg);
        }

        /* Hide scrollbars while keeping scrolling fully functional */
        [data-admin-theme] {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        [data-admin-theme] * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        [data-admin-theme]::-webkit-scrollbar,
        [data-admin-theme] *::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        html[data-admin-animations=\"disabled\"] [data-admin-theme] *,
        html[data-admin-animations=\"disabled\"] [data-admin-theme] *::before,
        html[data-admin-animations=\"disabled\"] [data-admin-theme] *::after {
          animation: none !important;
          transition: none !important;
        }
      `}</style>

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
          className="fixed inset-0 z-30 bg-transparent/60 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={[
          "fixed left-0 top-0 z-40 flex h-screen flex-col",
          "rounded-r-2xl border-r border-neutral-900 bg-transparent",
          "transition-[width,transform] duration-300 ease-out",

          sidebarOpen
            ? "w-[270px]"
            : "w-[76px]",

          "max-md:w-[270px]",

          sidebarOpen
            ? "max-md:translate-x-0"
            : "max-md:-translate-x-full",
        ].join(" ")}
        style={{
          backgroundColor: "var(--portfolio-background)",
          borderColor: "var(--portfolio-border)",
          color: "var(--portfolio-text)",
        }}
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
          style={{
            borderColor: "var(--portfolio-border)",
          }}
        >
          {sidebarOpen && (
            <Link
              href="/admin"
              className="group flex min-w-0 items-center gap-3"
            >
              <span
                aria-label="Ashfaq Hyder"
                role="img"
                className="h-9 w-9 shrink-0 bg-[var(--portfolio-text)]"
                style={{
                  WebkitMaskImage: 'url("/ashfaq-hyder-logo.png?v=2")',
                  maskImage: 'url("/ashfaq-hyder-logo.png?v=2")',
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                }}
              />

              <div className="min-w-0">
                <div className="truncate text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--portfolio-text)] transition group-hover:text-[var(--portfolio-text)]">
                  Ashfaq Hyder
                </div>

                <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-neutral-700">
                  Portfolio CMS
                </div>
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
              "border",
              "text-neutral-500",
              "transition",
              "hover:border-[var(--portfolio-accent)]",
              "hover:text-[var(--portfolio-accent)]",
            ].join(" ")}
            style={{
              borderColor: "var(--portfolio-border)",
              color: "var(--portfolio-muted)",
            }}
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

        <nav
          className="flex-1 overflow-y-auto px-3 py-5"
          onMouseMove={
            reducedMotion
              ? undefined
              : (event) => menuMouseY.set(event.clientY)
          }
          onMouseLeave={() => menuMouseY.set(Infinity)}
        >

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
                    pathname.startsWith(`${item.href}/`);

              return (
                <MagneticAdminNavItem
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  sidebarOpen={sidebarOpen}
                  mouseY={menuMouseY}
                  reducedMotion={reducedMotion}
                  onNavigate={() => {
                    /*
                     * Automatically close on mobile.
                     */
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                />
              );
            })}
          </div>
        </nav>

        {/* =================================================
            SIDEBAR FOOTER
        ================================================== */}

        <div
          className="shrink-0 border-t p-3"
          style={{ borderColor: "var(--portfolio-border)" }}
        >

          {sidebarOpen && user && (
            <div className="mb-3 border border-neutral-900 bg-transparent px-3 py-3">
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
            "border",
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