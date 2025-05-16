export interface ScheduleInfo {
  id: number;
  userId: number;
  userName: string;
  day?: string;
  startTime: string;
  endTime: string;
  type?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleData {
  userId: number;
  day: string;
  startTime: string;
  endTime: string;
  type?: string;
  isActive?: boolean;
}
