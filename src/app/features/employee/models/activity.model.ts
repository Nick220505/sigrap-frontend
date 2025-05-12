export interface ActivityInfo {
  id: number;
  employeeId: number;
  activityType: ActivityType;
  timestamp: string;
  description: string;
  ipAddress?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityData {
  employeeId: number;
  activityType: ActivityType;
  timestamp: string;
  description: string;
  ipAddress?: string;
  location?: string;
}

export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SALE = 'SALE',
  INVENTORY_UPDATE = 'INVENTORY_UPDATE',
  TASK_COMPLETE = 'TASK_COMPLETE',
  SYSTEM_ACTION = 'SYSTEM_ACTION',
}
