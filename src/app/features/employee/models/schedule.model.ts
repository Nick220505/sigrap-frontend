export interface ScheduleInfo {
  id: number;
  employeeId: number;
  employeeName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleData {
  employeeId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: string;
  isActive: boolean;
}
