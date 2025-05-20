export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'EARLY_DEPARTURE'
  | 'ON_LEAVE';

export interface AttendanceInfo {
  id: number;
  userId: number;
  userName: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHours?: number;
  status: AttendanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceData {
  userId: number;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  status: AttendanceStatus;
}

export interface ClockInData {
  userId: number;
}

export interface ClockOutData {
  attendanceId: number;
}
