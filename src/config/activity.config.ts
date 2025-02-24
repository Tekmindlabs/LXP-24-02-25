export const activityConfig = {
  cache: {
    ttl: parseInt(process.env.ACTIVITY_CACHE_TTL || '3600'),
    maxSize: parseInt(process.env.ACTIVITY_CACHE_SIZE || '1000'),
  },
  analytics: {
    defaultMetrics: ['completion', 'timeSpent', 'score'],
    trackingInterval: 5000,
  },
  template: {
    allowedTypes: ['QUIZ', 'ASSIGNMENT', 'PROJECT'],
    maxResources: 10,
  },
};
