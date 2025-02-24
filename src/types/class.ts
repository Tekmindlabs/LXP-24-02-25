import { Status } from "@prisma/client";

export interface Class {
    id: string;
    name: string;
    classGroupId: string;
    capacity: number;
    status: Status;
    termStructureId: string | null;
    classTutorId?: string;
    campusId: string;
    buildingId?: string;
    roomId?: string;
    classGroup: {
        id: string;
        name: string;
        program: {
            id: string;
            name: string;
            assessmentSystem?: {
                name: string;
            };
            termStructures?: {
                name: string;
            }[];
        };
    };
    students: {
        id: string;
        user: {
            name: string;
            email: string | null;
        };
    }[];
    teachers: {
        teacher: {
            id: string;
            user: {
                name: string;
                email: string | null;
            };
        };
        isClassTeacher: boolean;
        subjects: string[];
    }[];
    campus?: {
        id: string;
        name: string;
    };
    building?: {
        id: string;
        name: string;
    };
    room?: {
        id: string;
        number: string;
        capacity: number;
    };
    gradeBook?: {
        id: string;
        assessmentSystem?: {
            name: string;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

