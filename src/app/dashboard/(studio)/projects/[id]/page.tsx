import { notFound } from "next/navigation";
import ProjectEditor from "../../../../../components/dashboard/ProjectEditor";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  return <ProjectEditor projectId={id} key={id} />;
}
