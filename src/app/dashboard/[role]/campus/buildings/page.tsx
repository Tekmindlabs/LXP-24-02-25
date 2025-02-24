import { BuildingManagement } from "@/components/dashboard/campus/BuildingManagement";
import { CampusTabs } from "@/components/dashboard/campus/CampusTabs";

export default function BuildingsPage() {
	return (
		<div className="space-y-6">
			<CampusTabs />
			<BuildingManagement />
		</div>
	);
}