export interface ScheduleInfo {
  id: number;
  employeeId: number;
  employeeName: string;
  day?: string;
  startTime: string;
  endTime: string;
  type?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleData {
  employeeId: number;
  day: string;
  startTime: string;
  endTime: string;
  type?: string;
  isActive?: boolean;
}
