export interface ScheduleInfo {
  id: number;
  employeeId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleData {
  employeeId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}
