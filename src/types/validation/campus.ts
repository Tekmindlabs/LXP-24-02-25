import { z } from "zod";
import { CampusType, RoomType, RoomStatus, Status } from "../campus";

export const campusSchema = z.object({
	name: z.string().min(1, "Name is required"),
	code: z.string().min(1, "Code is required"),
	establishmentDate: z.date(),
	type: z.nativeEnum(CampusType),
	status: z.nativeEnum(Status),
	streetAddress: z.string().min(1, "Street address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	country: z.string().min(1, "Country is required"),
	postalCode: z.string().min(1, "Postal code is required"),
	gpsCoordinates: z.string().optional(),
	primaryPhone: z.string().min(1, "Primary phone is required"),
	secondaryPhone: z.string().optional(),
	email: z.string().email("Invalid email address"),
	emergencyContact: z.string().min(1, "Emergency contact is required")
});

export const buildingSchema = z.object({
	name: z.string().min(1, "Name is required"),
	code: z.string().min(1, "Code is required"),
	campusId: z.string().min(1, "Campus ID is required")
});

export const floorSchema = z.object({
	number: z.number().min(0, "Floor number must be non-negative"),
	buildingId: z.string().min(1, "Building ID is required")
});

export const wingSchema = z.object({
	name: z.string().min(1, "Name is required"),
	floorId: z.string().min(1, "Floor ID is required")
});

export const roomSchema = z.object({
	number: z.string().min(1, "Room number is required"),
	wingId: z.string().min(1, "Wing ID is required"),
	type: z.nativeEnum(RoomType),
	capacity: z.number().min(1, "Capacity must be at least 1"),
	status: z.nativeEnum(RoomStatus),
	resources: z.record(z.any()).optional()
});

export const campusAttendanceSchema = z.object({
	studentId: z.string().min(1, "Student ID is required"),
	classId: z.string().min(1, "Class ID is required"),
	date: z.date(),
	status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
	notes: z.string().optional(),
	markedById: z.string().min(1, "Marker ID is required"),
	roomId: z.string().min(1, "Room ID is required"),
	buildingId: z.string().min(1, "Building ID is required")
});

export type CreateCampusInput = z.infer<typeof campusSchema>;
export type CreateBuildingInput = z.infer<typeof buildingSchema>;
export type CreateFloorInput = z.infer<typeof floorSchema>;
export type CreateWingInput = z.infer<typeof wingSchema>;
export type CreateRoomInput = z.infer<typeof roomSchema>;
export type CreateCampusAttendanceInput = z.infer<typeof campusAttendanceSchema>;