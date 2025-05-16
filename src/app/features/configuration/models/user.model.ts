export interface UserData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: UserRole;
  documentId?: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  lastLogin?: string;
  role: UserRole;
  documentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum UserRole {
  ADMINISTRATOR = 'Administrador',
  EMPLOYEE = 'Empleado',
}
