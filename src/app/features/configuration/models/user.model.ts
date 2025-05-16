export interface UserData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  status?: UserStatus;
  role?: UserRole;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: UserStatus;
  lastLogin?: string;
  role: UserRole;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  INACTIVE = 'INACTIVE',
}

export enum UserRole {
  ADMINISTRATOR = 'ADMINISTRATOR',
  EMPLOYEE = 'EMPLOYEE',
}
