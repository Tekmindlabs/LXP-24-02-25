'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Status } from "@prisma/client";

interface Coordinator {
	id: string;
	name: string;
	email: string;
	status: Status;
	type: 'PROGRAM_COORDINATOR' | 'CAMPUS_PROGRAM_COORDINATOR';
	coordinatorProfile: {
		programs: {
			id: string;
			name: string;
		}[];
		campus?: {
			id: string;
			name: string;
		};
		responsibilities: string[];
		inheritedPrograms?: {
			id: string;
			name: string;
		}[];
	};
}


interface CoordinatorListProps {
	coordinators: Coordinator[];
	onSelect: (id: string) => void;
  onEdit: (id: string) => void;  // Add this prop
}

export const CoordinatorList = ({ coordinators, onSelect, onEdit }: CoordinatorListProps) => {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Campus</TableHead>
						<TableHead>Programs</TableHead>
						<TableHead>Inherited Programs</TableHead>
						<TableHead>Responsibilities</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{coordinators.map((coordinator) => (
						<TableRow key={coordinator.id}>
							<TableCell>{coordinator.name}</TableCell>
							<TableCell>{coordinator.email}</TableCell>
							<TableCell>{coordinator.type}</TableCell>
							<TableCell>
								{coordinator.coordinatorProfile.campus?.name || '-'}
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-2">
									{coordinator.coordinatorProfile?.programs.map((program) => (
										<Badge key={program.id} variant="secondary">
											{program.name}
										</Badge>
									))}
								</div>
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-2">
									{coordinator.coordinatorProfile.inheritedPrograms?.map((program) => (
										<Badge key={program.id} variant="outline">
											{program.name}
										</Badge>
									))}
								</div>
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-2">
									{coordinator.coordinatorProfile.responsibilities?.map((responsibility) => (
										<Badge key={responsibility} variant="outline">
											{responsibility}
										</Badge>
									))}
								</div>
							</TableCell>
							<TableCell>
								<Badge variant={coordinator.status === "ACTIVE" ? "success" : "secondary"}>
									{coordinator.status}
								</Badge>
							</TableCell>
							<TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(coordinator.id)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(coordinator.id)}
                  >
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

