export interface NotificationPreferenceData {
  userId: number;
  notificationType: NotificationType;
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

export interface NotificationPreferenceInfo extends NotificationPreferenceData {
  id: number;
}

export enum NotificationType {
  SECURITY = 'SECURITY',
  PRODUCT_UPDATES = 'PRODUCT_UPDATES',
  INVENTORY_ALERTS = 'INVENTORY_ALERTS',
  SYSTEM_NOTIFICATIONS = 'SYSTEM_NOTIFICATIONS',
  ROLE_CHANGES = 'ROLE_CHANGES',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
}
