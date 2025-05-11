export interface PermissionInfo {
  id: number;
  name: string;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionData {
  name: string;
  resource: string;
  action: string;
}
