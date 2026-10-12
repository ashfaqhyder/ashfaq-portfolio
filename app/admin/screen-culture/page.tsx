"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Edit3, Eye, EyeOff, LoaderCircle, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import {
  createScreenCulturePoster, deleteScreenCulturePoster, getScreenCulturePosters, updateScreenCulturePoster,
  type ScreenCultureCategory, type ScreenCulturePoster,
} from "@/services/screen-culture";

const emptyForm = { category: "movies-series" as ScreenCultureCategory, title: "", description: "", imageUrl: "", imdbUrl: "", displayOrder: 0 };
export default function ScreenCultureAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState<ScreenCulturePoster[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, async currentUser => {
      if (!currentUser) { router.replace("/admin/login"); return; }
      try {
        const token = await currentUser.getIdTokenResult();
        if (token.claims.admin !== true) { await signOut(auth); router.replace("/admin/login"); return; }
        setUser(currentUser);
        setChecking(false);
      } catch { await signOut(auth); router.replace("/admin/login"); }
    });
  }, [router]);

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await getScreenCulturePosters()); }
    catch { setError("Could not load posters. Check Firestore permissions and your connection."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (user) void refresh(); }, [user, refresh]);

  async function addPoster(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    const url = form.imageUrl.trim();
    const imdbUrl = form.imdbUrl.trim();
    if (!title) { setError("Enter the movie, series, or anime title."); return; }
    if (!/^https?:\/\/\S+$/i.test(url)) { setError("Enter a valid public image URL beginning with https:// or http://."); return; }
    try {
      const parsedImdbUrl = new URL(imdbUrl);
      if (!/^https?:$/.test(parsedImdbUrl.protocol) || !/(^|\.)imdb\.com$/i.test(parsedImdbUrl.hostname) || !parsedImdbUrl.pathname.startsWith("/title/")) throw new Error("invalid IMDb URL");
    } catch { setError("Enter a valid IMDb title URL, such as https://www.imdb.com/title/tt1234567/"); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      if (editingId) {
        await updateScreenCulturePoster(editingId, { category: form.category, title, description, imageUrl: url, imdbUrl, displayOrder: Number(form.displayOrder) } as Parameters<typeof updateScreenCulturePoster>[1]);
        setNotice("Poster updated.");
      } else {
        await createScreenCulturePoster({ category: form.category, title, description, imageUrl: url, imdbUrl, published: true, displayOrder: Number(form.displayOrder) } as Parameters<typeof createScreenCulturePoster>[0]);
        setNotice("Poster added.");
      }
      setForm(emptyForm); setEditingId(null); await refresh();
    } catch { setError("Could not save the poster. Check Firestore permissions and the screenCulturePosters rules."); }
    finally { setBusy(false); }
  }
  function editPoster(item: ScreenCulturePoster) {
    if (!item.id) return;
    setEditingId(item.id);
    setForm({ category: item.category, title: item.title ?? "", description: (item as ScreenCulturePoster & { description?: string }).description ?? "", imageUrl: item.imageUrl, imdbUrl: item.imdbUrl ?? "", displayOrder: item.displayOrder ?? 0 });
    setNotice(""); setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function cancelEdit() { setEditingId(null); setForm(emptyForm); setError(""); setNotice(""); }

  async function togglePublished(item: ScreenCulturePoster) {
    if (!item.id) return;
    try { await updateScreenCulturePoster(item.id, { published: !item.published }); await refresh(); }
    catch { setError("Could not update the poster."); }
  }
  async function remove(item: ScreenCulturePoster) {
    if (!item.id || !window.confirm("Remove this poster from Screen Culture? The image itself will not be deleted.")) return;
    try { await deleteScreenCulturePoster(item.id); setNotice("Poster removed."); await refresh(); }
    catch { setError("Could not remove the poster."); }
  }
  async function move(item: ScreenCulturePoster, delta: number) {
    const sorted = [...items].sort((a,b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex(x => x.id === item.id), other = sorted[index + delta];
    if (!item.id || !other?.id) return;
    try {
      await Promise.all([
        updateScreenCulturePoster(item.id, { displayOrder: other.displayOrder }),
        updateScreenCulturePoster(other.id, { displayOrder: item.displayOrder }),
      ]);
      await refresh();
    } catch { setError("Could not reorder posters."); }
  }

  if (checking) return <div className="flex min-h-[55vh] items-center justify-center" style={{ color: "var(--portfolio-muted)" }}><LoaderCircle className="animate-spin" size={18} /></div>;
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8" style={{ color: "var(--portfolio-text)" }}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-mono text-[10px] uppercase tracking-[.3em]" style={{ color: "var(--portfolio-accent)" }}>Portfolio / CMS</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Screen Culture</h1><p className="mt-2 max-w-xl text-sm" style={{ color: "var(--portfolio-muted)" }}>Manage the posters that appear in Beyond the Frame. Images remain wherever their public URLs are hosted.</p></div>
        <button onClick={() => void refresh()} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm" style={{ borderColor: "var(--portfolio-border)" }}><RefreshCw size={14}/> Refresh</button>
      </header>

      <form onSubmit={addPoster} className="mb-12 grid gap-x-6 gap-y-6 rounded-2xl border p-6 sm:p-8 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-7" style={{ borderColor: "var(--portfolio-border)", background: "transparent" }}>
        <div className="sm:col-span-2"><p className="text-sm font-medium">{editingId ? "Edit poster details" : "Add a poster"}</p><p className="mt-1 text-xs" style={{ color: "var(--portfolio-muted)" }}>Add its display title, description, public poster image, and IMDb title page.</p></div>
        <label className="grid gap-2 text-xs" style={{ color: "var(--portfolio-muted)" }}>Category
          <select value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value as ScreenCultureCategory }))} className="h-11 rounded-xl border bg-transparent px-3 text-sm" style={{ borderColor: "var(--portfolio-border)", color: "var(--portfolio-text)" }}>
            <option value="movies-series">Movies &amp; Series</option><option value="anime">Anime</option>
          </select>
        </label>
        <label className="grid gap-2 text-xs" style={{ color: "var(--portfolio-muted)" }}>Title
          <input required type="text" maxLength={160} value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} placeholder="Movie, series, or anime title" className="h-11 rounded-xl border bg-transparent px-3 text-sm" style={{ borderColor: "var(--portfolio-border)", color: "var(--portfolio-text)" }}/>
        </label>
        <label className="grid gap-2 text-xs sm:col-span-2" style={{ color: "var(--portfolio-muted)" }}>Description
          <textarea value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} maxLength={1200} rows={3} placeholder="A short description shown below the selected title in Beyond the Frame" className="rounded-xl border bg-transparent px-3 py-3 text-sm leading-6" style={{ borderColor: "var(--portfolio-border)", color: "var(--portfolio-text)" }}/>
        </label>
        <label className="grid gap-2 text-xs" style={{ color: "var(--portfolio-muted)" }}>Public image URL
          <input required type="url" value={form.imageUrl} onChange={e => setForm(v => ({ ...v, imageUrl: e.target.value }))} placeholder="https://example.com/poster.jpg" className="h-11 rounded-xl border bg-transparent px-3 text-sm" style={{ borderColor: "var(--portfolio-border)", color: "var(--portfolio-text)" }}/>
        </label>
        <label className="grid gap-2 text-xs" style={{ color: "var(--portfolio-muted)" }}>IMDb title URL
          <input required type="url" value={form.imdbUrl} onChange={e => setForm(v => ({ ...v, imdbUrl: e.target.value }))} placeholder="https://www.imdb.com/title/tt.../" className="h-11 rounded-xl border bg-transparent px-3 text-sm" style={{ borderColor: "var(--portfolio-border)", color: "var(--portfolio-text)" }}/>
        </label>
        <label className="grid gap-2 text-xs" style={{ color: "var(--portfolio-muted)" }}>Display order
          <input required type="number" min={0} step={1} value={form.displayOrder} onChange={e => setForm(v => ({ ...v, displayOrder: Math.max(0, Number(e.target.value) || 0) }))} className="h-11 rounded-xl border bg-transparent px-3 text-sm" style={{ borderColor: "var(--portfolio-border)", color: "var(--portfolio-text)" }}/>
          <span className="text-[11px]" style={{ color: "var(--portfolio-muted)" }}>Lower numbers appear first.</span>
        </label>
        <button disabled={busy} className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl border px-5 text-sm font-medium disabled:opacity-50" style={{ borderColor: "var(--portfolio-border)", color: "var(--portfolio-text)", background: "transparent" }}><Plus size={15}/>{busy ? "Saving…" : editingId ? "Save changes" : "Add poster"}</button>
        {editingId && <button type="button" onClick={cancelEdit} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm" style={{ borderColor: "var(--portfolio-border)" }}><X size={14}/>Cancel</button>}
      </form>

      {notice && <p className="mb-4 text-sm" style={{ color: "var(--portfolio-accent)" }}>{notice}</p>}
      {error && <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>}
      {loading ? <div className="py-16 text-center text-sm" style={{ color: "var(--portfolio-muted)" }}>Loading collection…</div> : items.length === 0 ? <div className="rounded-2xl border border-dashed p-12 text-center text-sm" style={{ borderColor: "var(--portfolio-border)", color: "var(--portfolio-muted)" }}>No posters yet. Add a public image URL above.</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--portfolio-border)", background: "transparent" }}>
              <div className="relative aspect-[3/4] bg-black/10">
                {/* Remote URLs are rendered with img to avoid requiring next.config remotePatterns. */}
                <img src={item.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" onError={e => { e.currentTarget.style.opacity = "0.25"; }}/>
                <span className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-wider backdrop-blur-md" style={{ background: "var(--portfolio-background)", color: "var(--portfolio-text)" }}>{item.category === "anime" ? "Anime" : "Movies & Series"}</span>
                <span className="absolute right-3 top-3 rounded-full px-3 py-1 text-[10px]" style={{ background: item.published ? "var(--portfolio-accent)" : "var(--portfolio-background)", color: item.published ? "var(--portfolio-background)" : "var(--portfolio-muted)" }}>{item.published ? "Published" : "Hidden"}</span>
              </div>
              <div className="p-4">
                <h2 className="truncate text-base font-medium" title={item.title}>{item.title}</h2>
                {(item as ScreenCulturePoster & { description?: string }).description?.trim() && <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-5" style={{ color: "var(--portfolio-muted)" }}>{(item as ScreenCulturePoster & { description?: string }).description}</p>}
                <a href={item.imdbUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block truncate text-xs underline underline-offset-4" title={item.imdbUrl} style={{ color: "var(--portfolio-muted)" }}>Open IMDb page ↗</a>
                <p className="mt-2 truncate text-[11px]" title={item.imageUrl} style={{ color: "var(--portfolio-muted)" }}>{item.imageUrl}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <button title="Move up" disabled={index === 0} onClick={() => void move(item, -1)} className="rounded-lg border p-2 disabled:opacity-30" style={{ borderColor: "var(--portfolio-border)" }}><ArrowUp size={14}/></button>
                    <button title="Move down" disabled={index === items.length - 1} onClick={() => void move(item, 1)} className="rounded-lg border p-2 disabled:opacity-30" style={{ borderColor: "var(--portfolio-border)" }}><ArrowDown size={14}/></button>
                  </div>
                  <div className="flex gap-1">
                    <button title="Edit poster" onClick={() => editPoster(item)} className="rounded-lg border p-2" style={{ borderColor: "var(--portfolio-border)" }}><Edit3 size={14}/></button>
                    <button title={item.published ? "Unpublish" : "Publish"} onClick={() => void togglePublished(item)} className="rounded-lg border p-2" style={{ borderColor: "var(--portfolio-border)" }}>{item.published ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                    <button title="Delete poster" onClick={() => void remove(item)} className="rounded-lg border p-2 text-red-400" style={{ borderColor: "var(--portfolio-border)" }}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
