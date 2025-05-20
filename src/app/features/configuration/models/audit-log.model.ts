export interface AuditLogInfo {
  id: number;
  username: string;
  action: string;
  entityName: string;
  entityId: string | null;
  timestamp: string;
  sourceIp: string | null;
  userAgent: string | null;
  details: string | null;
  status: string;
  durationMs: number | null;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
}
