'use client'

import { api } from "@/utils/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { RouterOutputs } from "@/utils/api";

interface SubjectDistributionChartProps {
	teacherId: string;
}

interface ChartDataItem {
	name: string;
	value: number;
}

type TeacherAnalytics = RouterOutputs["teacher"]["getTeacherAnalytics"];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function SubjectDistributionChart({ teacherId }: SubjectDistributionChartProps) {
	const { data: analytics, isLoading } = api.teacher.getTeacherAnalytics.useQuery({ 
		teacherId 
	}, {
		// Disable automatic refetching
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});

	if (isLoading) {
		return <div className="w-full h-[300px] flex items-center justify-center">Loading...</div>;
	}

	if (!analytics || analytics.subjects.length === 0) {
		return (
			<div className="w-full h-[300px] flex items-center justify-center text-gray-500">
				No subject data available
			</div>
		);
	}

	const chartData: ChartDataItem[] = analytics.subjects.map(subject => ({
		name: subject.name,
		value: subject.hoursPerWeek
	}));

	return (
		<div className="w-full h-[300px]">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={chartData}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						outerRadius={80}
						label
					>
						{chartData.map((_entry: ChartDataItem, index: number) => (
							<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
						))}
					</Pie>
					<Tooltip />
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}
