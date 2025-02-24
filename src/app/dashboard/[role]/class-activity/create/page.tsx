'use client';

import ClassActivityForm from "@/components/dashboard/roles/super-admin/class-activity/ClassActivityForm";
import { useRouter } from "next/navigation";

interface Props {
	params: {
		role: string;
	};
}

export default function CreateClassActivityPage({ params }: Props) {
	const router = useRouter();
	const { role } = params;

	return (
		<div>
			<ClassActivityForm 
				onClose={() => router.push(`/dashboard/${role}/class-activity`)} 
			/>
		</div>
	);
}
