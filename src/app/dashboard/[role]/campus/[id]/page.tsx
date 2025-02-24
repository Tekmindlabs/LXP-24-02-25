'use client';

import { usePathname } from "next/navigation";
import CampusView from "@/components/dashboard/roles/super-admin/campus/CampusView";

export default function CampusPage() {
	const pathname = usePathname();
	const campusId = pathname.split('/').pop() as string;

	return (
		<div className="container mx-auto py-6">
			<CampusView campusId={campusId} />
		</div>
	);
}