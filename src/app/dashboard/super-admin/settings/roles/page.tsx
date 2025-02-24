import UnifiedRoleManagement from "@/components/dashboard/UnifiedRoleManagement";
import { Card } from "@/components/ui/card";

export default function RolesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage system and campus roles and their permissions
        </p>
      </div>
      <Card className="p-6">
        <UnifiedRoleManagement />
      </Card>
    </div>
  );
}
