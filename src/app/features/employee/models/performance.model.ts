export interface PerformanceInfo {
  id: number;
  employeeId: number;
  employeeName: string;
  evaluatorId: number;
  evaluatorName: string;
  period: string;
  rating: number;
  evaluationDate: string;
  salesPerformance?: number;
  customerSatisfaction?: number;
  taskCompletion?: number;
  attendance?: number;
  overallScore: number;
  comments?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PerformanceData {
  employeeId: number;
  evaluatorId: number;
  period: string;
  rating: number;
  evaluationDate: string;
  salesPerformance?: number;
  customerSatisfaction?: number;
  taskCompletion?: number;
  attendance?: number;
  overallScore: number;
  comments?: string;
}
