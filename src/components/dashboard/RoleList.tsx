import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Role {
  id: string;
  name: string;
  description: string;
  context: "core" | "campus";
  permissions: string[];
}

interface RoleListProps {
  roles: Role[];
  contextFilter: "all" | "core" | "campus";
  onContextFilterChange: (value: "all" | "core" | "campus") => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (roleId: string) => void;
  isLoading?: boolean;
}

export function RoleList({
  roles,
  contextFilter,
  onContextFilterChange,
  onEditRole,
  onDeleteRole,
  isLoading = false,
}: RoleListProps) {
  const filteredRoles = roles.filter((role) =>
    contextFilter === "all" ? true : role.context === contextFilter
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          value={contextFilter}
          onValueChange={(value: "all" | "core" | "campus") =>
            onContextFilterChange(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="core">Core Roles</SelectItem>
            <SelectItem value="campus">Campus Roles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRoles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell className="capitalize">{role.context}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditRole(role)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteRole(role.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}