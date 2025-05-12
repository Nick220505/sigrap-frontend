export interface AttendanceInfo {
  id: number;
  employeeId: number;
  clockInTime: string;
  clockOutTime?: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceData {
  employeeId: number;
  clockInTime: string;
  clockOutTime?: string;
  status: AttendanceStatus;
  notes?: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
}
