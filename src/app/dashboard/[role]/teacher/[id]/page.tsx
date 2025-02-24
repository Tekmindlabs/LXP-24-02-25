'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherView } from "@/components/dashboard/roles/super-admin/teacher/TeacherView";
import { Button } from "@/components/ui/button";

interface PageProps {
	params: {
		id: string;
		role: string;
	};
}

export default function ViewTeacherPage({ params }: PageProps) {
	const router = useRouter();
	const { id: teacherId } = params;



	return (
		<div className="container mx-auto py-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Teacher Details</CardTitle>
					<Button onClick={() => router.push(`/dashboard/super-admin/teacher/${teacherId}/edit`)}>
						Edit Teacher
					</Button>
				</CardHeader>
				<CardContent>
					<TeacherView
						teacherId={teacherId}
						isPage={true}
						onClose={() => router.back()}
						onEdit={() => router.push(`/dashboard/super-admin/teacher/${teacherId}/edit`)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}