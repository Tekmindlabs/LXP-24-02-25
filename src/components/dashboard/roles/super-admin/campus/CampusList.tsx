"use client";

import { type FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type RouterOutputs } from "@/utils/api";

type Campus = RouterOutputs["campus"]["getAll"][number];

interface CampusListProps {
	campuses: Campus[];
	onEdit: (id: string) => void;
	onView: (id: string) => void;
}

const CampusList: FC<CampusListProps> = ({ campuses, onEdit, onView }) => {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{campuses?.map((campus) => (
				<Card 
					key={campus.id} 
					className="cursor-pointer hover:bg-accent"
					onClick={() => onView(campus.id)}
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
									onEdit(campus.id);
								}}
							>
								Edit
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};

export default CampusList;