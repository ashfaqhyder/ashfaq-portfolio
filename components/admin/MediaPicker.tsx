"use client";

import { useEffect, useState } from "react";

import {
  getMedia,
  MediaItem,
} from "@/services/media";

interface MediaPickerProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function MediaPicker({
  value,
  onChange,
}: MediaPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    loadMedia();
  }, [open]);

  async function loadMedia() {
    try {
      setLoading(true);
      setError("");

      const data = await getMedia();

      setMedia(
        data.filter((item) => item.type === "image")
      );
    } catch (err) {
      console.error("Failed to load media:", err);
      setError("Unable to load media.");
    } finally {
      setLoading(false);
    }
  }

  function selectMedia(item: MediaItem) {
    onChange(item.url);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Current Image */}
      {value ? (
        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black">
          <div className="aspect-video">
            <img
              src={value}
              alt="Selected project media"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between border-t border-neutral-800 p-3">
            <p className="max-w-[70%] truncate text-xs text-neutral-600">
              {value}
            </p>

            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-red-400 transition-colors hover:text-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-black">
          <p className="text-xs text-neutral-700">
            No project image selected
          </p>
        </div>
      )}

      {/* Choose Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-neutral-800 px-4 py-3 text-xs uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white"
      >
        {value ? "Change Media" : "Choose from Media Library"}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-[#080808]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-900 p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                  Media Library
                </p>

                <h2 className="mt-2 text-xl font-medium">
                  Choose Project Image
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[65vh] overflow-y-auto p-6">
              {loading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="aspect-video animate-pulse rounded-xl bg-neutral-900"
                    />
                  ))}
                </div>
              )}

              {!loading && error && (
                <div className="rounded-xl border border-red-900/30 bg-red-950/10 p-6">
                  <p className="text-sm text-red-400">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadMedia}
                    className="mt-4 text-xs text-neutral-400 hover:text-white"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading &&
                !error &&
                media.length === 0 && (
                  <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center">
                    <p className="text-sm text-neutral-600">
                      No image assets found.
                    </p>

                    <p className="mt-2 text-xs text-neutral-700">
                      Add images through the Media Library first.
                    </p>
                  </div>
                )}

              {!loading &&
                !error &&
                media.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {media.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => selectMedia(item)}
                        className="group overflow-hidden rounded-xl border border-neutral-800 bg-black text-left transition-all duration-300 hover:border-neutral-500"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

                          <div className="absolute bottom-3 right-3 translate-y-2 rounded-full bg-white px-3 py-1.5 text-[10px] uppercase tracking-wider text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            Select
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="truncate text-sm text-white">
                            {item.name}
                          </p>

                          <p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-600">
                            {item.folder}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}