export type ActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'CLOCK_IN'
  | 'CLOCK_OUT'
  | 'VIEW'
  | 'EXPORT'
  | 'OTHER';

export interface ActivityInfo {
  id: number;
  employeeId: number;
  employeeName: string;
  timestamp: string;
  actionType: ActionType;
  description: string;
  moduleName: string;
  entityId?: string;
  ipAddress: string;
  createdAt: string;
}

export interface ActivityData {
  employeeId: number;
  timestamp: string;
  actionType: ActionType;
  description: string;
  moduleName: string;
  entityId?: string;
  ipAddress: string;
}
