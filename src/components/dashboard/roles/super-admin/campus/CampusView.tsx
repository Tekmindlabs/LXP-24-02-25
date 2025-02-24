"use client";

import { type FC, useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { LuMapPin, LuPhone, LuMail, LuCalendar, LuBuilding } from "react-icons/lu";
import CampusForm from "./CampusForm";

interface CampusViewProps {
	campusId: string;
}

const CampusView: FC<CampusViewProps> = ({ campusId }) => {
	const [isEditFormOpen, setIsEditFormOpen] = useState(false);
	const { data: campus, isLoading } = api.campus.getById.useQuery(campusId);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!campus) {
		return <div>Campus not found</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">{campus.name}</h2>
					<div className="flex items-center gap-2 mt-2">
						<Badge variant={campus.status === 'ACTIVE' ? 'default' : 'secondary'}>
							{campus.status}
						</Badge>
						<span className="text-sm text-muted-foreground">
							{campus.type} Campus
						</span>
					</div>
				</div>
				<Button variant="outline" onClick={() => setIsEditFormOpen(true)}>
					Edit Campus
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<LuBuilding className="h-5 w-5" />
							Basic Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<div>
							<p className="text-sm font-medium">Campus Code</p>
							<p className="text-sm text-muted-foreground">{campus.code}</p>
						</div>
						<div>
							<p className="text-sm font-medium">Establishment Date</p>
							<p className="text-sm text-muted-foreground">
								{new Date(campus.establishmentDate).toLocaleDateString()}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<LuMapPin className="h-5 w-5" />
							Location Details
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<div>
							<p className="text-sm font-medium">Address</p>
							<p className="text-sm text-muted-foreground">{campus.streetAddress}</p>
						</div>
						<div>
							<p className="text-sm font-medium">City, State</p>
							<p className="text-sm text-muted-foreground">
								{campus.city}, {campus.state}
							</p>
						</div>
						<div>
							<p className="text-sm font-medium">Country</p>
							<p className="text-sm text-muted-foreground">{campus.country}</p>
						</div>
						<div>
							<p className="text-sm font-medium">Postal Code</p>
							<p className="text-sm text-muted-foreground">{campus.postalCode}</p>
						</div>
						{campus.gpsCoordinates && (
							<div>
								<p className="text-sm font-medium">GPS Coordinates</p>
								<p className="text-sm text-muted-foreground">{campus.gpsCoordinates}</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<LuPhone className="h-5 w-5" />
							Contact Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<div>
							<p className="text-sm font-medium">Primary Phone</p>
							<p className="text-sm text-muted-foreground">{campus.primaryPhone}</p>
						</div>
						{campus.secondaryPhone && (
							<div>
								<p className="text-sm font-medium">Secondary Phone</p>
								<p className="text-sm text-muted-foreground">{campus.secondaryPhone}</p>
							</div>
						)}
						<div>
							<p className="text-sm font-medium">Email Address</p>
							<p className="text-sm text-muted-foreground">{campus.email}</p>
						</div>
						<div>
							<p className="text-sm font-medium">Emergency Contact</p>
							<p className="text-sm text-muted-foreground">{campus.emergencyContact}</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<CampusForm 
				isOpen={isEditFormOpen}
				onClose={() => setIsEditFormOpen(false)}
				campusId={campusId}
			/>
		</div>
	);
};

export default CampusView;