import { cache as cacheDb } from "../../db/state";
import { DB } from "../../lib";
import type { IconifyIconData } from "./types";

const CACHE_PREFIX = "icon/";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedIcon {
  data: IconifyIconData;
  ts: number;
}

// In-memory registry of all resolved icons (bundled + loaded)
const registry = new Map<string, IconifyIconData>();
// Pending loads to deduplicate requests
const pending = new Map<string, Promise<IconifyIconData | null>>();
// Listeners for when icons become available
const listeners = new Map<string, Set<() => void>>();
// Batch loading queue
const batchQueue = new Set<string>();
let batchTimer: ReturnType<typeof setTimeout> | null = null;
const BATCH_DELAY = 10; // ms

function flushBatch(): void {
  const icons = Array.from(batchQueue);
  batchQueue.clear();
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }
  if (icons.length === 0) return;

  loadIcons(icons, false).then((results) => {
    for (const [icon, data] of results) {
      if (data) {
        try {
          DB.put(cacheDb, CACHE_PREFIX + icon, {
            data,
            ts: Date.now(),
          } as CachedIcon);
        } catch {
          // Cache write failure is not critical
        }
      }
    }
  });
}

export function getIcon(icon: string): IconifyIconData | undefined {
  return registry.get(icon);
}

export function registerIcon(icon: string, data: IconifyIconData): void {
  registry.set(icon, data);
  const set = listeners.get(icon);
  if (set) {
    set.forEach((fn) => fn());
    listeners.delete(icon);
  }
}

export function onIconLoaded(icon: string, cb: () => void): () => void {
  let set = listeners.get(icon);
  if (!set) {
    set = new Set();
    listeners.set(icon, set);
  }
  set.add(cb);
  return () => {
    set!.delete(cb);
    if (set!.size === 0) listeners.delete(icon);
  };
}

/**
 * Load an icon dynamically. Checks cache DB first, then fetches from API.
 * Uses batched requests for better performance when multiple icons are requested.
 * @param icon - Full icon ID like "feather:settings"
 * @param persist - Whether to persist to cache DB (default true). Set false for picker icons.
 */
export async function loadIcon(
  icon: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _persist = true,
): Promise<IconifyIconData | null> {
  if (registry.has(icon)) return registry.get(icon)!;

  const cached = DB.get(cacheDb, CACHE_PREFIX + icon) as CachedIcon | undefined;
  if (cached?.data && cached.ts && Date.now() - cached.ts < CACHE_TTL) {
    registerIcon(icon, cached.data);
    return cached.data;
  }

  if (pending.has(icon)) return pending.get(icon)!;

  batchQueue.add(icon);
  if (!batchTimer) {
    batchTimer = setTimeout(flushBatch, BATCH_DELAY);
  }

  const promise = new Promise<IconifyIconData | null>((resolve) => {
    const unsub = onIconLoaded(icon, () => {
      unsub();
      resolve(registry.get(icon) ?? null);
    });
  });

  pending.set(icon, promise);
  return promise;
}

/**
 * Load multiple icons in a single batched API request.
 * @param icons - Array of full icon IDs like "feather:settings"
 * @param persist - Whether to persist to cache DB (default false). Set false for picker icons.
 */
export async function loadIcons(
  icons: string[],
  persist = false,
): Promise<Map<string, IconifyIconData | null>> {
  const result = new Map<string, IconifyIconData | null>();

  const uncached: string[] = [];
  for (const icon of icons) {
    if (registry.has(icon)) {
      result.set(icon, registry.get(icon)!);
      continue;
    }

    const cached = DB.get(cacheDb, CACHE_PREFIX + icon) as
      | CachedIcon
      | undefined;
    if (cached?.data && cached.ts && Date.now() - cached.ts < CACHE_TTL) {
      registerIcon(icon, cached.data);
      result.set(icon, cached.data);
      continue;
    }

    uncached.push(icon);
  }

  if (uncached.length === 0) return result;

  const byPrefix = new Map<string, string[]>();
  for (const icon of uncached) {
    const colonIdx = icon.indexOf(":");
    if (colonIdx === -1) {
      result.set(icon, null);
      continue;
    }
    const prefix = icon.substring(0, colonIdx);
    const name = icon.substring(colonIdx + 1);
    let existing = byPrefix.get(prefix);
    if (!existing) {
      existing = [];
      byPrefix.set(prefix, existing);
    }
    existing.push(name);
  }

  await Promise.all(
    Array.from(byPrefix.entries()).map(async ([prefix, names]) => {
      if (names.length === 0) return;

      const joined = names.join(",");
      try {
        const res = await fetch(
          `https://api.iconify.design/${prefix}.json?icons=${joined}`,
        );
        if (!res.ok) {
          for (const name of names) {
            result.set(`${prefix}:${name}`, null);
          }
          return;
        }

        const json = await res.json();
        const iconEntries = Object.entries(json.icons ?? {}) as [
          string,
          IconifyIconData,
        ][];

        for (const [name, iconData] of iconEntries) {
          const icon = `${prefix}:${name}`;
          const data: IconifyIconData = {
            body: iconData.body,
            width: iconData.width ?? json.width ?? 16,
            height: iconData.height ?? json.height ?? 16,
            left: iconData.left ?? json.left ?? 0,
            top: iconData.top ?? json.top ?? 0,
          };

          registerIcon(icon, data);
          result.set(icon, data);

          if (persist) {
            try {
              DB.put(cacheDb, CACHE_PREFIX + icon, {
                data,
                ts: Date.now(),
              } as CachedIcon);
            } catch {
              // Cache write failure is not critical
            }
          }
        }

        for (const name of names) {
          if (!result.has(`${prefix}:${name}`)) {
            result.set(`${prefix}:${name}`, null);
          }
        }
      } catch {
        for (const name of names) {
          result.set(`${prefix}:${name}`, null);
        }
      }
    }),
  );

  return result;
}

/**
 * Fetch the list of icon names for a given prefix from the Iconify API.
 */
export async function fetchCollectionNames(prefix: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.iconify.design/collection?prefix=${prefix}`,
    );
    if (!res.ok) return [];
    const json = await res.json();

    const names = new Set<string>();
    if (json.uncategorized) {
      for (const name of json.uncategorized) names.add(name);
    }
    if (json.categories) {
      for (const cat of Object.values(json.categories) as string[][]) {
        for (const name of cat) names.add(name);
      }
    }
    return Array.from(names).sort();
  } catch {
    return [];
  }
}
