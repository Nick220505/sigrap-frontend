export interface EmployeeInfo {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  documentId?: string;
  phoneNumber?: string;
  email: string;
  terminationDate?: string;
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
  terminationDate?: string;
  profileImageUrl?: string;
}
