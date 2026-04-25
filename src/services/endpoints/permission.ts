export const permissionEndpoints = {
  grant: "/api/permission/grant",
  revoke: "/api/permission/revoke",
  list: (resourceType: string, resourceId: number) => `/api/permission/${resourceType}/${resourceId}`,
};
