import { redirect } from 'next/navigation';

export default async function LegacyReviewerWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/reviewer/audit/${id}`);
}
