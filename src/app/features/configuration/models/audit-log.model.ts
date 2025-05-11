export interface AuditLogInfo {
  id: number;
  userId: number;
  username: string;
  action: string;
  entityName: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress?: string;
}
