const SEED_MALE = [
  "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
  "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua",
  "Kenneth", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan",
  "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon",
  "Benjamin", "Samuel", "Gregory", "Frank", "Alexander", "Raymond", "Patrick", "Jack", "Dennis", "Jerry"
];

const SEED_FEMALE = [
  "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
  "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle",
  "Dorothy", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia",
  "Kathleen", "Amy", "Shirley", "Angela", "Helen", "Anna", "Brenda", "Pamela", "Nicole", "Emma",
  "Samantha", "Katherine", "Christine", "Debra", "Rachel", "Catherine", "Carolyn", "Janet", "Ruth", "Maria"
];

const SEED_LAST = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
];

interface ByteShard {
  bytes: Uint8Array;
  starts: Uint32Array;
  ends: Uint32Array;
  count: number;
}

interface OnlineNamePool {
  male: string[];
  female: string[];
  last: string[];
  updatedAt: number;
}

export type PoolSource = 'online+local' | 'local-file' | 'seed';

export interface NameDatabaseStats {
  source: PoolSource;
  totalNames: number;
  onlineCount: number;
  localCount: number;
}

const ONLINE_CACHE_KEY = 'identitygen-online-name-pool-v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ONLINE_PER_BUCKET = 600;
const RANDOMUSER_URL =
  'https://randomuser.me/api/?results=300&inc=name,gender&nat=us,gb,ca,au,de,fr,es,br,nl,nz,ie,dk,no,fi,ch&noinfo';

const utf8Decoder = new TextDecoder('utf-8');

let localMaleShard: ByteShard | null = null;
let localFemaleShard: ByteShard | null = null;
let localLastShard: ByteShard | null = null;

let onlinePool: OnlineNamePool | null = loadCachedOnlinePool();
let initPromise: Promise<void> | null = null;
let onlineFetchInFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

function buildByteShard(buffer: ArrayBuffer): ByteShard {
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  // Pass 1: count valid non-empty lines
  let lineCount = 0;
  let lineStart = 0;
  for (let i = 0; i <= len; i++) {
    if (i === len || bytes[i] === 10) {
      let end = i;
      if (end > lineStart && bytes[end - 1] === 13) end--;
      if (end > lineStart) lineCount++;
      lineStart = i + 1;
    }
  }

  const starts = new Uint32Array(lineCount);
  const ends = new Uint32Array(lineCount);
  let idx = 0;
  lineStart = 0;

  // Pass 2: store exact byte offsets without allocating JS strings
  for (let i = 0; i <= len; i++) {
    if (i === len || bytes[i] === 10) {
      let end = i;
      if (end > lineStart && bytes[end - 1] === 13) end--;
      if (end > lineStart) {
        starts[idx] = lineStart;
        ends[idx] = end;
        idx++;
      }
      lineStart = i + 1;
    }
  }

  return { bytes, starts, ends, count: idx };
}

function sampleFromShard(shard: ByteShard | null, fallback: string[]): string {
  if (!shard || shard.count === 0) {
    return fallback[Math.floor(Math.random() * fallback.length)];
  }
  const idx = Math.floor(Math.random() * shard.count);
  const slice = shard.bytes.subarray(shard.starts[idx], shard.ends[idx]);
  return utf8Decoder.decode(slice);
}

function loadCachedOnlinePool(): OnlineNamePool | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ONLINE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnlineNamePool;
    if (
      !parsed ||
      !Array.isArray(parsed.male) ||
      !Array.isArray(parsed.female) ||
      !Array.isArray(parsed.last) ||
      typeof parsed.updatedAt !== 'number'
    ) {
      return null;
    }
    if (Date.now() - parsed.updatedAt > CACHE_TTL_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveCachedOnlinePool(pool: OnlineNamePool) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ONLINE_CACHE_KEY, JSON.stringify(pool));
  } catch {
    // Ignore quota or storage errors
  }
}

function cleanDisplayName(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Normalize diacritics check: ensure at least 2 ASCII letters remain for email generation
  const ascii = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '');
  if (ascii.length < 2) return null;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

async function fetchLocalShard(url: string): Promise<ByteShard | null> {
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return buildByteShard(buf);
  } catch {
    return null;
  }
}

async function loadLocalShards(): Promise<void> {
  if (localMaleShard && localFemaleShard && localLastShard) return;
  const [male, female, last] = await Promise.all([
    localMaleShard ? Promise.resolve(localMaleShard) : fetchLocalShard('/data/male.txt'),
    localFemaleShard ? Promise.resolve(localFemaleShard) : fetchLocalShard('/data/female.txt'),
    localLastShard ? Promise.resolve(localLastShard) : fetchLocalShard('/data/last.txt'),
  ]);
  if (male) localMaleShard = male;
  if (female) localFemaleShard = female;
  if (last) localLastShard = last;
  notifyListeners();
}

