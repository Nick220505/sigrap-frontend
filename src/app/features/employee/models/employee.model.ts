export interface EmployeeInfo {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  documentId?: string;
  phoneNumber?: string;
  email: string;
  hireDate: string;
  terminationDate?: string;
  status: EmployeeStatus;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeData {
  userId: number;
  firstName: string;
  lastName: string;
  documentId?: string;
  phoneNumber?: string;
  email: string;
  hireDate: string;
  terminationDate?: string;
  status: EmployeeStatus;
  profileImageUrl?: string;
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
}
