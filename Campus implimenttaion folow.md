Based on the provided codebase, I'll outline a more specific implementation plan that aligns with the existing code structure:

1. First, update the CampusClassService.ts:

```typescript
// src/server/services/CampusClassService.ts

export class CampusClassService {
  constructor(
    private readonly db: PrismaClient,
    private readonly userService: CampusUserService
  ) {}

  // Add new method for inheritance
  async inheritClassGroupsFromPrograms(campusId: string): Promise<void> {
    try {
      // Get campus with programs and their class groups
      const campus = await this.db.campus.findUnique({
        where: { id: campusId },
        include: {
          programs: {
            include: {
              classGroups: true
            }
          }
        }
      });

      if (!campus) {
        throw new Error("Campus not found");
      }

      // Get all unique class group IDs
      const classGroupIds = new Set<string>();
      campus.programs?.forEach(program => {
        program.classGroups?.forEach(group => {
          classGroupIds.add(group.id);
        });
      });

      // Update campus with class groups
      await this.db.campus.update({
        where: { id: campusId },
        data: {
          classGroups: {
            connect: Array.from(classGroupIds).map(id => ({ id }))
          }
        }
      });
    } catch (error) {
      console.error("Error inheriting class groups:", error);
      throw error;
    }
  }
}
```

2. Update the program router to handle inheritance:

```typescript
// src/server/api/routers/program.ts

export const programRouter = createTRPCRouter({
  // Add to existing create mutation
  create: protectedProcedure
    .input(campusCreateInput)
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.prisma.$transaction(async (tx) => {
        // Existing program creation code...
        
        // After program is created, inherit class groups for each campus
        if (input.campusIds?.length) {
          const campusClassService = new CampusClassService(tx, ctx.userService);
          await Promise.all(
            input.campusIds.map(campusId => 
              campusClassService.inheritClassGroupsFromPrograms(campusId)
            )
          );
        }

        return program;
      });

      return program;
    }),

  // Add to existing update mutation
  update: protectedProcedure
    .input(campusUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.prisma.$transaction(async (tx) => {
        // Existing update code...

        // After update, trigger inheritance for affected campuses
        const campusClassService = new CampusClassService(tx, ctx.userService);
        await campusClassService.inheritClassGroupsFromPrograms(input.id);

        return program;
      });

      return program;
    })
});
```

3. Add a new endpoint in the campus router:

```typescript
// src/server/api/routers/campus.ts

export const campusRouter = createTRPCRouter({
  // Add new procedure
  refreshClassGroups: protectedProcedure
    .input(z.object({
      campusId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const campusClassService = new CampusClassService(ctx.prisma, ctx.userService);
      await campusClassService.inheritClassGroupsFromPrograms(input.campusId);
      return { success: true };
    })
});
```

4. Update the CampusContext to handle refreshes:

```typescript
// src/contexts/CampusContext.tsx

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [currentCampus, setCurrentCampus] = useState<Campus | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const utils = api.useContext();

  // Add refresh mutation
  const refreshClassGroupsMutation = api.campus.refreshClassGroups.useMutation({
    onSuccess: () => {
      void utils.classGroup.getAllClassGroups.invalidate();
    }
  });

  // Update existing refreshData
  const refreshData = useCallback(() => {
    void utils.campus.getAll.invalidate();
    void utils.program.getAll.invalidate();
    void utils.classGroup.getAllClassGroups.invalidate();
    
    if (currentCampus) {
      refreshClassGroupsMutation.mutate({ campusId: currentCampus.id });
    }
  }, [currentCampus, refreshClassGroupsMutation, utils]);

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
```

This implementation:
1. Maintains existing relationships and permissions
2. Uses the existing transaction system for data integrity
3. Leverages the current context system for state management
4. Follows the established error handling patterns
5. Integrates with the existing refresh mechanisms

The changes are minimal and focused on adding the inheritance functionality while maintaining the current architecture. The implementation handles both initial program creation and subsequent updates, ensuring class groups are properly inherited.

Would you like me to explain any specific part in more detail?