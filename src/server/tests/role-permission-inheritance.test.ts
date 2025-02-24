import { describe, expect, it } from 'vitest';
import { getHTTPClient } from 'e2e-utils';
import { prisma } from '~/server/db';

const client = getHTTPClient();

describe('Role Permission Inheritance', () => {
  it('should inherit permissions from parent role', async () => {
    // 1. Create a parent role and assign it some permissions.
    const parentRole = await prisma.role.create({
      data: {
        name: 'Parent Role',
        type: 'CORE',
      },
    });

    const permission1 = await prisma.permission.create({
      data: {
        name: 'permission1',
      },
    });

    const permission2 = await prisma.permission.create({
      data: {
        name: 'permission2',
      },
    });

    await prisma.rolePermission.create({
      data: {
        roleId: parentRole.id,
        permissionId: permission1.id,
      },
    });

    await prisma.rolePermission.create({
      data: {
        roleId: parentRole.id,
        permissionId: permission2.id,
      },
    });

    // 2. Create a child role and set its parent to the parent role.
    const childRole = await prisma.role.create({
      data: {
        name: 'Child Role',
        type: 'CAMPUS',
        parentId: parentRole.id,
      },
    });

    // 3. Fetch the inherited permissions for the child role using the `getInheritedPermissions` procedure.
    const inheritedPermissions = await client.role.getInheritedPermissions.query({
      roleId: childRole.id,
    });

    // 4. Verify that the child role inherits the permissions from the parent role.
    expect(inheritedPermissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ permissionId: permission1.id }),
        expect.objectContaining({ permissionId: permission2.id }),
      ])
    );
  });
});
