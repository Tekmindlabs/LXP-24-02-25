import { CampusProvider } from '@/contexts/CampusContext';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';

const sidebarNavItems = [
	{
		title: "Overview",
		href: "/dashboard/campus-admin",
	},
	{
		title: "Programs",
		href: "/dashboard/campus-admin/programs",
	},
	{
		title: "Class Groups",
		href: "/dashboard/campus-admin/class-groups",
	},
	{
		title: "Teachers",
		href: "/dashboard/campus-admin/teachers",
	},
	{
		title: "Students",
		href: "/dashboard/campus-admin/students",
	},
	{
		title: "Settings",
		href: "/dashboard/campus-admin/settings",
	},
];

export default function CampusAdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<CampusProvider>
			<div className="flex min-h-screen flex-col space-y-6">
				<div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
					<aside className="hidden w-[200px] flex-col md:flex">
						<SidebarNav items={sidebarNavItems} />
					</aside>
					<main className="flex w-full flex-1 flex-col overflow-hidden">
						{children}
					</main>
				</div>
			</div>
		</CampusProvider>
	);
}