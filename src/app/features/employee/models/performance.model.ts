export interface PerformanceInfo {
  id: number;
  employeeId: number;
  evaluationDate: string;
  evaluatorId: number;
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
  evaluationDate: string;
  evaluatorId: number;
  salesPerformance?: number;
  customerSatisfaction?: number;
  taskCompletion?: number;
  attendance?: number;
  overallScore: number;
  comments?: string;
}