export async function refreshOnlineNamePool(force = false): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
  if (!force && onlinePool && Date.now() - onlinePool.updatedAt < CACHE_TTL_MS) {
    return true;
  }
  if (onlineFetchInFlight) {
    await onlineFetchInFlight;
    return Boolean(onlinePool);
  }

  onlineFetchInFlight = (async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(RANDOMUSER_URL, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        results?: Array<{
          gender?: string;
          name?: { first?: string; last?: string };
        }>;
      };
      if (!Array.isArray(data.results)) return;

      const maleSet = new Set<string>(onlinePool?.male ?? []);
      const femaleSet = new Set<string>(onlinePool?.female ?? []);
      const lastSet = new Set<string>(onlinePool?.last ?? []);

      for (const entry of data.results) {
        const first = entry.name?.first ? cleanDisplayName(entry.name.first) : null;
        const last = entry.name?.last ? cleanDisplayName(entry.name.last) : null;
        if (first) {
          if (entry.gender === 'female' && femaleSet.size < MAX_ONLINE_PER_BUCKET) {
            femaleSet.add(first);
          } else if (entry.gender === 'male' && maleSet.size < MAX_ONLINE_PER_BUCKET) {
            maleSet.add(first);
          }
        }
        if (last && lastSet.size < MAX_ONLINE_PER_BUCKET) {
          lastSet.add(last);
        }
      }

      if (maleSet.size > 0 && femaleSet.size > 0 && lastSet.size > 0) {
        onlinePool = {
          male: Array.from(maleSet),
          female: Array.from(femaleSet),
          last: Array.from(lastSet),
          updatedAt: Date.now(),
        };
        saveCachedOnlinePool(onlinePool);
        notifyListeners();
      }
    } catch {
      // Silent fallback to local .txt shards on network error or timeout
    } finally {
      window.clearTimeout(timeoutId);
      onlineFetchInFlight = null;
    }
  })();

  await onlineFetchInFlight;
  return Boolean(onlinePool);
}

export function initNameDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = Promise.all([
      loadLocalShards(),
      refreshOnlineNamePool(false),
    ]).then(() => undefined);
  }
  return initPromise;
}

export function subscribeNameDatabase(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getNameDatabaseStats(): NameDatabaseStats {
  const localCount =
    (localMaleShard?.count ?? 0) +
    (localFemaleShard?.count ?? 0) +
    (localLastShard?.count ?? 0);

  const onlineCount = onlinePool
    ? onlinePool.male.length + onlinePool.female.length + onlinePool.last.length
    : 0;

  if (onlineCount > 0) {
    return {
      source: 'online+local',
      totalNames: onlineCount + localCount,
      onlineCount,
      localCount,
    };
  }
  if (localCount > 0) {
    return {
      source: 'local-file',
      totalNames: localCount,
      onlineCount: 0,
      localCount,
    };
  }
  return {
    source: 'seed',
    totalNames: SEED_MALE.length + SEED_FEMALE.length + SEED_LAST.length,
    onlineCount: 0,
    localCount: 0,
  };
}

export function sampleFirstName(gender: 'male' | 'female'): string {
  const onlineList =
    gender === 'female' ? onlinePool?.female : onlinePool?.male;
  const shard = gender === 'female' ? localFemaleShard : localMaleShard;
  const seed = gender === 'female' ? SEED_FEMALE : SEED_MALE;

  if (onlineList && onlineList.length > 0) {
    const shardCount = shard?.count ?? 0;
    const total = onlineList.length + shardCount;
    const pick = Math.floor(Math.random() * total);
    if (pick < onlineList.length) {
      return onlineList[pick];
    }
    return sampleFromShard(shard, seed);
  }

  return sampleFromShard(shard, seed);
}

export function sampleLastName(): string {
  if (onlinePool && onlinePool.last.length > 0) {
    const shardCount = localLastShard?.count ?? 0;
    const total = onlinePool.last.length + shardCount;
    const pick = Math.floor(Math.random() * total);
    if (pick < onlinePool.last.length) {
      return onlinePool.last[pick];
    }
    return sampleFromShard(localLastShard, SEED_LAST);
  }

  return sampleFromShard(localLastShard, SEED_LAST);
}
