import { useState } from 'react';
import { api } from '@/utils/api';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { startOfMonth, endOfMonth, subMonths, addMonths, format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';

interface CalendarGridProps {
	level: string;
	entityId: string | null;
}

export const CalendarGrid = ({ level, entityId }: CalendarGridProps) => {
	const [currentDate, setCurrentDate] = useState(new Date());

	const { data: events } = api.calendar.getEventsByDateRange.useQuery({
		startDate: startOfMonth(currentDate),
		endDate: endOfMonth(currentDate),
		level,
		entityId,
	}, {
		enabled: !!entityId,
	});

	const monthStart = startOfMonth(currentDate);
	const monthEnd = endOfMonth(currentDate);
	const calendarStart = startOfWeek(monthStart);
	const calendarEnd = endOfWeek(monthEnd);

	const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
					<div className="flex space-x-2">
						<Button variant="outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
							Previous
						</Button>
						<Button variant="outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
							Next
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-7 gap-1">
					{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
						<div key={day} className="p-2 text-center font-semibold">
							{day}
						</div>
					))}
					{days.map((day) => (
						<div key={day.toISOString()} className="p-2 text-center border">
							{format(day, 'd')}
							{events?.map((event) => (
								event.startDate.toDateString() === day.toDateString() && (
									<div key={event.id} className="text-xs mt-1 bg-blue-100 p-1 rounded">
										{event.title}
									</div>
								)
							))}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};