export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'EARLY_DEPARTURE'
  | 'ON_LEAVE';

export interface AttendanceInfo {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHours?: number;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceData {
  employeeId: number;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface ClockInData {
  employeeId: number;
  timestamp: string;
  notes?: string;
}

export interface ClockOutData {
  attendanceId: number;
  timestamp: string;
  notes?: string;
}
