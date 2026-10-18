"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { categoryLabels, MAX_FILE_BYTES, MAX_IMAGES, uploadTypes, type AdminImage, type AdminProject, type ProjectCategory } from "../../types/artwork";
import { dashboardRequest, errorMessage, orderedProject } from "./api";

type Fields = { title: string; slug: string; project_type: string; categories: ProjectCategory[]; sort_order: number };
type EditorImage = AdminImage & { preview?: string };
const emptyFields: Fields = { title: "", slug: "", project_type: "", categories: [], sort_order: 0 };
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 160).replace(/-$/, "");
const snapshot = (fields: Fields, images: EditorImage[]) => JSON.stringify({ fields, images: images.map(({ preview: _preview, ...image }) => image) });

async function dimensions(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth > 30000 || image.naturalHeight > 30000) throw new Error("Choose an image with dimensions up to 30,000 pixels.");
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally { URL.revokeObjectURL(url); }
}

export default function ProjectEditor({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [images, setImages] = useState<EditorImage[]>([]);
  const [baseline, setBaseline] = useState(snapshot(emptyFields, []));
  const [loading, setLoading] = useState(!!projectId);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [slugEdited, setSlugEdited] = useState(!!projectId);
  const [retry, setRetry] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const previews = useRef<string[]>([]);
  const operation = useRef<AbortController | null>(null);
  const dirty = snapshot(fields, images) !== baseline;

  function acceptProject(value: AdminProject) {
    const p = orderedProject(value);
    const next = { title: p.title || "", slug: p.slug, project_type: p.project_type, categories: p.categories, sort_order: p.sort_order };
    setProject(p); setFields(next); setImages(p.project_images); setBaseline(snapshot(next, p.project_images));
    previews.current.forEach(URL.revokeObjectURL); previews.current = [];
  }

  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();
    setLoading(true); setError("");
    dashboardRequest<{ project: AdminProject }>(`/api/admin/projects/${projectId}`, { signal: controller.signal })
      .then((data) => acceptProject(data.project))
      .catch((err) => { if (!controller.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [projectId, retry]);

  useEffect(() => () => { operation.current?.abort(); previews.current.forEach(URL.revokeObjectURL); }, []);
  useEffect(() => {
    if (!error) return;
    errorRef.current?.focus();
  }, [error]);
  useEffect(() => {
    if (!dirty && !busy) return;
    const unload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    const navigate = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest?.("a");
      if (!anchor || anchor.target === "_blank" || e.ctrlKey || e.metaKey) return;
      if (!window.confirm(busy ? "An operation is still running. Leave this editor?" : "Leave without saving your changes?")) { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", navigate, true); };
  }, [dirty, busy]);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setSuccess("");
    setFields((previous) => {
      const next = { ...previous, [key]: value };
      if (!slugEdited && (key === "title" || key === "project_type")) next.slug = slugify(next.title || next.project_type);
      return next;
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!fields.categories.length) { setError("Choose at least one category before saving."); return; }
    const intent = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value || "save";
    const isPublished = intent === "publish" || (intent === "save" && !!project?.is_published);
    if (isPublished && !images.length) { setError("Add at least one image before publishing."); return; }
    setBusy(true); setError(""); setSuccess("");
    const controller = new AbortController(); operation.current = controller;
    try {
      const { project: saved } = await dashboardRequest<{ project: AdminProject }>(project ? `/api/admin/projects/${project.id}` : "/api/admin/projects", {
        method: project ? "PUT" : "POST", signal: controller.signal,
        body: JSON.stringify({ ...fields, title: fields.title || null, is_published: isPublished, updated_at: project?.updated_at, images }),
      });
      acceptProject(saved);
      setSuccess(isPublished ? "Project published. It is available in the Supabase gallery." : "Draft saved. This project is not visible in the Supabase gallery.");
      if (!project) router.replace(`/dashboard/projects/${saved.id}`);
    } catch (err) { if (!controller.signal.aborted) setError(errorMessage(err)); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }

  async function upload(files: File[]) {
    if (!project || busy || !files.length) return;
    if (images.length + files.length > MAX_IMAGES) { setError(`A project can contain up to ${MAX_IMAGES} images.`); return; }
    for (const file of files) {
      if (!Object.hasOwn(uploadTypes, file.type) || file.size <= 0 || file.size > MAX_FILE_BYTES) {
        setError(`${file.name}: choose a JPEG, PNG, or WebP file up to 10 MB.`); return;
      }
    }
    setBusy(true); setError(""); setSuccess("");
    const controller = new AbortController(); operation.current = controller;
    try {
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading ${index + 1} of ${files.length}: ${file.name}`);
        const size = await dimensions(file);
        const permission = await dashboardRequest<{ id: string; path: string; signedUrl: string }>(`/api/admin/projects/${project.id}/uploads`, {
          method: "POST", body: JSON.stringify({ contentType: file.type, size: file.size }), signal: controller.signal,
        });
        const body = new FormData(); body.append("cacheControl", "300"); body.append("", file);
        const response = await fetch(permission.signedUrl, { method: "PUT", body, headers: { "x-upsert": "false" }, signal: controller.signal });
        if (!response.ok) throw new Error(`${file.name} could not be uploaded. Retry this file. Files already added are still in the editor.`);
        const preview = URL.createObjectURL(file); previews.current.push(preview);
        setImages((previous) => [...previous, { id: permission.id, storage_path: permission.path, alt_text: "", ...size, sort_order: previous.length, preview }]);
      }
      setSuccess("Images uploaded. Add a description for each, then save your changes.");
    } catch (err) { if (!controller.signal.aborted) setError(errorMessage(err)); }
    finally { if (!controller.signal.aborted) { setBusy(false); setProgress(""); } if (fileRef.current) fileRef.current.value = ""; }
  }

  function move(index: number, offset: number) {
    setImages((previous) => {
      const next = [...previous]; [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next.map((image, sort_order) => ({ ...image, sort_order }));
    });
    setSuccess("");
  }

  async function deleteProject() {
    if (!project || deleteConfirm !== "DELETE" || busy) return;
    setBusy(true); setError("");
    try {
      await dashboardRequest(`/api/admin/projects/${project.id}`, { method: "DELETE", body: JSON.stringify({ updated_at: project.updated_at, confirm: "DELETE" }) });
      setBaseline(snapshot(fields, images)); setSuccess("Project deleted. Original uploaded files were retained in Storage for manual recovery.");
      router.replace("/dashboard");
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  }

  if (loading) return <div className="studio-editor-loading" aria-busy="true"><h1>Loading project...</h1><p>Opening your artwork and project details.</p></div>;
  if (projectId && !project) return <div className="studio-message studio-message--error" role="alert"><h1>Project could not be opened</h1><p>{error}</p><button className="studio-button" onClick={() => setRetry((r) => r + 1)}>Retry</button> <Link className="studio-button" href="/dashboard">Back to library</Link></div>;

  return (
    <>
      <Link className="studio-back" href="/dashboard"><ArrowLeft size={16} aria-hidden="true" /> Artwork library</Link>
      <div className="studio-page-heading studio-page-heading--editor"><div><h1>{project ? "Edit project" : "New project"}<span>.</span></h1><p>{project ? "Give the work its context. Let the images lead." : "Start with the details. Add artwork after saving your draft."}</p></div><span className={`studio-status${project?.is_published ? " studio-status--published" : ""}`}>{project?.is_published ? "Published" : "Draft"}</span></div>
      {error && <div className="studio-message studio-message--error" role="alert" tabIndex={-1} ref={errorRef}><p>{error}</p>{error.includes("another session") && <button className="studio-button" onClick={() => { if (window.confirm("Discard unsaved changes and reload this project?")) setRetry((r) => r + 1); }}>Reload saved project</button>}{error.includes("session expired") && <a className="studio-button" href="/dashboard/login" target="_blank" rel="noopener noreferrer">Sign in in a new tab</a>}</div>}
      {success && <p className="studio-message studio-message--success" role="status">{success}</p>}
      <form ref={formRef} onSubmit={save}>
        <fieldset className="studio-editor-fieldset" disabled={busy}>
          <div className="studio-editor-layout">
            <section className="studio-artwork-editor" aria-labelledby="project-images-title">
              <div className="studio-section-heading"><div><h2 id="project-images-title">Project images</h2><p>Keep related visuals together. The first image is the gallery cover.</p></div><span>{images.length} / {MAX_IMAGES}</span></div>
              {!project ? <div className="studio-upload-unavailable"><ImagePlus size={32} strokeWidth={1.3} aria-hidden="true" /><h3>A draft comes first.</h3><p>Fill in the project details and save a draft to start adding images.</p></div> : <>
                <div className={`studio-upload${busy ? " studio-upload--busy" : ""}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void upload(Array.from(e.dataTransfer.files)); }}>
                  <Upload size={25} strokeWidth={1.5} aria-hidden="true" /><h3>{progress || "Drop your artwork here"}</h3><p>JPEG, PNG or WebP. Up to 10 MB per image.</p><button type="button" className="studio-button" disabled={images.length >= MAX_IMAGES} onClick={() => fileRef.current?.click()}>Choose images</button><input className="studio-sr-only" ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="Choose project images" onChange={(e) => void upload(Array.from(e.target.files || []))} />
                </div>
                <div role="status" className="studio-sr-only">{progress}</div>
              </>}
              <ol className="studio-image-list">
                {images.map((image, index) => <li className="studio-image-row" key={image.id}>
                  <div className="studio-image-preview"><img src={image.preview || `/api/admin/images/${image.id}?v=${encodeURIComponent(project?.updated_at || "")}`} alt={image.alt_text || `Uploaded artwork ${index + 1}`} /><span>{index === 0 ? "Cover" : `Image ${index + 1}`}</span></div>
                  <div className="studio-image-description"><label htmlFor={`alt-${image.id}`}>Image description <span>(required)</span></label><textarea id={`alt-${image.id}`} value={image.alt_text} maxLength={500} required rows={3} placeholder="Describe the visual for visitors using screen readers." onChange={(e) => { setImages((previous) => previous.map((item) => item.id === image.id ? { ...item, alt_text: e.target.value } : item)); setSuccess(""); }} /><small>{image.width} × {image.height} px</small></div>
                  <div className="studio-image-actions"><button type="button" className="studio-icon" aria-label={`Move image ${index + 1} earlier`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={17} aria-hidden="true" /></button><button type="button" className="studio-icon" aria-label={`Move image ${index + 1} later`} disabled={index === images.length - 1} onClick={() => move(index, 1)}><ArrowDown size={17} aria-hidden="true" /></button><button type="button" className="studio-icon studio-icon--danger" aria-label={`Remove image ${index + 1} from project`} onClick={() => { setImages((previous) => previous.filter((item) => item.id !== image.id).map((item, sort_order) => ({ ...item, sort_order }))); setSuccess(""); }}><Trash2 size={17} aria-hidden="true" /></button></div>
                </li>)}
              </ol>
              {images.length > 0 && <p className="studio-help">Use the arrows to change the order. Removing an image takes effect when you save; its original file is retained in Storage.</p>}
            </section>
            <aside className="studio-details" aria-labelledby="project-details-title">
              <h2 id="project-details-title">Project details</h2>
              <label htmlFor="project-title">Title <span>(optional)</span></label><input id="project-title" maxLength={160} value={fields.title} onChange={(e) => update("title", e.target.value)} placeholder="A name for this project" />
              <label htmlFor="project-type">Project type <span>(required)</span></label><input id="project-type" required maxLength={120} value={fields.project_type} onChange={(e) => update("project_type", e.target.value)} placeholder="e.g. Social Media Campaign" /><small>Shown as the artwork caption on your website.</small>
              <label htmlFor="project-slug">Slug <span>(required)</span></label><input id="project-slug" required maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={fields.slug} onChange={(e) => { setSlugEdited(true); update("slug", e.target.value); }} placeholder="social-media-campaign" /><small>A unique, URL-ready name for future project pages.</small>
              <fieldset className="studio-categories"><legend>Categories <span>(choose at least one)</span></legend>{Object.entries(categoryLabels).map(([value, label]) => <label key={value}><input type="checkbox" checked={fields.categories.includes(value as ProjectCategory)} onChange={(e) => update("categories", e.target.checked ? [...fields.categories, value as ProjectCategory] : fields.categories.filter((c) => c !== value))} />{label}</label>)}</fieldset>
              <label htmlFor="project-order">Display order</label><input id="project-order" required type="number" min={0} max={1000000} step={1} value={fields.sort_order} onChange={(e) => update("sort_order", e.target.value === "" ? 0 : Number(e.target.value))} /><small>Lower numbers appear first. Equal numbers use creation order.</small>
              <div className="studio-publishing-note"><strong>{project?.is_published ? "This project is published." : "Only you can see this draft."}</strong><p>{project?.is_published ? "Saving updates the live Supabase gallery. Unpublish to make it private." : "Publishing makes all saved images visible in the Supabase gallery."}</p></div>
            </aside>
          </div>
          <div className="studio-save-bar"><span role="status">{busy ? progress || "Saving changes..." : dirty ? "Unsaved changes" : project ? "All changes saved" : "Ready for a new project"}</span><div>{project?.is_published ? <><button className="studio-button" type="submit" value="draft">Unpublish</button><button className="studio-button studio-button--primary" type="submit" value="save">Save changes</button></> : <><button className="studio-button" type="submit" value="draft">{project ? "Save draft" : "Create draft"}</button>{project && <button className="studio-button studio-button--primary" type="submit" value="publish">Publish project</button>}</>}</div></div>
        </fieldset>
      </form>
      {project && <section className="studio-danger" aria-labelledby="delete-project-title"><div><h2 id="delete-project-title">Delete project</h2><p>Remove this project and its image records from the library. Uploaded files are retained in Storage, but project deletion cannot be undone here.</p></div>{!deleteOpen ? <button className="studio-button studio-button--danger" disabled={busy} onClick={() => setDeleteOpen(true)}>Delete project</button> : <div className="studio-delete-confirm"><label htmlFor="delete-confirm">Type DELETE to confirm</label><input id="delete-confirm" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} autoComplete="off" disabled={busy} /><div><button className="studio-button" disabled={busy} onClick={() => { setDeleteOpen(false); setDeleteConfirm(""); }}>Cancel</button><button className="studio-button studio-button--danger" disabled={deleteConfirm !== "DELETE" || busy} onClick={() => void deleteProject()}>Permanently delete project</button></div></div>}</section>}
    </>
  );
}
