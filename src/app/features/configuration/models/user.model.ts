import { RoleInfo } from './role.model';

export interface UserData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  status?: UserStatus;
  roleIds?: number[];
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: UserStatus;
  lastLogin?: string;
  roles: RoleInfo[];
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  INACTIVE = 'INACTIVE',
}
