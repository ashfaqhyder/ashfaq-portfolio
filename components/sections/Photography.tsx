"use client";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  DoubleSide,
  LinearFilter,
  Mesh,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";
import {
  Suspense,
  type MutableRefObject,
  type WheelEvent as ReactWheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getPublishedPhotography,
  Photography as PhotographyItem,
} from "@/services/photography";
/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */
function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}
function easeOut(value: number) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}
function easeInOut(value: number) {
  const t = clamp(value);
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function range(value: number, start: number, end: number) {
  return clamp(
    (value - start) / Math.max(end - start, 0.0001),
  );
}
function wrap(value: number, length: number) {
  if (length <= 0) return 0;
  return ((value % length) + length) % length;
}
function wrappedOffset(value: number, length: number) {
  if (length <= 0) return 0;
  const wrapped = wrap(value, length);
  return wrapped > length / 2 ? wrapped - length : wrapped;
}
function imageAspect(texture: Texture) {
  const image = texture.image as
    | {
        naturalWidth?: number;
        naturalHeight?: number;
        width?: number;
        height?: number;
      }
    | undefined;
  const width = image?.naturalWidth ?? image?.width ?? 1;
  const height = image?.naturalHeight ?? image?.height ?? 1;
  return width / Math.max(height, 1);
}
/* -------------------------------------------------------------------------- */
/* Exact Skills-style heading transition                                     */
/* -------------------------------------------------------------------------- */
function PhotographyHeading({ progress }: { progress: number }) {
  const text = "Photography.";
  return (
    <h2
      className="font-[Syne,sans-serif] text-[clamp(2.8rem,4.8vw,5.2rem)] font-medium leading-[.9] tracking-[-.06em]"
      aria-label={text}
    >
      {Array.from(text).map((character, index) => {
        const count = text.length;
        const start = index / count;
        const end = (index + 1) / count;
        const local = clamp(
          (progress - start) / Math.max(end - start, 0.0001),
        );
        const reveal = easeOut(local);
        return (
          <span
            key={`${character}-${index}`}
            style={{
              display: "inline-block",
              color:
                reveal > 0.5
                  ? "var(--portfolio-text)"
                  : "var(--portfolio-accent)",
              opacity: 0.08 + reveal * 0.92,
              transform: `translate3d(0, ${(1 - reveal) * 10}px, 0)`,
              filter: `blur(${(1 - reveal) * 1.6}px)`,
              willChange: "transform, color, opacity, filter",
              transition:
                "color 600ms cubic-bezier(.16,1,.3,1), opacity 450ms cubic-bezier(.16,1,.3,1)",
            }}
          >
            {character === " " ? "\u00A0" : character}
          </span>
        );
      })}
    </h2>
  );
}
/* -------------------------------------------------------------------------- */
/* Flat photograph spiral                                                     */
/*                                                                            */
/* IMPORTANT: the images themselves are NOT bent by a vertex shader.          */
/* The spiral is produced only by position, depth, rotation and scale.       */
/* -------------------------------------------------------------------------- */
interface SpiralItem {
  src: string;
  title: string;
  alt: string;
  index: number;
}
interface SpiralSceneProps {
  items: SpiralItem[];
  targetProgress: MutableRefObject<number>;
  onSelect: (index: number) => void;
}
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`;
const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  varying vec2 vUv;
  vec2 coverUv(vec2 uv) {
    vec2 scale = vec2(1.0);
    if (uImageAspect > uPlaneAspect) {
      scale.x = uPlaneAspect / uImageAspect;
    } else {
      scale.y = uImageAspect / uPlaneAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }
  void main() {
    gl_FragColor =
      texture2D(uTexture, coverUv(vUv));
  }
`;
function SpiralScene({
  items,
  targetProgress,
  onSelect,
}: SpiralSceneProps) {
  const sceneItems = useMemo(
    () =>
      Array.from(
        { length: Math.max(items.length * 3, 24) },
        (_, index) => items[index % items.length],
      ),
    [items],
  );
  const textures = useLoader(
    TextureLoader,
    sceneItems.map((item) => item.src),
  );
  const { gl, viewport } = useThree();
  const progress = useRef(0);
  const meshes = useRef<(Mesh | null)[]>([]);
  const materials = useRef<any[]>([]);
  const uniforms = useMemo(
    () =>
      textures.map((texture) => ({
        uTexture: { value: texture },
        uImageAspect: {
          value: imageAspect(texture),
        },
        uPlaneAspect: { value: 3 / 2 },
      })),
    [textures],
  );
  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.anisotropy = Math.min(
        8,
        gl.capabilities.getMaxAnisotropy(),
      );
      texture.needsUpdate = true;
    });
  }, [gl, textures]);
  useFrame((_state, delta) => {
    const frameScale = Math.min(delta * 60, 3);
    const smoothing = 0.075;
    const ease =
      1 - Math.pow(1 - smoothing, frameScale);
    progress.current +=
      (targetProgress.current - progress.current) * ease;
    const factor = Math.max(viewport.factor, 1);
    const planeWidth = Math.min(
      235 / factor,
      viewport.width * 0.245,
    );
    const planeHeight = planeWidth / (3 / 2);
    const radius = Math.min(
      190 / factor,
      viewport.width * 0.27,
    );
    // Larger vertical separation so the spiral travels from near the
    // extreme top of the viewport to near the extreme bottom.
    const gap = Math.min(
      118 / factor,
      viewport.height * 0.13,
    );
    const count = sceneItems.length;
    meshes.current.forEach((mesh, index) => {
      const material = materials.current[index];
      if (!mesh || !material) return;
      const position = wrappedOffset(
        index - progress.current,
        count,
      );
      const angle = position * 0.72;
      const depth =
        (Math.cos(angle) + 1) / 2;
      const scale =
        0.76 + depth * 0.24;
      /*
       * Flat image planes.
       * No image deformation, no bend uniform,
       * no vignette, no tint, no glow.
       */
      mesh.position.set(
        Math.sin(angle) * radius,
        -position * gap,
        Math.cos(angle) * 2.2,
      );
      mesh.rotation.set(
        0,
        Math.sin(angle) * -0.62,
        0,
      );
      mesh.scale.set(
        planeWidth * scale,
        planeHeight * scale,
        1,
      );
      material.uniforms.uPlaneAspect.value =
        3 / 2;
    });
  });
  return (
    <>
      {sceneItems.map((item, index) => (
        <mesh
          key={`${item.src}-${index}`}
          ref={(node) => {
            meshes.current[index] = node;
          }}
          frustumCulled={false}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(item.index);
          }}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            ref={(node) => {
              materials.current[index] = node;
            }}
            uniforms={uniforms[index]}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={DoubleSide}
            depthTest
            depthWrite
          />
        </mesh>
      ))}
    </>
  );
}
/* -------------------------------------------------------------------------- */
/* Main section                                                               */
/* -------------------------------------------------------------------------- */
export default function Photography() {
  const sectionRef =
    useRef<HTMLElement | null>(null);
  const spiralViewportRef =
    useRef<HTMLDivElement | null>(null);
  const targetProgress = useRef(0);
  const [photos, setPhotos] =
    useState<PhotographyItem[]>([]);
  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);
  const [closingFocus, setClosingFocus] =
    useState(false);
  const [sectionProgress, setSectionProgress] =
    useState(0);
  const [webglAvailable, setWebglAvailable] =
    useState<boolean | null>(null);

  // Detect WebGL before mounting R3F. Some browsers/devices disable GPU
  // contexts entirely; mounting Canvas in that case throws a console error.
  useEffect(() => {
    let supported = false;
    let probe: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try {
      const canvas = document.createElement("canvas");
      probe =
        canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) as WebGL2RenderingContext | null;
      if (!probe) {
        probe = canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false }) as WebGLRenderingContext | null;
      }
      supported = Boolean(probe);
      const loseContext = probe?.getExtension("WEBGL_lose_context");
      loseContext?.loseContext();
    } catch {
      supported = false;
    }
    setWebglAvailable(supported);
  }, []);
  /* ------------------------------ CMS ----------------------------------- */
  useEffect(() => {
    let active = true;
    async function loadPhotography() {
      try {
        const data =
          await getPublishedPhotography();
        if (!active) return;
        setPhotos(
          [...data].sort(
            (a, b) =>
              (a.displayOrder ?? 0) -
              (b.displayOrder ?? 0),
          ),
        );
      } catch (error) {
        console.error(
          "Failed to load photography:",
          error,
        );
      }
    }
    loadPhotography();
    return () => {
      active = false;
    };
  }, []);
  /* ----------------------- Skills-style scroll --------------------------- */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect =
        section.getBoundingClientRect();
      const distance = Math.max(
        section.offsetHeight -
          window.innerHeight,
        1,
      );
      setSectionProgress(
        clamp(-rect.top / distance),
      );
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true },
    );
    window.addEventListener(
      "resize",
      onScroll,
    );
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(
        "scroll",
        onScroll,
      );
      window.removeEventListener(
        "resize",
        onScroll,
      );
    };
  }, []);
  /* ---------------------------- Focused photo ---------------------------- */
  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeFocusedPhoto();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex]);
  /* --------------------------- Timeline --------------------------------- */
  /*
   * 0.00 ───────────── 0.32
   * HEADING ONLY
   *
   * 0.32 ───────────── 0.58
   * SPIRAL ENTERS FROM BOTTOM
   *
   * 0.58 ───────────── 0.90
   * HEADING + SPIRAL
   *
   * 0.90 ───────────── 1.00
   * RELEASE
   */
  const headingProgress = easeOut(
    range(sectionProgress, 0.03, 0.32),
  );
  const spiralProgress = easeOut(
    range(sectionProgress, 0.34, 0.58),
  );
  const spiralActive =
    spiralProgress > 0.96;
  const sectionOutro = easeInOut(
    range(sectionProgress, 0.90, 1),
  );
  const items = useMemo<SpiralItem[]>(
    () =>
      photos.map((photo, index) => ({
        src: photo.photo,
        title: photo.title,
        alt: photo.title,
        index,
      })),
    [photos],
  );
  const activePhoto =
    activeIndex === null
      ? null
      : photos[activeIndex] ?? null;
  /* ---------------------- Right-side wheel ------------------------------- */
  useEffect(() => {
    const element = spiralViewportRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (!spiralActive || activePhoto !== null) return;
      // This is a native non-passive listener. It prevents the browser from
      // chaining the wheel gesture to document scrolling.
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const raw = event.deltaY || event.deltaX;
      const delta =
        Math.sign(raw) *
        Math.min(Math.abs(raw), 160);
      if (!delta) return;
      // Never clamp: SpiralScene wraps the visual positions indefinitely.
      targetProgress.current += delta * 0.0032;
    };
    element.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });
    return () => {
      element.removeEventListener("wheel", onWheel, true);
    };
  }, [spiralActive, activePhoto]);
  const handleSpiralWheel = (
    event: ReactWheelEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const closeFocusedPhoto = () => {
    if (activeIndex === null || closingFocus) return;
    setClosingFocus(true);
    window.setTimeout(() => {
      setActiveIndex(null);
      setClosingFocus(false);
    }, 650);
  };
  if (!photos.length) return null;
  return (
    <section
      id="photography"
      ref={sectionRef}
      className="relative w-full"
      style={{
        height: "300svh",
        background:
          "var(--portfolio-background)",
        color: "var(--portfolio-text)",
      }}
    >
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{
          background:
            "var(--portfolio-background)",
        }}
      >
        {/* Persistent eyebrow */}
        <div
          className="absolute left-6 top-20 z-[70] md:left-10 lg:left-16 lg:top-24"
          style={{
            opacity:
              activeIndex === null
                ? 1 - sectionOutro
                : 0,
          }}
        >
          <p
            className="font-mono text-[9px] uppercase tracking-[0.3em]"
            style={{
              color:
                "var(--portfolio-accent)",
            }}
          >
            / Outside the Code
          </p>
        </div>
        {/* ---------------------------------------------------------------- */}
        {/* HEADING — intentionally above the spiral                         */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[60] px-6 pt-28 md:px-10 lg:px-16 lg:pt-32"
          style={{
            opacity: 1,
            transform: `translate3d(0, ${
              (1 - headingProgress) * 20 -
              sectionOutro * 16
            }px, 0)`,
          }}
        >
          <div className="max-w-[52rem]">
            <PhotographyHeading
              progress={headingProgress}
            />
            <p
              className="mt-6 max-w-md text-sm leading-7"
              style={{
                color:
                  "var(--portfolio-muted)",
                opacity: easeOut(
                  range(
                    sectionProgress,
                    0.18,
                    0.34,
                  ),
                ),
              }}
            >
              Moments, places and details
              outside the code.
            </p>
          </div>
        </div>
        {/* ---------------------------------------------------------------- */}
        {/* SPIRAL — the only area that captures wheel input                 */}
        {/* ---------------------------------------------------------------- */}
        <div
          ref={spiralViewportRef}
          className="absolute right-[1.5%] top-0 z-[20] h-full w-[56%]"
          onWheel={handleSpiralWheel}
          style={{
            overscrollBehavior: "contain",
            overscrollBehaviorY: "contain",
            touchAction: "none",
            pointerEvents:
              spiralProgress > 0.03 && activePhoto === null
                ? "auto"
                : "none",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              opacity:
                activePhoto
                  ? 0
                  : spiralProgress,
              transform: `translate3d(0, ${
                (1 - spiralProgress) * 110
              }px, 0)`,
              transition:
                "opacity 550ms ease, transform 900ms cubic-bezier(.16,1,.3,1)",
              pointerEvents:
                activePhoto
                  ? "none"
                  : "auto",
            }}
          >
            {webglAvailable === true ? (
              <Canvas
                className="!h-full !w-full"
                dpr={[1, 1.5]}
                camera={{
                  position: [0, 0, 10],
                  fov: 44,
                  near: 0.1,
                  far: 100,
                }}
                gl={{
                  alpha: true,
                  antialias: false,
                  powerPreference: "default",
                }}
              >
                <Suspense fallback={null}>
                  <SpiralScene
                    items={items}
                    targetProgress={targetProgress}
                    onSelect={(index) => {
                      setClosingFocus(false);
                      setActiveIndex(index);
                    }}
                  />
                </Suspense>
              </Canvas>
            ) : webglAvailable === false ? (
              <div
                className="absolute inset-0 flex items-center justify-center px-8 text-center"
                aria-label="Photography gallery preview"
              >
                <div className="max-w-sm">
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.28em]"
                    style={{ color: "var(--portfolio-accent)" }}
                  >
                    Photography archive
                  </p>
                  <p
                    className="mt-4 text-sm leading-7 opacity-65"
                    style={{ color: "var(--portfolio-text)" }}
                  >
                    The interactive 3D gallery is unavailable because WebGL is disabled in this browser.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {/* ---------------------------------------------------------------- */}
        {/* Focused photograph + inline details                             */}
        {/* ---------------------------------------------------------------- */}
        {activePhoto && (
          <>
            {/* Left-side details live directly under the persistent heading. */}
            <div
              className="absolute left-6 top-[39%] z-[80] w-[min(38vw,34rem)] md:left-10 lg:left-16"
              style={{
                opacity: closingFocus ? 0 : 1,
                transform: closingFocus
                  ? "translate3d(0,18px,0)"
                  : "translate3d(0,0,0)",
                transition:
                  "opacity 500ms ease, transform 650ms cubic-bezier(.16,1,.3,1)",
              }}
            >
              <p
                className="font-mono text-[8px] uppercase tracking-[.25em]"
                style={{
                  color:
                    "var(--portfolio-accent)",
                }}
              >
                Photography
              </p>
              <h3
                className="mt-3 font-[Syne,sans-serif] text-[clamp(1.7rem,3vw,3.2rem)] font-medium leading-[.94] tracking-[-.045em]"
                style={{
                  color:
                    "var(--portfolio-text)",
                }}
              >
                {activePhoto.title}
              </h3>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[8px] uppercase tracking-[.18em]">
                {activePhoto.location && (
                  <span
                    style={{
                      color:
                        "var(--portfolio-muted)",
                    }}
                  >
                    {activePhoto.location}
                  </span>
                )}
                {activePhoto.date && (
                  <span
                    style={{
                      color:
                        "var(--portfolio-muted)",
                    }}
                  >
                    {activePhoto.date}
                  </span>
                )}
              </div>
              {activePhoto.description && (
                <p
                  className="mt-5 max-w-md text-sm leading-7"
                  style={{
                    color:
                      "var(--portfolio-muted)",
                  }}
                >
                  {activePhoto.description}
                </p>
              )}
            </div>
            {/* The selected image replaces the spiral on the right. */}
            <div
              className="absolute right-[1.5%] top-0 z-[75] flex h-full w-[56%] items-center justify-center"
              role="dialog"
              aria-modal="true"
              aria-label={activePhoto.title}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  opacity: closingFocus ? 0 : 1,
                  transform: closingFocus
                    ? "translate3d(0,24px,0) scale(.72)"
                    : "translate3d(0,0,0) scale(1)",
                  transition:
                    "opacity 600ms ease, transform 750ms cubic-bezier(.16,1,.3,1)",
                }}
              >
                <img
                  src={activePhoto.photo}
                  alt={activePhoto.title}
                  draggable={false}
                  onClick={closeFocusedPhoto}
                  className="max-h-[82%] max-w-[92%] cursor-pointer object-contain select-none"
                  style={{
                    filter: "none",
                  }}
                />
              </div>
              <button
                type="button"
                aria-label="Return photograph to spiral"
                onClick={closeFocusedPhoto}
                className="absolute right-2 top-0 z-[90] font-mono text-[9px] uppercase tracking-[.22em]"
                style={{
                  color:
                    "var(--portfolio-muted)",
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
        {/* Release marker */}
        <div
          className="pointer-events-none absolute bottom-6 left-6 z-[70] md:left-10 lg:left-16"
          style={{
            opacity:
              activeIndex === null
                ? sectionOutro
                : 0,
            transform: `translateY(${
              (1 - sectionOutro) * 12
            }px)`,
          }}
        >
          <span
            className="font-mono text-[8px] uppercase tracking-[.24em]"
            style={{
              color:
                "var(--portfolio-muted)",
            }}
          >
            The journey ahead
          </span>
        </div>
      </div>
    </section>
  );
}
