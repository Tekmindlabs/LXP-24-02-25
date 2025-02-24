import { PrismaClient } from '@prisma/client';

export async function seedSystemSettings(prisma: PrismaClient) {
	console.log('Seeding system settings...');

	try {
		const systemSettings = await prisma.systemSettings.upsert({
			where: { id: 1 },
			update: {},
			create: {
				id: 1,
				mfaEnabled: false,
				emailNotifications: true,
				autoBackup: false,
				maintenanceMode: false
			}
		});

		console.log('System settings seeded successfully');
		return systemSettings;
	} catch (error) {
		console.error('Error seeding system settings:', error);
		// Continue with other seeds
		return null;
	}
}