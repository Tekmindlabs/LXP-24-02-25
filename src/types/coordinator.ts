import { UserType, Status } from "@prisma/client";

export interface Coordinator {
    id: string;
    name: string;
    email: string;
    userType: UserType;
    status: Status;
    coordinatorProfile?: {
        id: string;
        type: 'PROGRAM_COORDINATOR' | 'CAMPUS_PROGRAM_COORDINATOR';
        campus?: {
            id: string;
            name: string;
        };
        programs: {
            id: string;
            name: string;
            department?: {
                id: string;
                name: string;
            };
        }[];
        inheritedPrograms?: {
            id: string;
            name: string;
        }[];
    };
}