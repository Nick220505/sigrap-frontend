import { PermissionInfo } from './permission.model';

export interface RoleData {
  name: string;
  description?: string;
  permissionIds?: number[];
}

export interface RoleInfo {
  id: number;
  name: string;
  description?: string;
  permissions: PermissionInfo[];
  createdAt: string;
  updatedAt: string;
}
