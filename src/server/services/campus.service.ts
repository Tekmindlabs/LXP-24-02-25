import { 
  PrismaClient, 
  Campus as PrismaCampus, 
  Building as PrismaBuilding, 
  Floor as PrismaFloor, 
  Wing as PrismaWing, 
  Room as PrismaRoom 
} from "@prisma/client";
import { 
  CreateCampusInput, 
  CreateBuildingInput, 
  CreateFloorInput, 
  CreateWingInput, 
  CreateRoomInput 
} from "../../types/validation/campus";

export class CampusService {
  constructor(private readonly db: PrismaClient) {}

  async createCampus(data: CreateCampusInput): Promise<PrismaCampus> {
    return this.db.campus.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        buildings: true
      }
    });
  }

  async updateCampus(id: string, data: Partial<CreateCampusInput>): Promise<PrismaCampus> {
    return this.db.campus.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        buildings: true
      }
    });
  }

  async deleteCampus(id: string): Promise<void> {
    await this.db.campus.delete({
      where: { id }
    });
  }

  async getCampus(id: string): Promise<PrismaCampus | null> {
	return this.db.campus.findUnique({
	  where: { id },
	  include: {
		buildings: {
		  include: {
			floors: {
			  include: {
				wings: {
				  include: {
					rooms: true
				  }
				}
			  }
			}
		  }
		}
	  }
	});
  }

  async listCampuses(): Promise<PrismaCampus[]> {
    return this.db.campus.findMany({
      include: {
        buildings: true
      }
    });
  }

  // Building management
  async createBuilding(data: CreateBuildingInput): Promise<PrismaBuilding> {
    return this.db.building.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        floors: true
      }
    });
  }

  async createFloor(data: CreateFloorInput): Promise<PrismaFloor> {
    return this.db.floor.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        wings: true
      }
    });
  }

  async createWing(data: CreateWingInput): Promise<PrismaWing> {
    return this.db.wing.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        rooms: true
      }
    });
  }

  async createRoom(data: CreateRoomInput): Promise<PrismaRoom> {
    return this.db.room.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
}
