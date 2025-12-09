

const allRoles = {
  admin: [
    'getUsers',
    
  ],
  vendor: [
    'getUsers',
  ],
  customer: [
    'getUsers',
  ],
};

export const roles: string[] = Object.keys(allRoles);

// Normalize allRoles so that each role maps to a string[]
const normalizedRoleRights: [string, string[]][] = [];

for (const [role, rights] of Object.entries(allRoles)) {
  if (Array.isArray(rights)) {
    normalizedRoleRights.push([role, rights]);
  }
}

export const roleRights: Map<string, string[]> = new Map(normalizedRoleRights);
