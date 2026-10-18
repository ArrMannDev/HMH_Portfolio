"use client";

import Link from "next/link";
import { ArrowRight, ImagePlus, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categoryLabels, type AdminProject } from "../../types/artwork";
import { dashboardRequest, errorMessage, orderedProject } from "./api";

const PAGE_SIZE = 12;

export default function ProjectLibrary() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    dashboardRequest<{ projects: AdminProject[] }>("/api/admin/projects", { signal: controller.signal })
      .then((data) => setProjects(data.projects.map(orderedProject)))
      .catch((err) => { if (!controller.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry]);

  const visible = useMemo(() => projects.filter((p) => {
    const matchesSearch = `${p.title || ""} ${p.project_type} ${p.slug}`.toLowerCase().includes(query.toLowerCase().trim());
    return matchesSearch && (category === "all" || p.categories.some((c) => c === category)) &&
      (status === "all" || p.is_published === (status === "published"));
  }), [projects, query, category, status]);
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const publishedCount = projects.filter((p) => p.is_published).length;

  return (
    <>
      <div className="studio-page-heading">
        <div><h1>Artwork library<span>.</span></h1><p>Curate your work. Keep every campaign together.</p></div>
        <Link className="studio-button studio-button--primary" href="/dashboard/projects/new"><Plus size={18} aria-hidden="true" /> New project</Link>
      </div>
      <div className="studio-library-heading"><h2>Projects</h2>{!loading && !error && <span>{projects.length} total <span aria-hidden="true">/</span> {publishedCount} published</span>}</div>
      <div className="studio-toolbar">
        <label className="studio-search"><Search size={18} aria-hidden="true" /><span className="studio-sr-only">Search projects</span><input type="search" placeholder="Search by name or project type" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} /></label>
        <label><span className="studio-sr-only">Filter by category</span><select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option value="all">All categories</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span className="studio-sr-only">Filter by visibility</span><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="all">All visibility</option><option value="draft">Drafts</option><option value="published">Published</option></select></label>
      </div>
      {error ? <div className="studio-message studio-message--error" role="alert"><p>{error}</p><button className="studio-button" onClick={() => setRetry((r) => r + 1)}>Retry loading</button></div> : loading ? (
        <div className="studio-project-grid" aria-busy="true" aria-label="Loading projects">{[0, 1, 2].map((i) => <div key={i} className="studio-skeleton"><div /><p>Loading artwork...</p></div>)}</div>
      ) : projects.length === 0 ? (
        <div className="studio-empty"><ImagePlus size={36} strokeWidth={1.3} aria-hidden="true" /><h2>Make room for your next project.</h2><p>Create a draft, add related images, then publish when it is ready. Only published projects appear in your public gallery.</p><Link className="studio-button studio-button--primary" href="/dashboard/projects/new">Create your first project <ArrowRight size={17} aria-hidden="true" /></Link><p className="studio-help">Original project data and images remain preserved in the repository.</p></div>
      ) : visible.length === 0 ? (
        <div className="studio-empty"><h2>No matching projects</h2><p>Try another search or clear the filters.</p><button className="studio-button" onClick={() => { setQuery(""); setCategory("all"); setStatus("all"); }}>Clear filters</button></div>
      ) : (
        <>
          <div className="studio-project-grid" aria-live="polite">
            {visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE).map((project) => (
              <Link className="studio-project" href={`/dashboard/projects/${project.id}`} key={project.id}>
                <div className="studio-project-cover">{project.project_images[0] ? <img src={`/api/admin/images/${project.project_images[0].id}?v=${encodeURIComponent(project.updated_at)}`} alt={project.project_images[0].alt_text} loading="lazy" /> : <div className="studio-no-cover"><ImagePlus size={26} strokeWidth={1.3} aria-hidden="true" /><span>Add your first image</span></div>}<span className={`studio-status${project.is_published ? " studio-status--published" : ""}`}>{project.is_published ? "Published" : "Draft"}</span></div>
                <div className="studio-project-info"><div><h3>{project.title || project.project_type}</h3><p>{project.categories.map((c) => categoryLabels[c]).join(" / ")}</p></div><ArrowRight size={18} aria-hidden="true" /></div>
                <div className="studio-project-meta"><span>{project.project_images.length} {project.project_images.length === 1 ? "image" : "images"}</span><span>Order {project.sort_order}</span></div>
              </Link>
            ))}
          </div>
          {pages > 1 && <nav className="studio-pagination" aria-label="Project pages"><button className="studio-button" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Previous</button><span>Page {safePage} of {pages}</span><button className="studio-button" disabled={safePage === pages} onClick={() => setPage(safePage + 1)}>Next</button></nav>}
        </>
      )}
      <aside className="studio-note"><strong>Publishing and your website</strong><p>Your public gallery uses published Supabase projects by default. Drafts stay private. The original static collection is preserved; set <code>ARTWORK_SOURCE=local</code> only if you need to restore it temporarily, then restart or redeploy.</p></aside>
    </>
  );
}
