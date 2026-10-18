import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database";
import {
  categoryLabels,
  type Project,
  type ProjectCategory,
} from "../../types/artwork";
import { getSupabaseConfig, hasSupabaseConfig } from "../supabase/config";

export function publicClient() {
  const { url, key } = getSupabaseConfig();
  // Never attach an administrator's cookies to public artwork queries.
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export async function publishedProjects(): Promise<Project[]> {
  if (!hasSupabaseConfig()) return [];
  const { data, error } = await publicClient()
    .from("projects")
    .select(
      "id,slug,title,project_type,categories,updated_at,project_images(id,alt_text,width,height,sort_order)",
    )
    .eq("is_published", true)
    .order("sort_order")
    .order("created_at")
    .limit(1000);
  if (error) throw new Error("Published artwork could not be loaded.");
  return (data || [])
    .filter((project) => project.project_images.length > 0)
    .map((project) => {
      const images = project.project_images
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => ({
          src: `/api/artworks/images/${image.id}?v=${encodeURIComponent(project.updated_at)}`,
          alt: image.alt_text,
          width: image.width,
          height: image.height,
          aspectRatio:
            image.width === image.height
              ? ("square" as const)
              : image.width > image.height
                ? ("landscape" as const)
                : ("portrait" as const),
        }));
      return {
        id: project.id,
        slug: project.slug,
        title: project.title,
        projectType: project.project_type,
        categories: project.categories.filter((c): c is ProjectCategory =>
          Object.hasOwn(categoryLabels, c),
        ),
        images,
        layout: images[0].aspectRatio,
        featured: true,
      };
    });
}
