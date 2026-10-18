import type { AdminProject } from "../../types/artwork";

export class RequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function dashboardRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options, cache: "no-store", credentials: "same-origin",
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new RequestError(data.error || "The request failed. Please retry.", response.status);
  return data as T;
}

export function errorMessage(error: unknown) {
  if (error instanceof TypeError) return "The connection was interrupted. Check your network and try again. Your unsaved changes are still in the editor.";
  if (error instanceof RequestError && error.status === 401) return "Your session expired. Sign in again in another tab, then retry without closing this editor.";
  return error instanceof Error ? error.message : "Something went wrong. Please retry.";
}

export function orderedProject(project: AdminProject): AdminProject {
  return { ...project, project_images: [...project.project_images].sort((a, b) => a.sort_order - b.sort_order) };
}
