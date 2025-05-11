export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export enum NotificationChannel {
  IMMEDIATE = 'IMMEDIATE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export interface NotificationPreferenceInfo {
  id: number;
  userId: number;
  notificationType: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface NotificationPreferenceData {
  userId: number;
  notificationType: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}
