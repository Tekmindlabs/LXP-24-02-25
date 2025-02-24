'use client';

import { useRouter } from "next/navigation";
import { StudentManagement } from "@/components/dashboard/roles/super-admin/student/StudentManagement";

interface PageProps {
	params: {
		role: string;
	};
}

export default function StudentPage({ params }: PageProps) {
	const { role } = params;
	const router = useRouter();

	return (
		<div className="container mx-auto py-6">
			<StudentManagement />
		</div>
	);
}
