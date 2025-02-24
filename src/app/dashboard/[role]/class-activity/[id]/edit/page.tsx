'use client';

import ClassActivityForm from "@/components/dashboard/roles/super-admin/class-activity/ClassActivityForm";
import { useRouter } from "next/navigation";

interface Props {
	params: {
		role: string;
		id: string;
	};
}

export default function EditClassActivityPage({ params }: Props) {
	const router = useRouter();
	const { role, id } = params;

	return (
		<div>
			<ClassActivityForm 
				activityId={id}
				onClose={() => router.push(`/dashboard/${role}/class-activity`)} 
			/>
		</div>
	);
}
