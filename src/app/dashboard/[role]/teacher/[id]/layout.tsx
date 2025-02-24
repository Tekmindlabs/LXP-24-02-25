import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

interface PageProps {
	params: {
		role: string;
		id: string;
	};
	children: React.ReactNode;
}

export default async function TeacherProfileLayout({ params, children }: PageProps) {
	const role = params.role;

	return (
		<div className="space-y-6">
			<Breadcrumb>
				<BreadcrumbItem>
					<BreadcrumbLink href={`/dashboard/${role}`}>Dashboard</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbItem>
					<ChevronRight className="h-4 w-4" />
					<BreadcrumbLink href={`/dashboard/${role}/teachers`}>Teachers</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbItem>
					<ChevronRight className="h-4 w-4" />
					<span>Profile</span>
				</BreadcrumbItem>
			</Breadcrumb>
			{children}
		</div>
	);
}