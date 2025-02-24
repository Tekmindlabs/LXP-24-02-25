'use client';

import { useState } from "react";
import CampusForm from "@/components/dashboard/roles/super-admin/campus/CampusForm";

export default function CreateCampusPage() {
	const [isFormOpen, setIsFormOpen] = useState(true);

	return (
		<div className="container mx-auto py-6">
			<CampusForm 
				isOpen={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				campusId={null}
			/>
		</div>
	);
}