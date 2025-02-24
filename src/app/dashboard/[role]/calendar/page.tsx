'use client';

import { CalendarView } from '@/components/dashboard/calendar/CalendarView';
import { api } from '@/trpc/react';
import { ViewEvent } from '@/types/calendar';

interface PageProps {
	params: {
		role: string;
	};
}

export default function CalendarPage({ params }: PageProps) {
	const { role } = params;
	
	const { data: calendarEvents = [] } = api.calendar.getEvents.useQuery({
		entityType: 'class',
		entityId: role
	});

	const events: ViewEvent[] = calendarEvents.map(event => ({
		id: event.id,
		title: event.title,
		start: event.startDate,
		end: event.endDate,
		type: event.status,
		entityId: event.classId || event.classGroupId || '',
	}));

	return (
		<div className="container mx-auto py-8">
			<CalendarView events={events} />
		</div>
	);
}
