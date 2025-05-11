export interface AuditLogInfo {
  id: number;
  entityName: string;
  entityId: number;
  action: string;
  username: string;
  timestamp: string;
  oldValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
}
