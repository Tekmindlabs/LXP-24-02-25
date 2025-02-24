"use client";

import { type FC, useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import CampusForm from "./CampusForm";
import { type RouterOutputs } from "@/utils/api";

type Campus = RouterOutputs["campus"]["getAll"][number];

interface CampusManagementProps {}

export const CampusManagement: FC<CampusManagementProps> = () => {
	const router = useRouter();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null);
	const trpc = api.useUtils();

	const { data: campuses, isLoading, refetch } = api.campus.getAll.useQuery(undefined, {
		refetchOnWindowFocus: true,
		refetchOnMount: true,
	});

	useEffect(() => {
		if (campuses) {
			console.log("Campuses fetched successfully:", campuses);
		}
	}, [campuses]);


	useEffect(() => {
		console.log("CampusManagement component rendered");
	}, []);

	const handleEdit = (id: string) => {
		setSelectedCampusId(id);
		setIsFormOpen(true);
	};

	const handleCreate = () => {
		setSelectedCampusId(null);
		setIsFormOpen(true);
	};

	const handleCloseForm = async () => {
		setIsFormOpen(false);
		setSelectedCampusId(null);
		console.log('Invalidating queries...');
		await trpc.campus.getAll.invalidate();
		console.log('Refetching data...');
		await refetch();
	};

	const handleViewCampus = (id: string) => {
		router.push(`/dashboard/super-admin/campus/${id}`);
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Campus Management ({campuses?.length ?? 0} campuses)</CardTitle>
						<Button onClick={handleCreate}>
							Create New Campus
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{campuses && campuses.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{campuses.map((campus: Campus) => (
							<Card 
								key={campus.id} 
								className="cursor-pointer hover:bg-accent"
								onClick={() => handleViewCampus(campus.id)}
							>
								<CardContent className="p-4">
									<div className="flex justify-between items-start">
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<h3 className="font-semibold">{campus.name}</h3>
												<Badge variant={campus.status === 'ACTIVE' ? 'default' : 'secondary'}>
													{campus.status}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												Code: {campus.code}
											</p>
											<p className="text-sm text-muted-foreground">
												Type: {campus.type}
											</p>
											<p className="text-sm text-muted-foreground">
												Location: {campus.city}, {campus.state}
											</p>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												handleEdit(campus.id);
											}}
										>
											Edit
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						No campuses found. Click "Create New Campus" to add one.
					</div>
				)}
			</CardContent>
		</Card>

		<CampusForm 
			isOpen={isFormOpen}
			onClose={handleCloseForm}
			campusId={selectedCampusId}
		/>
	</div>
  );
};

export default CampusManagement;

