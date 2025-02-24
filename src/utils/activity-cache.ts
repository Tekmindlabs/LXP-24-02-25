import { BaseConfiguration, UnifiedActivity } from '@/types/class-activity';
import NodeCache from 'node-cache';
import { activityConfig } from '@/config/activity.config';

class ActivityCacheManager {
  private cache: NodeCache;
  private templates: Map<string, UnifiedActivity>;
  private commonConfigs: Map<string, BaseConfiguration>;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: activityConfig.cache.ttl,
      maxKeys: activityConfig.cache.maxSize,
      checkperiod: 600
    });
    this.templates = new Map();
    this.commonConfigs = new Map();

    // Setup cache error handling
    this.cache.on('error', (err) => {
      console.error('Cache error:', err);
    });
  }

  async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.cache.get<T>(key);
    if (cached) return cached;

    const data = await fetchFn();
    this.cache.set(key, data, ttl);
    return data;
  }

  async getTemplate(templateId: string): Promise<UnifiedActivity | null> {
    const cacheKey = `template:${templateId}`;
    return this.getOrFetch(cacheKey, async () => {
      const template = this.templates.get(templateId);
      return template || null;
    });
  }

  setTemplate(templateId: string, template: UnifiedActivity): void {
    const cacheKey = `template:${templateId}`;
    this.templates.set(templateId, template);
    this.cache.set(cacheKey, template);
  }

  getCommonConfig(configKey: string): BaseConfiguration | null {
    const cacheKey = `config:${configKey}`;
    return this.cache.get(cacheKey) || this.commonConfigs.get(configKey) || null;
  }

  setCommonConfig(configKey: string, config: BaseConfiguration): void {
    const cacheKey = `config:${configKey}`;
    this.commonConfigs.set(configKey, config);
    this.cache.set(cacheKey, config);
  }

  invalidate(key: string): void {
    this.cache.del(key);
    if (key.startsWith('template:')) {
      const templateId = key.replace('template:', '');
      this.templates.delete(templateId);
    } else if (key.startsWith('config:')) {
      const configKey = key.replace('config:', '');
      this.commonConfigs.delete(configKey);
    }
  }

  invalidatePattern(pattern: string): void {
    const keys = this.cache.keys().filter((k: string) => k.includes(pattern));
    keys.forEach((k: string) => this.invalidate(k));
  }

  clear(): void {
    this.cache.flushAll();
    this.templates.clear();
    this.commonConfigs.clear();
  }

  getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }
}

export const activityCache = new ActivityCacheManager();
