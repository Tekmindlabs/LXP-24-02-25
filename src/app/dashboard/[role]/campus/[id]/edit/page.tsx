'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import CampusForm from "@/components/dashboard/roles/super-admin/campus/CampusForm";

export default function EditCampusPage() {
	const pathname = usePathname();
	const campusId = pathname?.split('/').pop() || '';
	const [isFormOpen, setIsFormOpen] = useState(true);

	return (
		<div className="container mx-auto py-6">
			<CampusForm 
				isOpen={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				campusId={campusId}
			/>
		</div>
	);
}