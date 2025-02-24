export interface ActivityMetrics {
  completionRate: number;
  averageTimeSpent: number;
  averageScore: number;
  // Add other relevant metrics as needed
}

export interface ActivityAnalyticsData {
  activityId: string;
  metrics: ActivityMetrics;
  trackingEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
