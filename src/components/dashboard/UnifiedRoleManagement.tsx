"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/api";
import { TRPCClientErrorLike } from '@trpc/client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RoleForm } from "./RoleForm";

interface Role {
	id: string;
	name: string;
	description: string | null;
	type: 'CORE' | 'CAMPUS';
	permissions: Array<{
		permission: {
			id: string;
			name: string;
			description: string | null;
			createdAt: Date;
			updatedAt: Date;
			campusId: string | null;
		}
	}>;
	parentId: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export default function UnifiedRoleManagement() {
	const { data: roles = [], isLoading } = api.role.getAll.useQuery();
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [contextFilter, setContextFilter] = useState<"all" | "core" | "campus">("all");

	const typeToContext = (type: 'CORE' | 'CAMPUS'): 'core' | 'campus' => {
		return type === 'CORE' ? 'core' : 'campus';
	};

	const contextToType = (context: 'core' | 'campus'): 'CORE' | 'CAMPUS' => {
		return context === 'core' ? 'CORE' : 'CAMPUS';
	};
	const { toast } = useToast();

	const utils = api.useContext();

	const createRoleMutation = api.role.create.useMutation({
		onSuccess: () => {
			utils.role.getAll.invalidate();
			toast({
				title: "Success",
				description: "Role created successfully",
			});
		},
		onError: (error: TRPCClientErrorLike<any>) => {
			toast({
				variant: "destructive",
				title: "Error",
				description: error.message,
			});
		},
	});

	const updateRoleMutation = api.role.update.useMutation({
		onSuccess: () => {
			utils.role.getAll.invalidate();
			toast({
				title: "Success",
				description: "Role updated successfully",
			});
		},
		onError: (error: TRPCClientErrorLike<any>) => {
			toast({
				variant: "destructive",
				title: "Error",
				description: error.message,
			});
		},
	});

	const deleteRoleMutation = api.role.delete.useMutation({
		onSuccess: () => {
			utils.role.getAll.invalidate();
			toast({
				title: "Success",
				description: "Role deleted successfully",
			});
		},
		onError: (error: TRPCClientErrorLike<any>) => {
			toast({
				variant: "destructive",
				title: "Error",
				description: error.message,
			});
		},
	});

	// Create new role
	const handleCreateRole = (roleData: Omit<Role, "id">) => {
		createRoleMutation.mutate({
			name: roleData.name,
			description: roleData.description ?? "",
			context: roleData.type === 'CORE' ? 'core' : 'campus',
			permissions: roleData.permissions.map((p) => p.permission.id),
		});
	};

	// Update existing role
	const handleUpdateRole = (roleId: string, roleData: Partial<Role>) => {
		updateRoleMutation.mutate({
			id: roleId,
			data: {
				name: roleData.name,
				description: roleData.description ?? "",
				permissionIds: roleData.permissions?.map((p) => p.permission.id),
			},
		});
	};

	// Delete role
	const handleDeleteRole = (roleId: string) => {
		deleteRoleMutation.mutate(roleId);
	};

	const filteredRoles = roles.filter((role) =>
		contextFilter === "all" ? true : typeToContext(role.type) === contextFilter
	);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Role Management</CardTitle>
				<CardDescription>
					Manage roles and permissions for core and campus contexts
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex justify-between items-center mb-6">
					<Select
						value={contextFilter}
						onValueChange={(value) => setContextFilter(value as typeof contextFilter)}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by context" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Roles</SelectItem>
							<SelectItem value="core">Core Roles</SelectItem>
							<SelectItem value="campus">Campus Roles</SelectItem>
						</SelectContent>
					</Select>
					<Button
						variant="default"
						className="ml-4"
						onClick={() => setSelectedRole({} as Role)}
					>
						<Plus className="w-4 h-4 mr-2" />
						Create New Role
					</Button>
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Context</TableHead>
								<TableHead>Description</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center">
										<div className="flex items-center justify-center py-4">
											<Loader2 className="w-6 h-6 animate-spin" />
										</div>
									</TableCell>
								</TableRow>
							) : filteredRoles.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center py-6">
										No roles found
									</TableCell>
								</TableRow>
							) : (
								filteredRoles.map((role) => (
									<TableRow key={role.id}>
										<TableCell className="font-medium">{role.name}</TableCell>
										<TableCell>
											<Badge variant={typeToContext(role.type) === "core" ? "default" : "secondary"}>
												{typeToContext(role.type)}
											</Badge>
										</TableCell>
										<TableCell>{role.description}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => setSelectedRole(role)}
												>
													<Pencil className="w-4 h-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="text-destructive"
													onClick={() => handleDeleteRole(role.id)}
												>
													<Trash className="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}