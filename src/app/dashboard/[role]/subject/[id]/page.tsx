'use client';

import { SubjectView } from "@/components/dashboard/roles/super-admin/subject/SubjectView";

export default function SubjectViewPage({ params }: { params: { id: string; role: string } }) {
	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<SubjectView subjectId={params.id} />
		</div>
	);
}