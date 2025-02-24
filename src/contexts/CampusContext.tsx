import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/utils/api';
import type { CampusContextType } from '@/types/campus';
import type { Campus, Program, ClassGroup, Status } from '@prisma/client';
import { type RouterOutputs } from '@/utils/api';

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: React.ReactNode }) {
	const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
	const [programs, setPrograms] = useState<RouterOutputs["program"]["getAll"]["programs"]>([]);
	const [classGroups, setClassGroups] = useState<RouterOutputs["classGroup"]["getAllClassGroups"]>([]);

	const utils = api.useContext();
	const { data: campusData } = api.campus.getAll.useQuery();
	const { data: programsData } = api.program.getAll.useQuery({
		page: 1,
		pageSize: 100,
		status: "ACTIVE" as Status
	});
	const { data: classGroupsData } = api.classGroup.getAllClassGroups.useQuery(undefined);

	const refreshData = () => {
		void utils.campus.getAll.invalidate();
		void utils.program.getAll.invalidate();
		void utils.classGroup.getAllClassGroups.invalidate();
	};

	useEffect(() => {
		if (campusData?.length) setCurrentCampus(campusData[0]);
		if (programsData?.programs) {
			setPrograms(programsData.programs);
		}
		if (classGroupsData) setClassGroups(classGroupsData);
	}, [campusData, programsData, classGroupsData]);

	return (
		<CampusContext.Provider 
			value={{ 
				currentCampus, 
				setCurrentCampus, 
				programs, 
				classGroups, 
				refreshData 
			}}
		>
			{children}
		</CampusContext.Provider>
	);
}

export const useCampusContext = () => {
	const context = useContext(CampusContext);
	if (context === undefined) {
		throw new Error('useCampusContext must be used within a CampusProvider');
	}
	return context;
};
