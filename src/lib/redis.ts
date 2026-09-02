import { Redis } from '@upstash/redis';

// In-memory fallback cache for development or when Upstash Redis is not yet configured
class MemoryStorage {
  private store: Map<string, any> = new Map();
  private sortedSets: Map<string, Map<string, number>> = new Map();

  async get<T = any>(key: string): Promise<T | null> {
    const val = this.store.get(key);
    if (val === undefined) return null;
    return typeof val === 'string' ? JSON.parse(val) : val;
  }

  async set(key: string, value: any): Promise<'OK'> {
    this.store.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.delete(key);
    return existed ? 1 : 0;
  }

  async zadd(key: string, scoreMember: { score: number; member: string }): Promise<number> {
    if (!this.sortedSets.has(key)) {
      this.sortedSets.set(key, new Map());
    }
    const set = this.sortedSets.get(key)!;
    set.set(scoreMember.member, scoreMember.score);
    return 1;
  }

  async zrange(key: string, start: number, stop: number, opts?: { rev?: boolean; withScores?: boolean }): Promise<any[]> {
    const set = this.sortedSets.get(key);
    if (!set) return [];

    const entries = Array.from(set.entries()).sort((a, b) => (opts?.rev ? b[1] - a[1] : a[1] - b[1]));
    const slice = entries.slice(start, stop === -1 ? undefined : stop + 1);

    if (opts?.withScores) {
      const flat: any[] = [];
      for (const [member, score] of slice) {
        flat.push(member, score);
      }
      return flat;
    }

    return slice.map((e) => e[0]);
  }
}

const isRedisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('your-upstash')
);

export const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : (new MemoryStorage() as unknown as Redis);

export const isUsingUpstash = isRedisConfigured;
